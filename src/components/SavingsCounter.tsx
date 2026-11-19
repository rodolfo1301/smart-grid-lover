import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import {
  useMarketPrices, getTodayPrices, findPriceWindow, shiftSavingEur, formatEur,
} from "@/hooks/useMarketPrices";

const SHIFT_KWH = 5; // assumption: daily shiftable consumption

const SavingsCounter = () => {
  const { data } = useMarketPrices();
  const today = data ? getTodayPrices(data) : [];
  const cheap = findPriceWindow(today, 3, "cheapest");
  const exp = findPriceWindow(today, 3, "expensive");
  const saving = cheap && exp ? shiftSavingEur(exp.avgPrice, cheap.avgPrice, SHIFT_KWH) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-gradient-card border border-primary/20 rounded-xl p-5 shadow-card shadow-glow"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/15">
          <Coins className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-sm font-medium text-muted-foreground">Dein Sparpotenzial heute</h3>
      </div>
      {saving !== null && cheap && exp ? (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Möglich heute</p>
              <p className="text-xl font-bold font-mono-numbers text-primary">
                ~{formatEur(saving)} <span className="text-sm font-normal text-muted-foreground">€</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Günstig</p>
              <p className="text-sm font-bold font-mono-numbers text-success">{cheap.startTime}–{cheap.endTime}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Teuer</p>
              <p className="text-sm font-bold font-mono-numbers text-warning">{exp.startTime}–{exp.endTime}</p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">
            geschätzt, bei dynamischem Tarif · teuerstes vs. günstigstes 3-Stunden-Fenster heute · Annahme: {SHIFT_KWH} kWh verschoben
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Börsenpreise derzeit nicht verfügbar</p>
      )}
    </motion.div>
  );
};

export default SavingsCounter;
