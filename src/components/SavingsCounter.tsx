import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { Leaf, TrendingUp, Coins } from "lucide-react";

const AnimatedNumber = ({ value, decimals = 2, duration = 1.5 }: { value: number; decimals?: number; duration?: number }) => {
  const motionVal = useMotionValue(0);
  const display = useTransform(motionVal, (v) => v.toFixed(decimals).replace(".", ","));

  useEffect(() => {
    const controls = animate(motionVal, value, { duration, ease: "easeOut" });
    return controls.stop;
  }, [value, motionVal, duration]);

  return <motion.span>{display}</motion.span>;
};

const SavingsCounter = () => {
  // Simulated values based on: solar self-consumption * avoided grid price (28ct/kWh)
  // Today: ~8.5 kWh self-consumed * 0.28 €/kWh = 2.38 €
  // Month: ~180 kWh * 0.28 = 50.40 €
  const todaySaved = 2.38;
  const monthSaved = 50.40;
  const co2Saved = 4.2; // kg

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
        <h3 className="text-sm font-medium text-muted-foreground">Deine Einsparungen</h3>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Heute gespart</p>
          <p className="text-xl font-bold font-mono-numbers text-primary">
            <AnimatedNumber value={todaySaved} /> <span className="text-sm font-normal text-muted-foreground">€</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Diesen Monat</p>
          <p className="text-xl font-bold font-mono-numbers text-foreground">
            <AnimatedNumber value={monthSaved} /> <span className="text-sm font-normal text-muted-foreground">€</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">CO₂ vermieden</p>
          <p className="text-xl font-bold font-mono-numbers text-success flex items-center gap-1">
            <AnimatedNumber value={co2Saved} decimals={1} /> <span className="text-sm font-normal text-muted-foreground">kg</span>
            <Leaf className="w-3.5 h-3.5 text-success ml-1" />
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SavingsCounter;
