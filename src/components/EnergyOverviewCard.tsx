import { motion } from "framer-motion";
import { ReactNode } from "react";

interface EnergyOverviewCardProps {
  title: string;
  value: string;
  unit: string;
  icon: ReactNode;
  trend?: string;
  trendPositive?: boolean;
  variant?: "energy" | "consumption" | "default";
}

const EnergyOverviewCard = ({
  title,
  value,
  unit,
  icon,
  trend,
  trendPositive,
  variant = "default",
}: EnergyOverviewCardProps) => {
  const gradientClass =
    variant === "energy"
      ? "bg-gradient-energy"
      : variant === "consumption"
      ? "bg-gradient-consumption"
      : "bg-gradient-card";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-xl p-5 shadow-card ${
        variant === "default" ? "bg-gradient-card border border-border" : gradientClass
      }`}
    >
      {variant !== "default" && (
        <div className="absolute inset-0 bg-background/20 backdrop-blur-sm" />
      )}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-sm font-medium ${variant !== "default" ? "text-foreground/90" : "text-muted-foreground"}`}>
            {title}
          </span>
          <div className={`p-2 rounded-lg ${variant !== "default" ? "bg-background/20" : "bg-secondary"}`}>
            {icon}
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold font-mono-numbers tracking-tight text-foreground">
            {value}
          </span>
          <span className={`text-sm ${variant !== "default" ? "text-foreground/70" : "text-muted-foreground"}`}>
            {unit}
          </span>
        </div>
        {trend && (
          <div className={`mt-2 text-xs font-medium ${trendPositive ? "text-success" : "text-destructive"}`}>
            {trend}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EnergyOverviewCard;
