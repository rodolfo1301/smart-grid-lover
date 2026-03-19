import { useState } from "react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sun, Battery, Car, Thermometer, Clock, Zap, TrendingDown, Save, RotateCcw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  condition: string;
  action: string;
}

const deviceConfigs: Record<string, {
  name: string;
  icon: React.ReactNode;
  color: string;
  status: string;
  power: string;
  settings: React.ReactNode;
  automationRules: AutomationRule[];
}> = {};

// We'll build settings per device type below in the component

const DeviceDetailPage = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();

  if (!deviceId) return null;

  const deviceMap: Record<string, { name: string; icon: React.ReactNode; color: string; status: string; power: string }> = {
    pv: { name: "PV-Anlage", icon: <Sun className="w-6 h-6" />, color: "text-warning", status: "Produziert aktiv", power: "3.8 kW" },
    battery: { name: "Heimspeicher", icon: <Battery className="w-6 h-6" />, color: "text-primary", status: "Laden · 92%", power: "10.4 kWh" },
    ev: { name: "E-Auto", icon: <Car className="w-6 h-6" />, color: "text-accent", status: "Verbunden · 67%", power: "45 kWh" },
    heatpump: { name: "Wärmepumpe", icon: <Thermometer className="w-6 h-6" />, color: "text-destructive", status: "Heizen · 22°C", power: "2.1 kW" },
  };

  const device = deviceMap[deviceId];
  if (!device) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className={`p-2.5 rounded-lg bg-primary/15 ${device.color}`}>{device.icon}</div>
          <div>
            <h1 className="text-lg font-bold text-foreground">{device.name}</h1>
            <p className="text-xs text-muted-foreground">{device.status} · {device.power}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {deviceId === "pv" && <PVSettings />}
        {deviceId === "battery" && <BatterySettings />}
        {deviceId === "ev" && <EVSettings />}
        {deviceId === "heatpump" && <HeatpumpSettings />}
      </main>
    </div>
  );
};

// ─── PV Settings ──────────────────────────────────────────
const PVSettings = () => {
  const [feedInLimit, setFeedInLimit] = useState(70);
  const [smartFeedIn, setSmartFeedIn] = useState(true);
  const [priceThreshold, setPriceThreshold] = useState("10");
  const [rules, setRules] = useState<AutomationRule[]>([
    { id: "1", name: "Einspeisen bei Höchstpreis", enabled: true, condition: "Strompreis > 12 ct/kWh", action: "Überschuss einspeisen" },
    { id: "2", name: "Speicher priorisieren", enabled: true, condition: "Speicher < 80%", action: "PV → Speicher laden" },
    { id: "3", name: "WP bei Überschuss", enabled: false, condition: "PV > 3 kW & WP aus", action: "Wärmepumpe aktivieren" },
  ]);

  return (
    <>
      <SettingsSection title="Einspeise-Einstellungen" icon={<Zap className="w-4 h-4" />}>
        <SettingRow label="Einspeisebegrenzung" description="Maximale Einspeiseleistung in % der Nennleistung">
          <div className="w-48 space-y-2">
            <Slider value={[feedInLimit]} onValueChange={([v]) => setFeedInLimit(v)} max={100} step={5} />
            <span className="text-xs text-muted-foreground font-mono-numbers">{feedInLimit}%</span>
          </div>
        </SettingRow>
        <Separator className="bg-border" />
        <SettingRow label="Smart Einspeisung" description="Einspeiseverhalten nach Börsenstrompreis steuern">
          <Switch checked={smartFeedIn} onCheckedChange={setSmartFeedIn} />
        </SettingRow>
        {smartFeedIn && (
          <>
            <Separator className="bg-border" />
            <SettingRow label="Preis-Schwellwert" description="Einspeisen erst ab diesem Börsenstrompreis">
              <div className="flex items-center gap-2">
                <Input value={priceThreshold} onChange={(e) => setPriceThreshold(e.target.value)} className="w-20 text-right font-mono-numbers bg-secondary border-border" />
                <span className="text-xs text-muted-foreground">ct/kWh</span>
              </div>
            </SettingRow>
          </>
        )}
      </SettingsSection>
      <AutomationSection rules={rules} onToggle={(id) => setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))} />
      <SaveBar />
    </>
  );
};

// ─── Battery Settings ─────────────────────────────────────
const BatterySettings = () => {
  const [minSoC, setMinSoC] = useState(10);
  const [maxSoC, setMaxSoC] = useState(95);
  const [chargePower, setChargePower] = useState(5);
  const [gridCharging, setGridCharging] = useState(true);
  const [priceLimit, setPriceLimit] = useState("5");
  const [rules, setRules] = useState<AutomationRule[]>([
    { id: "1", name: "Netz-Laden bei Niedrigpreis", enabled: true, condition: "Strompreis < 3 ct/kWh", action: "Aus Netz laden" },
    { id: "2", name: "Entladen bei Spitzenlast", enabled: true, condition: "Strompreis > 15 ct/kWh & SoC > 30%", action: "Einspeisung aus Speicher" },
    { id: "3", name: "Notreserve halten", enabled: true, condition: "SoC < 10%", action: "Entladung stoppen" },
  ]);

  return (
    <>
      <SettingsSection title="Lade-Einstellungen" icon={<Battery className="w-4 h-4" />}>
        <SettingRow label="Min. Ladezustand (SoC)" description="Speicher entlädt nicht unter diesen Wert">
          <div className="w-48 space-y-2">
            <Slider value={[minSoC]} onValueChange={([v]) => setMinSoC(v)} max={50} step={5} />
            <span className="text-xs text-muted-foreground font-mono-numbers">{minSoC}%</span>
          </div>
        </SettingRow>
        <Separator className="bg-border" />
        <SettingRow label="Max. Ladezustand (SoC)" description="Speicher lädt nicht über diesen Wert">
          <div className="w-48 space-y-2">
            <Slider value={[maxSoC]} onValueChange={([v]) => setMaxSoC(v)} min={50} max={100} step={5} />
            <span className="text-xs text-muted-foreground font-mono-numbers">{maxSoC}%</span>
          </div>
        </SettingRow>
        <Separator className="bg-border" />
        <SettingRow label="Max. Ladeleistung" description="Maximale Leistung beim Laden">
          <div className="w-48 space-y-2">
            <Slider value={[chargePower]} onValueChange={([v]) => setChargePower(v)} min={1} max={10} step={0.5} />
            <span className="text-xs text-muted-foreground font-mono-numbers">{chargePower} kW</span>
          </div>
        </SettingRow>
        <Separator className="bg-border" />
        <SettingRow label="Netz-Laden erlauben" description="Speicher darf bei günstigen Preisen aus dem Netz laden">
          <Switch checked={gridCharging} onCheckedChange={setGridCharging} />
        </SettingRow>
        {gridCharging && (
          <>
            <Separator className="bg-border" />
            <SettingRow label="Max. Preis für Netz-Laden" description="Nur laden wenn Börsenstrompreis unter diesem Wert">
              <div className="flex items-center gap-2">
                <Input value={priceLimit} onChange={(e) => setPriceLimit(e.target.value)} className="w-20 text-right font-mono-numbers bg-secondary border-border" />
                <span className="text-xs text-muted-foreground">ct/kWh</span>
              </div>
            </SettingRow>
          </>
        )}
      </SettingsSection>
      <AutomationSection rules={rules} onToggle={(id) => setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))} />
      <SaveBar />
    </>
  );
};

// ─── EV Settings ──────────────────────────────────────────
const EVSettings = () => {
  const [targetSoC, setTargetSoC] = useState(80);
  const [maxChargePower, setMaxChargePower] = useState(11);
  const [departureTimes, setDepartureTimes] = useState([{ day: "Mo-Fr", time: "07:30" }, { day: "Sa-So", time: "10:00" }]);
  const [smartCharging, setSmartCharging] = useState(true);
  const [maxPrice, setMaxPrice] = useState("8");
  const [pvOnly, setPvOnly] = useState(false);
  const [rules, setRules] = useState<AutomationRule[]>([
    { id: "1", name: "Preisoptimiertes Laden", enabled: true, condition: "Strompreis < 5 ct/kWh", action: "Laden mit max. Leistung" },
    { id: "2", name: "PV-Überschussladen", enabled: true, condition: "PV-Überschuss > 2 kW", action: "Laden mit Überschuss" },
    { id: "3", name: "Abfahrtsbereit", enabled: true, condition: "Abfahrt in 2h & SoC < Ziel", action: "Laden erzwingen" },
    { id: "4", name: "V2H Einspeisung", enabled: false, condition: "Strompreis > 20 ct/kWh & SoC > 50%", action: "Vehicle-to-Home aktiv" },
  ]);

  return (
    <>
      <SettingsSection title="Lade-Einstellungen" icon={<Car className="w-4 h-4" />}>
        <SettingRow label="Ziel-Ladezustand" description="Das E-Auto wird bis zu diesem Wert geladen">
          <div className="w-48 space-y-2">
            <Slider value={[targetSoC]} onValueChange={([v]) => setTargetSoC(v)} min={50} max={100} step={5} />
            <span className="text-xs text-muted-foreground font-mono-numbers">{targetSoC}%</span>
          </div>
        </SettingRow>
        <Separator className="bg-border" />
        <SettingRow label="Max. Ladeleistung" description="Maximale Leistung der Wallbox">
          <Select value={String(maxChargePower)} onValueChange={(v) => setMaxChargePower(Number(v))}>
            <SelectTrigger className="w-32 bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[3.7, 7.4, 11, 22].map(v => (
                <SelectItem key={v} value={String(v)}>{v} kW</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>
        <Separator className="bg-border" />
        <SettingRow label="Nur PV-Überschuss" description="Laden nur mit eigenem Solarstrom">
          <Switch checked={pvOnly} onCheckedChange={setPvOnly} />
        </SettingRow>
      </SettingsSection>

      <SettingsSection title="Ladezeiten & Abfahrt" icon={<Clock className="w-4 h-4" />}>
        {departureTimes.map((dt, i) => (
          <div key={i}>
            {i > 0 && <Separator className="bg-border" />}
            <SettingRow label={`Abfahrtszeit ${dt.day}`} description="Auto ist bis dahin auf Ziel-SoC geladen">
              <Input
                type="time"
                value={dt.time}
                onChange={(e) => {
                  const updated = [...departureTimes];
                  updated[i] = { ...dt, time: e.target.value };
                  setDepartureTimes(updated);
                }}
                className="w-28 font-mono-numbers bg-secondary border-border"
              />
            </SettingRow>
          </div>
        ))}
      </SettingsSection>

      <SettingsSection title="Smart Charging" icon={<TrendingDown className="w-4 h-4" />}>
        <SettingRow label="Preisoptimiertes Laden" description="Lädt automatisch in den günstigsten Stunden vor Abfahrt">
          <Switch checked={smartCharging} onCheckedChange={setSmartCharging} />
        </SettingRow>
        {smartCharging && (
          <>
            <Separator className="bg-border" />
            <SettingRow label="Max. Preis" description="Laden nur unter diesem Börsenstrompreis">
              <div className="flex items-center gap-2">
                <Input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-20 text-right font-mono-numbers bg-secondary border-border" />
                <span className="text-xs text-muted-foreground">ct/kWh</span>
              </div>
            </SettingRow>
          </>
        )}
      </SettingsSection>

      <AutomationSection rules={rules} onToggle={(id) => setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))} />
      <SaveBar />
    </>
  );
};

// ─── Heatpump Settings ────────────────────────────────────
const HeatpumpSettings = () => {
  const [targetTemp, setTargetTemp] = useState(22);
  const [nightTemp, setNightTemp] = useState(18);
  const [hotWaterTemp, setHotWaterTemp] = useState(50);
  const [heatingStart, setHeatingStart] = useState("06:00");
  const [heatingEnd, setHeatingEnd] = useState("22:00");
  const [smartMode, setSmartMode] = useState(true);
  const [pvBoost, setPvBoost] = useState(true);
  const [rules, setRules] = useState<AutomationRule[]>([
    { id: "1", name: "PV-Boost Heizung", enabled: true, condition: "PV-Überschuss > 2 kW", action: "Zieltemperatur +2°C" },
    { id: "2", name: "Preisoptimiert heizen", enabled: true, condition: "Strompreis < 5 ct/kWh", action: "Warmwasser auf 55°C erhöhen" },
    { id: "3", name: "Spitzenlast vermeiden", enabled: true, condition: "Strompreis > 15 ct/kWh", action: "WP pausieren (min. 18°C halten)" },
    { id: "4", name: "Nachtabsenkung", enabled: true, condition: "22:00 – 06:00", action: "Zieltemperatur auf Nachtmodus" },
  ]);

  return (
    <>
      <SettingsSection title="Temperatur-Einstellungen" icon={<Thermometer className="w-4 h-4" />}>
        <SettingRow label="Zieltemperatur Tag" description="Gewünschte Raumtemperatur tagsüber">
          <div className="w-48 space-y-2">
            <Slider value={[targetTemp]} onValueChange={([v]) => setTargetTemp(v)} min={16} max={28} step={0.5} />
            <span className="text-xs text-muted-foreground font-mono-numbers">{targetTemp}°C</span>
          </div>
        </SettingRow>
        <Separator className="bg-border" />
        <SettingRow label="Zieltemperatur Nacht" description="Absenkung während der Nachtruhe">
          <div className="w-48 space-y-2">
            <Slider value={[nightTemp]} onValueChange={([v]) => setNightTemp(v)} min={14} max={22} step={0.5} />
            <span className="text-xs text-muted-foreground font-mono-numbers">{nightTemp}°C</span>
          </div>
        </SettingRow>
        <Separator className="bg-border" />
        <SettingRow label="Warmwasser-Temperatur" description="Zieltemperatur für den Warmwasserspeicher">
          <div className="w-48 space-y-2">
            <Slider value={[hotWaterTemp]} onValueChange={([v]) => setHotWaterTemp(v)} min={40} max={65} step={1} />
            <span className="text-xs text-muted-foreground font-mono-numbers">{hotWaterTemp}°C</span>
          </div>
        </SettingRow>
      </SettingsSection>

      <SettingsSection title="Zeitprogramm" icon={<Clock className="w-4 h-4" />}>
        <SettingRow label="Heizperiode Start" description="Ab wann die Tagtemperatur gilt">
          <Input type="time" value={heatingStart} onChange={(e) => setHeatingStart(e.target.value)} className="w-28 font-mono-numbers bg-secondary border-border" />
        </SettingRow>
        <Separator className="bg-border" />
        <SettingRow label="Heizperiode Ende" description="Ab wann die Nachtabsenkung beginnt">
          <Input type="time" value={heatingEnd} onChange={(e) => setHeatingEnd(e.target.value)} className="w-28 font-mono-numbers bg-secondary border-border" />
        </SettingRow>
      </SettingsSection>

      <SettingsSection title="Smart Modus" icon={<Zap className="w-4 h-4" />}>
        <SettingRow label="Preisoptimiert heizen" description="Heizverhalten nach Börsenstrompreis anpassen">
          <Switch checked={smartMode} onCheckedChange={setSmartMode} />
        </SettingRow>
        <Separator className="bg-border" />
        <SettingRow label="PV-Boost" description="Temperatur erhöhen wenn PV-Überschuss vorhanden">
          <Switch checked={pvBoost} onCheckedChange={setPvBoost} />
        </SettingRow>
      </SettingsSection>

      <AutomationSection rules={rules} onToggle={(id) => setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))} />
      <SaveBar />
    </>
  );
};

// ─── Shared UI Components ─────────────────────────────────

const SettingsSection = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
    <Card className="bg-gradient-card border-border shadow-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </Card>
  </motion.div>
);

const SettingRow = ({ label, description, children }: { label: string; description: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex-1 min-w-0">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

const AutomationSection = ({ rules, onToggle }: { rules: AutomationRule[]; onToggle: (id: string) => void }) => (
  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
    <Card className="bg-gradient-card border-border shadow-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center gap-2">
        <span className="text-primary"><Zap className="w-4 h-4" /></span>
        <h3 className="text-sm font-semibold text-foreground">Automatisierungsregeln</h3>
      </div>
      <div className="divide-y divide-border">
        {rules.map((rule) => (
          <div key={rule.id} className={`px-5 py-3.5 flex items-center gap-4 transition-opacity ${rule.enabled ? "" : "opacity-50"}`}>
            <Switch checked={rule.enabled} onCheckedChange={() => onToggle(rule.id)} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{rule.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                <span className="text-accent">Wenn:</span> {rule.condition} → <span className="text-primary">Dann:</span> {rule.action}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  </motion.div>
);

const SaveBar = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-end gap-3 pt-2 pb-8">
    <Button variant="outline" className="border-border text-muted-foreground hover:text-foreground">
      <RotateCcw className="w-4 h-4 mr-2" /> Zurücksetzen
    </Button>
    <Button className="bg-gradient-energy text-primary-foreground hover:opacity-90" onClick={() => toast.success("Einstellungen gespeichert!")}>
      <Save className="w-4 h-4 mr-2" /> Speichern
    </Button>
  </motion.div>
);

export default DeviceDetailPage;
