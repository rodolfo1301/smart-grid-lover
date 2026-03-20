import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { day: "Mo", verbrauch: 12.4, erzeugung: 18.2 },
  { day: "Di", verbrauch: 14.1, erzeugung: 15.8 },
  { day: "Mi", verbrauch: 11.8, erzeugung: 22.1 },
  { day: "Do", verbrauch: 13.5, erzeugung: 19.4 },
  { day: "Fr", verbrauch: 15.2, erzeugung: 16.7 },
  { day: "Sa", verbrauch: 9.8, erzeugung: 24.3 },
  { day: "So", verbrauch: 8.6, erzeugung: 21.5 },
];

const HistoryChart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-gradient-card border border-border rounded-xl p-5 shadow-card"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-medium text-muted-foreground">Verlauf – Letzte 7 Tage</h3>
        <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-1 rounded-md">kWh / Tag</span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
                color: "hsl(var(--foreground))",
              }}
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)} kWh`,
                name === "erzeugung" ? "PV-Erzeugung" : "Verbrauch",
              ]}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px" }}>
                  {value === "erzeugung" ? "PV-Erzeugung" : "Verbrauch"}
                </span>
              )}
            />
            <Bar dataKey="erzeugung" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="verbrauch" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default HistoryChart;
