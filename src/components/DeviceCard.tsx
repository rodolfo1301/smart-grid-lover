import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface DeviceCardProps {
  name: string;
  icon: ReactNode;
  status: string;
  power: string;
  isActive: boolean;
  onToggle: (value: boolean) => void;
  delay?: number;
  deviceId: string;
  batteryPercent?: number;
  /** If true, clicking the card does NOT navigate (used in GeräteView inline) */
  disableNav?: boolean;
}

const DeviceCard = ({ name, icon, status, power, isActive, onToggle, delay = 0, deviceId, batteryPercent, disableNav }: DeviceCardProps) => {
  const navigate = useNavigate();

  const getBatteryColor = (pct: number) => {
    if (pct > 60) return "bg-primary";
    if (pct > 25) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`bg-gradient-card border rounded-xl p-4 shadow-card transition-all duration-300 cursor-pointer group ${
        isActive ? "border-primary/30 shadow-glow" : "border-border opacity-60 grayscale-[30%]"
      }`}
      onClick={() => !disableNav && navigate(`/device/${deviceId}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg transition-colors ${isActive ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
          {icon}
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={isActive}
            onCheckedChange={onToggle}
            onClick={(e) => e.stopPropagation()}
          />
          {!disableNav && (
            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </div>
      <h4 className="text-sm font-semibold text-foreground">{name}</h4>
      <p className="text-xs text-muted-foreground mt-0.5">{status}</p>
      <p className={`text-lg font-bold font-mono-numbers mt-2 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
        {power}
      </p>
      {batteryPercent !== undefined && (
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Ladezustand</span>
            <span className="text-[10px] font-mono-numbers font-semibold text-foreground">{batteryPercent}%</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${batteryPercent}%` }}
              transition={{ duration: 1, delay: delay + 0.3 }}
              className={`h-full rounded-full ${getBatteryColor(batteryPercent)}`}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DeviceCard;
