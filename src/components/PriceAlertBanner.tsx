import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMarketPrices, getCurrentPrice, getTodayPrices, getUpcomingPrices, getLowestPrice, getHighestPrice, shiftSavingEur, formatEur } from "@/hooks/useMarketPrices";

const PriceAlertBanner = () => {
  const { data } = useMarketPrices();
  const current = data ? getCurrentPrice(data) : undefined;
  const [showDetails, setShowDetails] = useState(false);

  if (!current) return null;

  const isLow = current.price < 5;
  const isHigh = current.price > 15;

  if (!isLow && !isHigh) return null;

  const WASH_KWH = 2.5; // assumption: one washing machine cycle
  const upcoming = data ? getUpcomingPrices(getTodayPrices(data)) : [];
  const ref = isLow ? getHighestPrice(upcoming) : getLowestPrice(upcoming);
  if (!ref) return null;
  const savingNum = isLow
    ? shiftSavingEur(ref.price, current.price, WASH_KWH)
    : shiftSavingEur(current.price, ref.price, WASH_KWH);
  const saving = formatEur(savingNum);

  // When the expensive period ends (works with 15-min and hourly slots)
  const endTime = (() => {
    if (!isHigh || !data) return null;
    const nowIdx = data.indexOf(current);
    for (let i = nowIdx + 1; i < data.length; i++) {
      if (data[i].price <= 15) return data[i].time;
    }
    return null;
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
              ? `⚡ Jetzt Waschen oder Laden — spart ~${saving} € vs. ${ref.time} Uhr`
              : `🔴 Strom teuer${endTime ? ` bis ${endTime}` : ""} — später waschen (${ref.time} Uhr) spart ~${saving} €`}
            <span className="opacity-70 text-xs ml-1">(geschätzt, dyn. Tarif, Annahme: {WASH_KWH} kWh)</span>
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
              Börsenpreis jetzt: {current.price.toFixed(1)} ct/kWh · {ref.time} Uhr: {ref.price.toFixed(1)} ct/kWh · Unterschied: {Math.abs(ref.price - current.price).toFixed(1)} ct/kWh
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default PriceAlertBanner;
