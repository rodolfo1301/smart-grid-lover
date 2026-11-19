import { useMemo } from "react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useMarketPrices, getTodayPrices, getUpcomingPrices, getLowestPrice, getHighestPrice, getCurrentPrice, shiftSavingEur, formatEur } from "@/hooks/useMarketPrices";

interface AutoOptimizationToggleProps {
  enabled: boolean;
  onToggle: (value: boolean) => void;
}

const AutoOptimizationToggle = ({ enabled, onToggle }: AutoOptimizationToggleProps) => {
  const { data: prices } = useMarketPrices();
  const SHIFT_KWH = 3; // assumption: shiftable consumption per day

  const est = useMemo(() => {
    if (!prices?.length) return null;
    const upcoming = getUpcomingPrices(getTodayPrices(prices));
    const lo = getLowestPrice(upcoming);
    const hi = getHighestPrice(upcoming);
    const current = getCurrentPrice(prices);
    if (!lo || !hi) return null;
    return {
      saving: shiftSavingEur(hi.price, lo.price, SHIFT_KWH),
      isCheapNow: current?.recommendation === "laden",
    };
  }, [prices]);
  const isCheapNow = est?.isCheapNow ?? false;

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

            {est ? (
              <>
                <p className="text-2xl font-bold text-foreground tracking-tight">
                  Sparpotenzial heute ~{formatEur(est.saving)} €
                </p>
                <p className="text-[10px] text-muted-foreground">
                  geschätzt, bei dynamischem Tarif · teuerste vs. günstigste restliche Stunde heute · Annahme: {SHIFT_KWH} kWh verschoben
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Börsenpreise derzeit nicht verfügbar</p>
            )}

            <p className="text-xs text-muted-foreground leading-relaxed">
              {isCheapNow
                ? "Strom jetzt günstig — idealer Zeitpunkt für Waschmaschine oder Geschirrspüler"
                : "Verschiebe flexible Verbraucher in die günstigsten Stunden des Tages"}
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
