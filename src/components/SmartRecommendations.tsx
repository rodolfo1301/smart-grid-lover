import { motion } from "framer-motion";
import { Zap, TrendingDown, Battery, Sun, Clock } from "lucide-react";
import { useMarketPrices, getLowestPrice, getHighestPrice, getCurrentPrice } from "@/hooks/useMarketPrices";

const calcSaving = (cheapPrice: number, expensivePrice: number, kwh: number) =>
  (((expensivePrice - cheapPrice) / 100) * kwh).toFixed(2);

const calcCost = (price: number, kwh: number) =>
  ((price / 100) * kwh).toFixed(2);

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

const getFunComparison = (savings: number): string => {
  if (savings >= 400) return "✈️ Ein Kurzurlaub durch Stromsparen!";
  if (savings >= 200) return "⛽ Einen vollen Tank Benzin gespart";
  if (savings >= 100) return "🎬 Streaming-Abo + Kino gratis";
  if (savings >= 50) return "⛽ Einen halben Tank Benzin gespart";
  const coffees = Math.floor(savings / 4.5);
  return `☕ = ${coffees} Kaffee gratis diesen Monat`;
};

const SmartRecommendations = () => {
  const { data } = useMarketPrices();
  const monthlySavings = Number(localStorage.getItem("wattly_monthly_savings") || "50");
  const avgKwh = 2; // average appliance cycle in kWh

  const allRecs: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
    detail: string;
    type: "positive" | "warning" | "info";
    time: string;
  }> = [];

  if (data && data.length > 0) {
    const now = Date.now();
    const futureData = data.filter(d => d.timestamp > now);
    const lowest = futureData.length > 0 ? futureData.reduce((m, d) => d.price < m.price ? d : m, futureData[0]) : getLowestPrice(data);
    const highest = futureData.length > 0 ? futureData.reduce((m, d) => d.price > m.price ? d : m, futureData[0]) : getHighestPrice(data);
    const current = getCurrentPrice(data);

    // Cheap price recommendation
    if (current && current.price < 5 && highest) {
      const saving = calcSaving(current.price, highest.price, avgKwh);
      allRecs.push({
        icon: <TrendingDown className="w-4 h-4" />,
        title: "✅ Jetzt Waschen!",
        description: `Spart ~${saving} € vs. heute Abend`,
        detail: `(${current.price.toFixed(1)} ct/kWh)`,
        type: "positive",
        time: "Jetzt",
      });
    }

    // Expensive price recommendation
    if (current && current.price > 12 && lowest) {
      const saving = calcSaving(lowest.price, current.price, avgKwh);
      allRecs.push({
        icon: <Zap className="w-4 h-4" />,
        title: `⚠️ Teuer bis ${highest ? highest.time : current.time} Uhr`,
        description: `Geräte aus = ~${saving} € gespart`,
        detail: `(${current.price.toFixed(1)} ct/kWh)`,
        type: "warning",
        time: current.time,
      });
    }

    // Best time / timer recommendation
    if (lowest && highest && lowest.price < highest.price) {
      const cheapCost = calcCost(lowest.price, avgKwh);
      const expCost = calcCost(highest.price, avgKwh);
      const saved = calcSaving(lowest.price, highest.price, avgKwh);
      allRecs.push({
        icon: <Clock className="w-4 h-4" />,
        title: `🌙 Waschmaschine: Timer auf ${lowest.time}`,
        description: `${cheapCost} € statt ${expCost} € – du sparst ${saved} €`,
        detail: `(${lowest.price.toFixed(1)} ct/kWh)`,
        type: "info",
        time: lowest.time,
      });
    }

    // Current cheap loading recommendation
    if (current && current.recommendation === "laden" && current.price >= 5 && highest) {
      const saving = calcSaving(current.price, highest.price, avgKwh);
      allRecs.push({
        icon: <Battery className="w-4 h-4" />,
        title: "✅ Jetzt E-Auto laden!",
        description: `Spart ~${saving} € vs. Spitzenpreis`,
        detail: `(${current.price.toFixed(1)} ct/kWh)`,
        type: "positive",
        time: "Jetzt",
      });
    }
  }

  // Static fallback if no dynamic recs
  if (allRecs.length === 0) {
    allRecs.push(
      {
        icon: <Sun className="w-4 h-4" />,
        title: "☀️ PV-Überschuss nutzen",
        description: "Wärmepumpe aktivieren bei Sonnenschein",
        detail: "",
        type: "info",
        time: "Morgen",
      },
      {
        icon: <Battery className="w-4 h-4" />,
        title: "🔋 Speicher voll geladen",
        description: "Überschuss einspeisen für beste Vergütung",
        detail: "",
        type: "positive",
        time: "Jetzt",
      }
    );
  }

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
              <p className="text-xs text-muted-foreground mt-0.5">
                {rec.description}
                {rec.detail && (
                  <span className="text-[10px] text-muted-foreground/60 ml-1">{rec.detail}</span>
                )}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Fun savings comparison */}
      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground mb-1">Deine Ersparnis bedeutet...</p>
        <p className="text-sm font-medium text-foreground">{getFunComparison(monthlySavings)}</p>
      </div>

      <p className="text-[10px] text-muted-foreground italic mt-3 pt-3 border-t border-border">
        Empfehlungen basieren auf EPEX SPOT AT Börsenpreisen.
      </p>
    </motion.div>
  );
};

export default SmartRecommendations;
