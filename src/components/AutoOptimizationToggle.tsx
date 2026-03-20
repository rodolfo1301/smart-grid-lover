import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Zap } from "lucide-react";

interface AutoOptimizationToggleProps {
  enabled: boolean;
  onToggle: (value: boolean) => void;
}

const AutoOptimizationToggle = ({ enabled, onToggle }: AutoOptimizationToggleProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className={`border rounded-xl p-4 shadow-card transition-all duration-300 ${
        enabled
          ? "bg-primary/10 border-primary/30 shadow-glow"
          : "bg-gradient-card border-border"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg transition-colors ${enabled ? "bg-primary/20" : "bg-secondary"}`}>
            {enabled ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-5 h-5 text-primary" />
              </motion.div>
            ) : (
              <Zap className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Auto-Optimierung</h3>
              {enabled && (
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-primary"
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-md">
              {enabled
                ? "WATTLY optimiert deinen Verbrauch automatisch anhand der Börsenstrompreise"
                : "Aktivieren, um Verbrauch automatisch zu optimieren"}
            </p>
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>
    </motion.div>
  );
};

export default AutoOptimizationToggle;
