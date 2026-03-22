import { motion } from "framer-motion";
import { Zap, TrendingDown, Battery, Sun, Clock } from "lucide-react";
import { useMarketPrices, getLowestPrice, getHighestPrice, getCurrentPrice } from "@/hooks/useMarketPrices";

const staticRecommendations = [
  {
    icon: <Sun className="w-4 h-4" />,
    title: "PV-Überschuss nutzen",
    description: "Ab 11:00 erwartet: 4.2 kW Überschuss. Wärmepumpe aktivieren.",
    type: "info" as const,
    time: "Morgen",
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

const SmartRecommendations = () => {
  const { data } = useMarketPrices();

  const dynamicRecs: Array<{ icon: React.ReactNode; title: string; description: string; type: "positive" | "warning" | "info"; time: string }> = [];

  if (data && data.length > 0) {
    const now = Date.now();
    const futureData = data.filter(d => d.timestamp > now);
    const lowest = futureData.length > 0 ? futureData.reduce((m, d) => d.price < m.price ? d : m, futureData[0]) : getLowestPrice(data);
    const highest = futureData.length > 0 ? futureData.reduce((m, d) => d.price > m.price ? d : m, futureData[0]) : getHighestPrice(data);
    const current = getCurrentPrice(data);

    if (lowest) {
      dynamicRecs.push({
        icon: <TrendingDown className="w-4 h-4" />,
        title: "Günstigster Preis",
        description: `${lowest.price.toFixed(2)} ct/kWh um ${lowest.time} Uhr. E-Auto laden einplanen.`,
        type: "positive",
        time: lowest.time,
      });
    }
    if (highest) {
      dynamicRecs.push({
        icon: <Zap className="w-4 h-4" />,
        title: "Spitzenlast vermeiden",
        description: `${highest.price.toFixed(2)} ct/kWh um ${highest.time} Uhr. Aus Speicher versorgen.`,
        type: "warning",
        time: highest.time,
      });
    }
    if (current && current.recommendation === "laden") {
      dynamicRecs.push({
        icon: <Clock className="w-4 h-4" />,
        title: "Jetzt günstig laden!",
        description: `Aktueller Preis: ${current.price.toFixed(2)} ct/kWh – unter Durchschnitt.`,
        type: "positive",
        time: "Jetzt",
      });
    }
  }

  const allRecs = [...dynamicRecs, ...staticRecommendations];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-gradient-card border border-border rounded-xl p-5 shadow-card"
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Smart Empfehlungen</h3>
      <div className="space-y-3">
        {allRecs.map((rec, i) => (
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
      <p className="text-[10px] text-muted-foreground italic mt-3 pt-3 border-t border-border">
        Empfehlungen basieren auf EPEX SPOT AT Börsenpreisen.
      </p>
    </motion.div>
  );
};

export default SmartRecommendations;
