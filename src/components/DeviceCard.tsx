import { motion } from "framer-motion";
import { ReactNode, useState } from "react";
import { Switch } from "@/components/ui/switch";

interface DeviceCardProps {
  name: string;
  icon: ReactNode;
  status: string;
  power: string;
  isActive?: boolean;
  delay?: number;
}

const DeviceCard = ({ name, icon, status, power, isActive: initialActive = true, delay = 0 }: DeviceCardProps) => {
  const [isActive, setIsActive] = useState(initialActive);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`bg-gradient-card border rounded-xl p-4 shadow-card transition-colors duration-300 ${
        isActive ? "border-primary/30 shadow-glow" : "border-border opacity-70"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg transition-colors ${isActive ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
          {icon}
        </div>
        <Switch checked={isActive} onCheckedChange={setIsActive} />
      </div>
      <h4 className="text-sm font-semibold text-foreground">{name}</h4>
      <p className="text-xs text-muted-foreground mt-0.5">{status}</p>
      <p className={`text-lg font-bold font-mono-numbers mt-2 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
        {power}
      </p>
    </motion.div>
  );
};

export default DeviceCard;
