import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { motion } from "framer-motion";

const priceData = [
  { time: "00:00", price: 3.2, recommendation: "einspeisen" },
  { time: "02:00", price: 2.1, recommendation: "laden" },
  { time: "04:00", price: 1.8, recommendation: "laden" },
  { time: "06:00", price: 4.5, recommendation: "neutral" },
  { time: "08:00", price: 8.2, recommendation: "einspeisen" },
  { time: "10:00", price: 12.5, recommendation: "einspeisen" },
  { time: "12:00", price: 15.8, recommendation: "einspeisen" },
  { time: "14:00", price: 13.2, recommendation: "einspeisen" },
  { time: "16:00", price: 9.8, recommendation: "neutral" },
  { time: "18:00", price: 18.5, recommendation: "einspeisen" },
  { time: "20:00", price: 14.2, recommendation: "einspeisen" },
  { time: "22:00", price: 6.5, recommendation: "laden" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const rec = payload[0].payload.recommendation;
  const color = rec === "laden" ? "text-success" : rec === "einspeisen" ? "text-warning" : "text-muted-foreground";
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-card">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold font-mono-numbers text-foreground">{payload[0].value} ct/kWh</p>
      <p className={`text-xs font-medium capitalize ${color}`}>
        Empfehlung: {rec === "laden" ? "⚡ Strom laden" : rec === "einspeisen" ? "💰 Einspeisen" : "— Neutral"}
      </p>
    </div>
  );
};

const PriceChart = () => {
  const avgPrice = priceData.reduce((sum, d) => sum + d.price, 0) / priceData.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-gradient-card border border-border rounded-xl p-5 shadow-card"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Börsenstrompreis heute</h3>
          <p className="text-xs text-muted-foreground/70 mt-0.5">Day-Ahead EPEX Spot</p>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success" /> Günstig laden
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-warning" /> Einspeisen
          </span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={priceData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(155, 80%, 45%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(155, 80%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={avgPrice}
              stroke="hsl(215, 15%, 35%)"
              strokeDasharray="4 4"
              label={{ value: "Ø", fill: "hsl(215, 15%, 55%)", fontSize: 10 }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="hsl(155, 80%, 45%)"
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default PriceChart;
