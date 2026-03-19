import { motion } from "framer-motion";
import { Sun, Home, Battery, Car, Thermometer, ArrowRight } from "lucide-react";

const EnergyFlowDiagram = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.15 }}
    className="bg-gradient-card border border-border rounded-xl p-5 shadow-card"
  >
    <h3 className="text-sm font-medium text-muted-foreground mb-5">Energiefluss</h3>
    <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
      {[
        { icon: <Sun className="w-5 h-5" />, label: "PV", value: "3.8 kW", color: "text-warning" },
        { icon: <ArrowRight className="w-4 h-4 text-muted-foreground" />, label: "", value: "", color: "" },
        { icon: <Home className="w-5 h-5" />, label: "Haus", value: "1.2 kW", color: "text-accent" },
        { icon: <ArrowRight className="w-4 h-4 text-muted-foreground" />, label: "", value: "", color: "" },
        { icon: <Battery className="w-5 h-5" />, label: "Speicher", value: "92%", color: "text-primary" },
        { icon: <ArrowRight className="w-4 h-4 text-muted-foreground" />, label: "", value: "", color: "" },
        { icon: <Car className="w-5 h-5" />, label: "E-Auto", value: "67%", color: "text-accent" },
        { icon: <ArrowRight className="w-4 h-4 text-muted-foreground" />, label: "", value: "", color: "" },
        { icon: <Thermometer className="w-5 h-5" />, label: "WP", value: "2.1 kW", color: "text-destructive" },
      ].map((item, i) =>
        item.label === "" ? (
          <div key={i} className="flex-shrink-0">{item.icon}</div>
        ) : (
          <motion.div
            key={i}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            className="flex flex-col items-center gap-1 flex-shrink-0"
          >
            <div className={`p-2.5 rounded-lg bg-secondary ${item.color}`}>{item.icon}</div>
            <span className="text-[10px] text-muted-foreground font-medium">{item.label}</span>
            <span className={`text-xs font-bold font-mono-numbers ${item.color}`}>{item.value}</span>
          </motion.div>
        )
      )}
    </div>
  </motion.div>
);

export default EnergyFlowDiagram;
