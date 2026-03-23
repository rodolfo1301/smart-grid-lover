import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { motion } from "framer-motion";
import { useMarketPrices, type PriceDataPoint } from "@/hooks/useMarketPrices";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d: PriceDataPoint = payload[0].payload;
  const color =
    d.recommendation === "laden" ? "text-success" : d.recommendation === "einspeisen" ? "text-warning" : "text-muted-foreground";
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-card">
      <p className="text-xs text-muted-foreground">{d.time} Uhr</p>
      <p className="text-lg font-bold font-mono-numbers text-foreground">{d.price.toFixed(2)} ct/kWh</p>
      <p className={`text-xs font-medium ${color}`}>
        {d.recommendation === "laden"
          ? "⚡ Günstig – Strom laden"
          : d.recommendation === "einspeisen"
          ? "💰 Teuer – Einspeisen"
          : "— Neutral"}
      </p>
    </div>
  );
};

const PriceChart = () => {
  const { data, isLoading, isError, refetch } = useMarketPrices();

  const avgPrice = data ? data.reduce((s, d) => s + d.price, 0) / data.length : 0;

  // Highlight current hour
  const now = Date.now();
  const currentIdx = data?.findIndex((d, i) => {
    const next = data[i + 1];
    return d.timestamp <= now && (!next || next.timestamp > now);
  });

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
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            Day-Ahead EPEX Spot · aWATTar API
            {data && (
              <span className="ml-2 text-primary">● Live</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success" /> Günstig laden
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-warning" /> Einspeisen
            </span>
          </div>
          <button onClick={() => refetch()} className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">Lade Marktdaten…</span>
        </div>
      )}

      {isError && (
        <div className="h-64 flex flex-col items-center justify-center gap-2">
          <AlertCircle className="w-6 h-6 text-destructive" />
          <span className="text-sm text-muted-foreground">Preisdaten konnten nicht geladen werden</span>
          <button onClick={() => refetch()} className="text-xs text-primary hover:underline">Erneut versuchen</button>
        </div>
      )}

      {data && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
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
                interval={Math.max(0, Math.floor((data.length - 1) / 8))}
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
                label={{ value: `Ø ${avgPrice.toFixed(1)}`, fill: "hsl(215, 15%, 55%)", fontSize: 10 }}
              />
              {currentIdx !== undefined && currentIdx >= 0 && (
                <ReferenceLine
                  x={data[currentIdx].time}
                  stroke="hsl(155, 80%, 45%)"
                  strokeWidth={2}
                  label={{ value: "Jetzt", fill: "hsl(155, 80%, 45%)", fontSize: 10, position: "top" }}
                />
              )}
              <Area
                type="stepAfter"
                dataKey="price"
                stroke="hsl(155, 80%, 45%)"
                strokeWidth={2}
                fill="url(#priceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {data && (
        <div className="flex gap-4 mt-3 pt-3 border-t border-border">
          {[
            { label: "Min", value: Math.min(...data.map(d => d.price)).toFixed(2), cls: "text-success" },
            { label: "Max", value: Math.max(...data.map(d => d.price)).toFixed(2), cls: "text-warning" },
            { label: "Ø Heute", value: avgPrice.toFixed(2), cls: "text-foreground" },
          ].map((s) => (
            <div key={s.label} className="flex-1 text-center">
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
              <p className={`text-sm font-bold font-mono-numbers ${s.cls}`}>{s.value} <span className="text-[10px] text-muted-foreground font-normal">ct/kWh</span></p>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground italic mt-2 text-center">
        * Börsenstrompreis (EPEX SPOT AT) ohne Netzgebühren und Steuern
      </p>
    </motion.div>
  );
};

export default PriceChart;
