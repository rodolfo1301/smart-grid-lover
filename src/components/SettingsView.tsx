import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Trash2, Bell, BellOff, CheckCircle2 } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

const loadStr = (key: string, fallback: string) => localStorage.getItem(key) ?? fallback;
const loadBool = (key: string, fallback: boolean) => {
  const v = localStorage.getItem(key);
  return v !== null ? v === "true" : fallback;
};

const SettingsView = () => {
  const { permission, requestPermission } = useNotifications();

  const [notif2h, setNotif2h] = useState(localStorage.getItem("wattly_notif_2h") !== "false");
  const [notifNow, setNotifNow] = useState(localStorage.getItem("wattly_notif_now") !== "false");
  const [notif30m, setNotif30m] = useState(localStorage.getItem("wattly_notif_30m") !== "false");
  const [notifExpNow, setNotifExpNow] = useState(localStorage.getItem("wattly_notif_exp_now") !== "false");
  const [cheapVal, setCheapVal] = useState(Number(localStorage.getItem("wattly_notif_cheap") || "5"));
  const [expVal, setExpVal] = useState(Number(localStorage.getItem("wattly_notif_expensive") || "15"));

  const [name, setName] = useState(() => loadStr("wattly_userName", ""));
  const [pvCapacity, setPvCapacity] = useState(() => loadStr("wattly_pvCapacity", "8.5"));
  const [tariff, setTariff] = useState(() => loadStr("wattly_tariff", "unknown"));
  const [gridPrice, setGridPrice] = useState(() => loadStr("wattly_fixedPrice", "30"));
  const [tariffType, setTariffType] = useState(() => loadStr("wattly_tariff_type", "dynamic"));
  const [fixedPrice, setFixedPrice] = useState(() => loadStr("wattly_fixed_price", "28"));
  const [notifPrice, setNotifPrice] = useState(() => loadStr("wattly_notifPrice", "true") === "true");
  const [notifDevices, setNotifDevices] = useState(() => loadStr("wattly_notifDevices", "true") === "true");
  const [saved, setSaved] = useState(false);

  const save = () => {
    localStorage.setItem("wattly_userName", name);
    localStorage.setItem("wattly_pvCapacity", pvCapacity);
    localStorage.setItem("wattly_tariff", tariff);
    localStorage.setItem("wattly_fixedPrice", gridPrice);
    localStorage.setItem("wattly_notifPrice", String(notifPrice));
    localStorage.setItem("wattly_notifDevices", String(notifDevices));
    localStorage.setItem("wattly_tariff_type", tariffType);
    localStorage.setItem("wattly_fixed_price", fixedPrice);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetAll = () => {
    if (!window.confirm("Alle WATTLY-Daten wirklich zurücksetzen?")) return;
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("wattly_"));
    keys.forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  };

  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <h2 className="text-lg font-bold text-foreground">Einstellungen</h2>

      {/* Push Notifications */}
      <section className="bg-gradient-card border border-border rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4" /> Benachrichtigungen
        </h3>

        {permission === "default" && (
          <Button
            onClick={requestPermission}
            className="w-full gap-2 bg-primary hover:bg-primary/90"
          >
            🔔 Benachrichtigungen aktivieren
          </Button>
        )}

        {permission === "granted" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Benachrichtigungen aktiv</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">2h Vorwarnung bei günstigem Strom</span>
                <Switch
                  checked={notif2hCheap}
                  onCheckedChange={(v) => toggleNotifPref("wattly_notif_2h_cheap", v, setNotif2hCheap)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Sofort-Alert bei günstigem Strom</span>
                <Switch
                  checked={notifNowCheap}
                  onCheckedChange={(v) => toggleNotifPref("wattly_notif_now_cheap", v, setNotifNowCheap)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">30min Warnung vor teurem Strom</span>
                <Switch
                  checked={notif30mExpensive}
                  onCheckedChange={(v) => toggleNotifPref("wattly_notif_30m_expensive", v, setNotif30mExpensive)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Sofort-Alert bei teurem Strom</span>
                <Switch
                  checked={notifNowExpensive}
                  onCheckedChange={(v) => toggleNotifPref("wattly_notif_now_expensive", v, setNotifNowExpensive)}
                />
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-xs text-muted-foreground">
                  Günstig-Schwellwert: <span className="font-mono font-medium text-foreground">{cheapThreshold} ct/kWh</span>
                </Label>
                <Slider
                  value={[cheapThreshold]}
                  onValueChange={([v]) => {
                    setCheapThreshold(v);
                    localStorage.setItem("wattly_notif_cheap_threshold", String(v));
                  }}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Teuer-Schwellwert: <span className="font-mono font-medium text-foreground">{expensiveThreshold} ct/kWh</span>
                </Label>
                <Slider
                  value={[expensiveThreshold]}
                  onValueChange={([v]) => {
                    setExpensiveThreshold(v);
                    localStorage.setItem("wattly_notif_expensive_threshold", String(v));
                  }}
                  min={10}
                  max={30}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {permission === "denied" && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <BellOff className="w-5 h-5" />
            <p className="text-sm">
              Benachrichtigungen wurden blockiert. Bitte in den Browser-Einstellungen aktivieren.
            </p>
          </div>
        )}
      </section>

      {/* Mein Tarif */}
      <section className="bg-gradient-card border border-border rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Mein Tarif</h3>
        <RadioGroup value={tariffType} onValueChange={setTariffType} className="space-y-2">
          {[
            { value: "dynamic", label: "⚡ Börsenstromtarif (aWATTar / Tibber)" },
            { value: "fixed", label: "📋 Fixer Tarif" },
          ].map((t) => (
            <label
              key={t.value}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                tariffType === t.value ? "border-primary bg-primary/10" : "border-border"
              }`}
            >
              <RadioGroupItem value={t.value} />
              <span className="text-sm text-foreground">{t.label}</span>
            </label>
          ))}
        </RadioGroup>
        {tariffType === "fixed" && (
          <div className="space-y-2 pt-1">
            <Label className="text-xs text-muted-foreground">Mein aktueller Strompreis</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={fixedPrice}
                onChange={(e) => setFixedPrice(e.target.value)}
                placeholder="28"
                className="font-mono flex-1"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">ct/kWh</span>
            </div>
          </div>
        )}
      </section>

      {/* Profile */}
      <section className="bg-gradient-card border border-border rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Profil</h3>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dein Name" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">PV-Kapazität (kWp)</Label>
          <Input type="number" value={pvCapacity} onChange={(e) => setPvCapacity(e.target.value)} />
        </div>
      </section>

      {/* Tariff */}
      <section className="bg-gradient-card border border-border rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Stromtarif</h3>
        <RadioGroup value={tariff} onValueChange={setTariff} className="space-y-2">
          {[
            { value: "fixed", label: "Fixer Tarif" },
            { value: "awattar", label: "aWATTar" },
            { value: "tibber", label: "Tibber" },
            { value: "unknown", label: "Weiß ich nicht" },
          ].map((t) => (
            <label
              key={t.value}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                tariff === t.value ? "border-primary bg-primary/10" : "border-border"
              }`}
            >
              <RadioGroupItem value={t.value} />
              <span className="text-sm text-foreground">{t.label}</span>
            </label>
          ))}
        </RadioGroup>
        {tariff === "fixed" && (
          <div className="space-y-2 pt-1">
            <Label className="text-xs text-muted-foreground">Aktueller Netzpreis (ct/kWh)</Label>
            <Input type="number" value={gridPrice} onChange={(e) => setGridPrice(e.target.value)} className="font-mono" />
          </div>
        )}
      </section>

      {/* Notifications */}
      <section className="bg-gradient-card border border-border rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Benachrichtigungen</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">Preisalarme</span>
          <Switch checked={notifPrice} onCheckedChange={setNotifPrice} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">Geräte-Benachrichtigungen</span>
          <Switch checked={notifDevices} onCheckedChange={setNotifDevices} />
        </div>
      </section>

      {/* Mode switch */}
      <section className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Modus</h3>
        <p className="text-sm text-muted-foreground">
          Aktuell: <span className="font-medium text-foreground">{localStorage.getItem("wattly_mode") === "basis" ? "Basis-Modus" : "Voll-Modus"}</span>
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            localStorage.removeItem("wattly_mode");
            localStorage.removeItem("wattly_onboarded");
            window.location.reload();
          }}
        >
          Modus wechseln (Onboarding neu starten)
        </Button>
      </section>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button onClick={save} className="w-full">
          {saved ? "✓ Gespeichert" : "Einstellungen speichern"}
        </Button>
        <Button variant="destructive" onClick={resetAll} className="w-full gap-2">
          <Trash2 className="w-4 h-4" /> Daten zurücksetzen
        </Button>
      </div>
    </motion.div>
  );
};

export default SettingsView;
