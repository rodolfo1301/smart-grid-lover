import { useMemo } from "react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useMarketPrices } from "@/hooks/useMarketPrices";

interface AutoOptimizationToggleProps {
  enabled: boolean;
  onToggle: (value: boolean) => void;
}

const AutoOptimizationToggle = ({ enabled, onToggle }: AutoOptimizationToggleProps) => {
  const { data: prices } = useMarketPrices();

  const { savingsToday, isCheapNow } = useMemo(() => {
    if (!prices?.length) return { savingsToday: 0, isCheapNow: false };

    const now = Date.now();
    const avgPrice = 18; // ct/kWh reference
    const kwhPerHour = 0.5;
    let savings = 0;
    let cheapNow = false;

    prices.forEach((slot: any) => {
      const start = slot.start_timestamp;
      const end = slot.end_timestamp;
      const price = slot.marketprice / 10; // €/MWh → ct/kWh
      if (end > now && price < avgPrice) {
        const diff = ((avgPrice - price) / 100) * kwhPerHour;
        savings += diff;
        if (start <= now && end > now) cheapNow = true;
      }
    });

    return { savingsToday: Math.max(0, parseFloat(savings.toFixed(2))), isCheapNow: cheapNow };
  }, [prices]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className={`border rounded-xl p-5 shadow-card transition-all duration-300 ${
        enabled
          ? "bg-primary/10 border-primary/30 shadow-glow"
          : "bg-gradient-card border-border"
      }`}
    >
      {enabled ? (
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2.5">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-2 rounded-lg bg-primary/20"
              >
                <Zap className="w-5 h-5 text-primary" />
              </motion.div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">WATTLY aktiv</h3>
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2.5 h-2.5 rounded-full bg-primary"
                />
              </div>
            </div>

            <p className="text-2xl font-bold text-foreground tracking-tight">
              Du sparst heute ~{savingsToday.toFixed(2).replace(".", ",")} €
            </p>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {isCheapNow
                ? "Strom jetzt günstig — idealer Zeitpunkt für Waschmaschine oder Geschirrspüler"
                : "WATTLY optimiert deinen Verbrauch automatisch anhand der Börsenstrompreise"}
            </p>
          </div>

          <div className="flex flex-col items-center gap-1.5 pt-1">
            <Switch checked={enabled} onCheckedChange={onToggle} />
            <span className="text-[10px] text-muted-foreground font-medium">Autopilot</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-secondary">
              <Zap className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">WATTLY pausiert</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Aktiviere WATTLY um automatisch zu sparen
              </p>
            </div>
          </div>
          <Button size="sm" onClick={() => onToggle(true)}>
            Jetzt aktivieren
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default AutoOptimizationToggle;
