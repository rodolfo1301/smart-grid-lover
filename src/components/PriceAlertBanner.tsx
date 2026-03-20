import { motion, AnimatePresence } from "framer-motion";
import { useMarketPrices, getCurrentPrice } from "@/hooks/useMarketPrices";

const PriceAlertBanner = () => {
  const { data } = useMarketPrices();
  const current = data ? getCurrentPrice(data) : undefined;

  if (!current) return null;

  const isLow = current.price < 5;
  const isHigh = current.price > 15;

  if (!isLow && !isHigh) return null;

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
        {isLow
          ? `⚡ Günstiger Strom (${current.price.toFixed(1)} ct/kWh) – jetzt laden & Geräte einschalten!`
          : `🔴 Teurer Strom (${current.price.toFixed(1)} ct/kWh) – Verbrauch reduzieren!`}
      </motion.div>
    </AnimatePresence>
  );
};

export default PriceAlertBanner;
