import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMarketPrices, getCurrentPrice } from "@/hooks/useMarketPrices";

const PriceAlertBanner = () => {
  const { data } = useMarketPrices();
  const current = data ? getCurrentPrice(data) : undefined;
  const [showDetails, setShowDetails] = useState(false);

  if (!current) return null;

  const isLow = current.price < 5;
  const isHigh = current.price > 15;

  if (!isLow && !isHigh) return null;

  const avgPrice = 18;
  const saving = Math.abs((avgPrice - current.price) / 100 * 2.5).toFixed(2);

  // Find when expensive period ends (for high price banner)
  const endTime = (() => {
    if (!isHigh || !data) return "21:00";
    const nowIdx = data.indexOf(current);
    for (let i = nowIdx + 1; i < data.length; i++) {
      if (data[i].price <= 15) return data[i].time;
    }
    return "21:00";
  })();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`px-4 sm:px-6 py-2.5 text-center text-sm font-medium ${
          isLow
            ? "bg-success/15 text-success border-b border-success/20"
            : "bg-destructive/15 text-destructive border-b border-destructive/20"
        }`}
      >
        <div className="flex items-center justify-center gap-1 flex-wrap">
          <span>
            {isLow
              ? `⚡ Jetzt Waschen oder Laden — spart bis zu ${saving} €`
              : `🔴 Strom teuer bis ${endTime} — Geräte aus = ~${saving} € gespart`}
          </span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="underline text-xs opacity-70 hover:opacity-100 ml-1"
          >
            {showDetails ? "Schließen" : "Warum?"}
          </button>
        </div>
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="text-xs opacity-70 mt-1"
            >
              Börsenpreis jetzt: {current.price.toFixed(1)} ct/kWh · Heute Abend: ~{avgPrice} ct/kWh · Unterschied: {Math.abs(avgPrice - current.price).toFixed(1)} ct/kWh
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default PriceAlertBanner;
