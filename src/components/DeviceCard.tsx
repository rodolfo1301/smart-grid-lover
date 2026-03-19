import { motion } from "framer-motion";
import { ReactNode, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface DeviceCardProps {
  name: string;
  icon: ReactNode;
  status: string;
  power: string;
  isActive?: boolean;
  delay?: number;
  deviceId: string;
}

const DeviceCard = ({ name, icon, status, power, isActive: initialActive = true, delay = 0, deviceId }: DeviceCardProps) => {
  const [isActive, setIsActive] = useState(initialActive);
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`bg-gradient-card border rounded-xl p-4 shadow-card transition-colors duration-300 cursor-pointer group ${
        isActive ? "border-primary/30 shadow-glow" : "border-border opacity-70"
      }`}
      onClick={() => navigate(`/device/${deviceId}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg transition-colors ${isActive ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
          {icon}
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={isActive}
            onCheckedChange={(v) => {
              setIsActive(v);
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
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
