import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STORAGE_KEY = "wattly_tariff_dismissed";
const AVG_AWATTAR_PRICE = 8.5;

const TariffSwitchBanner = () => {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");
  const [step, setStep] = useState<1 | 2>(1);
  const [consumption, setConsumption] = useState(() =>
    localStorage.getItem("wattly_yearly_consumption") || "3500"
  );
  const [fixedPrice, setFixedPrice] = useState(() =>
    localStorage.getItem("wattly_fixed_price") || "28"
  );
  const [savings, setSavings] = useState(0);

  if (dismissed) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  };

  const calculate = () => {
    const c = parseFloat(consumption) || 3500;
    const p = parseFloat(fixedPrice) || 28;
    localStorage.setItem("wattly_yearly_consumption", String(c));
    localStorage.setItem("wattly_fixed_price", String(p));
    const result = ((p - AVG_AWATTAR_PRICE) / 100) * c;
    setSavings(Math.max(0, Math.round(result)));
    setStep(2);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="relative rounded-xl border-2 border-primary/40 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-5 sm:p-6"
      >
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1 rounded-md hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="calc"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4 pr-6"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">💡</span>
                <h3 className="text-sm font-bold text-foreground">
                  Wie viel könntest du sparen?
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Jahresverbrauch</Label>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      value={consumption}
                      onChange={(e) => setConsumption(e.target.value)}
                      placeholder="3500"
                      className="font-mono"
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">kWh</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Aktueller Preis</Label>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      value={fixedPrice}
                      onChange={(e) => setFixedPrice(e.target.value)}
                      placeholder="28"
                      className="font-mono"
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">ct/kWh</span>
                  </div>
                </div>
              </div>

              <Button onClick={calculate} className="w-full gap-2">
                <Calculator className="w-4 h-4" />
                Berechnen
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4 pr-6"
            >
              <div className="text-center space-y-1">
                <p className="text-4xl font-extrabold text-primary">
                  ~{savings}&nbsp;€/Jahr
                </p>
                <p className="text-sm font-medium text-foreground">
                  Geschätzte Ersparnis mit dynamischem Tarif
                </p>
                <p className="text-xs text-muted-foreground">
                  Basierend auf deinem Verbrauch und dem Ø&nbsp;aWATTar-Preis 2024 von 8,5&nbsp;ct/kWh
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="default" asChild>
                  <a href="https://www.awattar.at" target="_blank" rel="noopener noreferrer" className="gap-1.5">
                    Zu aWATTar wechseln <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href="https://tibber.com/de" target="_blank" rel="noopener noreferrer" className="gap-1.5">
                    Zu Tibber wechseln <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </div>

              <button
                onClick={() => setStep(1)}
                className="text-xs text-primary hover:underline"
              >
                ↺ Neu berechnen
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default TariffSwitchBanner;
