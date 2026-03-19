import { motion } from "framer-motion";
import { Zap, TrendingDown, Battery, Sun } from "lucide-react";

const recommendations = [
  {
    icon: <TrendingDown className="w-4 h-4" />,
    title: "Jetzt laden empfohlen",
    description: "Strompreis fällt auf 1,8 ct/kWh um 04:00. E-Auto laden einplanen.",
    type: "positive" as const,
    time: "In 2 Stunden",
  },
  {
    icon: <Sun className="w-4 h-4" />,
    title: "PV-Überschuss nutzen",
    description: "Ab 11:00 erwartet: 4.2 kW Überschuss. Wärmepumpe aktivieren.",
    type: "info" as const,
    time: "Morgen",
  },
  {
    icon: <Zap className="w-4 h-4" />,
    title: "Spitzenlast vermeiden",
    description: "18:00-20:00 Höchstpreise erwartet (18,5 ct/kWh). Aus Speicher versorgen.",
    type: "warning" as const,
    time: "Heute Abend",
  },
  {
    icon: <Battery className="w-4 h-4" />,
    title: "Speicher voll geladen",
    description: "Heimspeicher bei 92%. Überschuss einspeisen für beste Vergütung.",
    type: "positive" as const,
    time: "Jetzt",
  },
];

const typeStyles = {
  positive: "border-success/20 bg-success/5",
  warning: "border-warning/20 bg-warning/5",
  info: "border-accent/20 bg-accent/5",
};

const iconStyles = {
  positive: "text-success bg-success/15",
  warning: "text-warning bg-warning/15",
  info: "text-accent bg-accent/15",
};

const SmartRecommendations = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.3 }}
    className="bg-gradient-card border border-border rounded-xl p-5 shadow-card"
  >
    <h3 className="text-sm font-medium text-muted-foreground mb-4">Smart Empfehlungen</h3>
    <div className="space-y-3">
      {recommendations.map((rec, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 + i * 0.1 }}
          className={`flex items-start gap-3 p-3 rounded-lg border ${typeStyles[rec.type]}`}
        >
          <div className={`p-1.5 rounded-md flex-shrink-0 ${iconStyles[rec.type]}`}>{rec.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">{rec.title}</h4>
              <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">{rec.time}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export default SmartRecommendations;
