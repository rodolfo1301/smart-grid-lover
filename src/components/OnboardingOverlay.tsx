import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Battery, Car, Thermometer, Zap, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface OnboardingOverlayProps {
  onComplete: (devices: Record<string, boolean>) => void;
}

const DEVICE_OPTIONS = [
  { id: "pv", label: "PV-Anlage", icon: <Sun className="w-5 h-5" /> },
  { id: "battery", label: "Heimspeicher", icon: <Battery className="w-5 h-5" /> },
  { id: "ev", label: "E-Auto", icon: <Car className="w-5 h-5" /> },
  { id: "heatpump", label: "Wärmepumpe", icon: <Thermometer className="w-5 h-5" /> },
];

const OnboardingOverlay = ({ onComplete }: OnboardingOverlayProps) => {
  const [step, setStep] = useState(0);
  const [selectedDevices, setSelectedDevices] = useState<Record<string, boolean>>({
    pv: false,
    battery: false,
    ev: false,
    heatpump: false,
  });
  const [tariff, setTariff] = useState("unknown");
  const [fixedPrice, setFixedPrice] = useState("30");

  const toggleDev = (id: string) =>
    setSelectedDevices((p) => ({ ...p, [id]: !p[id] }));

  const deviceCount = Object.values(selectedDevices).filter(Boolean).length;

  // Simple savings estimate
  const calcSavings = () => {
    let base = 180;
    if (selectedDevices.pv) base += 220;
    if (selectedDevices.battery) base += 140;
    if (selectedDevices.ev) base += 160;
    if (selectedDevices.heatpump) base += 110;
    if (tariff === "fixed") {
      const p = parseFloat(fixedPrice) || 30;
      base += Math.max(0, (p - 20) * 8);
    }
    return Math.round(base);
  };

  const finish = () => {
    localStorage.setItem("wattly_onboarded", "true");
    localStorage.setItem("wattly_tariff", tariff);
    if (tariff === "fixed") localStorage.setItem("wattly_fixedPrice", fixedPrice);
    onComplete(selectedDevices);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-lg p-4"
    >
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-primary" : i < step ? "w-2 bg-primary/60" : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Willkommen bei WATTLY</h2>
              <p className="text-sm text-muted-foreground">Welche Geräte hast du zuhause?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {DEVICE_OPTIONS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => toggleDev(d.id)}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedDevices[d.id]
                      ? "border-primary bg-primary/10 shadow-glow"
                      : "border-border bg-card hover:border-muted-foreground/30"
                  }`}
                >
                  {selectedDevices[d.id] && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className={`p-2 rounded-lg ${selectedDevices[d.id] ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                    {d.icon}
                  </div>
                  <span className="text-sm font-medium text-foreground">{d.label}</span>
                </button>
              ))}
            </div>
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={() => setStep(1)}
              disabled={deviceCount === 0}
            >
              Weiter <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Dein Stromtarif</h2>
              <p className="text-sm text-muted-foreground">Welchen Tarif nutzt du aktuell?</p>
            </div>
            <RadioGroup value={tariff} onValueChange={setTariff} className="space-y-3">
              {[
                { value: "fixed", label: "Fixer Tarif" },
                { value: "awattar", label: "aWATTar" },
                { value: "tibber", label: "Tibber" },
                { value: "unknown", label: "Weiß ich nicht" },
              ].map((t) => (
                <label
                  key={t.value}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    tariff === t.value ? "border-primary bg-primary/10" : "border-border bg-card"
                  }`}
                >
                  <RadioGroupItem value={t.value} />
                  <span className="text-sm font-medium text-foreground">{t.label}</span>
                </label>
              ))}
            </RadioGroup>
            <AnimatePresence>
              {tariff === "fixed" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pt-1">
                    <Label className="text-xs text-muted-foreground">Dein aktueller Preis (ct/kWh)</Label>
                    <Input
                      type="number"
                      value={fixedPrice}
                      onChange={(e) => setFixedPrice(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>Zurück</Button>
              <Button className="flex-1 gap-2" onClick={() => setStep(2)}>
                Weiter <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Dein Einsparpotenzial</h2>
              <p className="text-sm text-muted-foreground">Basierend auf deinen Angaben</p>
            </div>
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
              >
                <p className="text-6xl font-bold text-primary font-mono-numbers">
                  ~{calcSavings()}&nbsp;€
                </p>
                <p className="text-lg text-muted-foreground mt-2">pro Jahr Einsparpotenzial</p>
              </motion.div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Zurück</Button>
              <Button className="flex-1 gap-2" size="lg" onClick={finish}>
                <Zap className="w-4 h-4" /> WATTLY starten
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default OnboardingOverlay;
