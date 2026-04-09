import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileCheck, AlertTriangle, Lightbulb, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarketPrices } from "@/hooks/useMarketPrices";
import {
  BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ComposedChart,
} from "recharts";

interface DataPoint {
  time: string;
  kwh: number;
}

interface HourlyBucket {
  hour: string;
  kwh: number;
  price: number | null;
}

const parseEVNcsv = (text: string): DataPoint[] => {
  const lines = text.trim().split("\n");
  const results: DataPoint[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(";");
    if (cols.length < 2) continue;
    const raw = cols[0].trim();
    // DD.MM.YYYY HH:mm
    const m = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})$/);
    if (!m) continue;
    const iso = `${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}`;
    const val = parseFloat(cols[1].trim().replace(",", "."));
    if (!isNaN(val)) results.push({ time: iso, kwh: val });
  }
  return results;
};

const SmartmeterImport = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: prices } = useMarketPrices();
  const [data, setData] = useState<DataPoint[] | null>(() => {
    try {
      const s = localStorage.getItem("wattly_smartmeter_data");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseEVNcsv(text);
      if (parsed.length > 0) {
        setData(parsed);
        localStorage.setItem("wattly_smartmeter_data", JSON.stringify(parsed));
      }
    };
    reader.readAsText(file, "utf-8");
  };

  const analysis = useMemo(() => {
    if (!data || data.length === 0) return null;

    const total = data.reduce((s, d) => s + d.kwh, 0);

    // group by hour
    const hourMap: Record<number, number> = {};
    data.forEach((d) => {
      const h = new Date(d.time).getHours();
      hourMap[h] = (hourMap[h] || 0) + d.kwh;
    });

    let peakHour = 0;
    let peakKwh = 0;
    Object.entries(hourMap).forEach(([h, kwh]) => {
      if (kwh > peakKwh) {
        peakHour = parseInt(h);
        peakKwh = kwh;
      }
    });

    // price lookup
    const priceMap: Record<number, number> = {};
    if (prices) {
      prices.forEach((p) => {
        const h = parseInt(p.time.split(":")[0]);
        priceMap[h] = p.price;
      });
    }

    const peakPrice = priceMap[peakHour] ?? 18;
    const cheapestHour = prices
      ? prices.reduce((best, p) => (p.price < best.price ? p : best), prices[0])
      : null;
    const cheapPrice = cheapestHour ? cheapestHour.price : 5;
    const cheapH = cheapestHour ? parseInt(cheapestHour.time.split(":")[0]) : 2;

    const costPeak = (peakPrice / 100) * peakKwh;
    const costCheap = (cheapPrice / 100) * peakKwh;
    const saving = costPeak - costCheap;

    // chart data
    const chartData: HourlyBucket[] = Array.from({ length: 24 }, (_, h) => ({
      hour: `${String(h).padStart(2, "0")}:00`,
      kwh: parseFloat((hourMap[h] || 0).toFixed(3)),
      price: priceMap[h] ?? null,
    }));

    return {
      count: data.length,
      total,
      peakHour,
      peakKwh,
      peakPrice,
      cheapH,
      cheapPrice,
      costPeak,
      saving,
      chartData,
    };
  }, [data, prices]);

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">📊 Mein Smartmeter</h3>
      </div>

      {!data && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Lade deine EVN Verbrauchsdaten hoch:
            <br />
            <span className="font-medium text-foreground">mein.evn.at → Smartmeter → Download</span>
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFile}
          />
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            EVN CSV importieren
          </Button>
        </div>
      )}

      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Stats */}
            <div className="space-y-2">
              <p className="text-sm text-primary font-medium flex items-center gap-1.5">
                <FileCheck className="w-4 h-4" /> {analysis.count} Messpunkte importiert
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground">Tagesverbrauch</p>
                  <p className="text-sm font-bold font-mono text-foreground">
                    {analysis.total.toFixed(2)} kWh
                  </p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground">Spitzenverbrauch</p>
                  <p className="text-sm font-bold font-mono text-foreground">
                    {String(analysis.peakHour).padStart(2, "0")}:00 ({analysis.peakKwh.toFixed(2)} kWh)
                  </p>
                </div>
              </div>
            </div>

            {/* Warnings */}
            <div className="space-y-2">
              <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-foreground">
                  <span className="font-medium">⚠️ Dein Spitzenverbrauch war um {String(analysis.peakHour).padStart(2, "0")}:00</span>
                  {" — "}das war eine der teuersten Stunden! Kostet dich ~{analysis.costPeak.toFixed(2)} €
                </p>
              </div>
              {analysis.saving > 0.01 && (
                <div className="flex items-start gap-2 bg-primary/10 border border-primary/20 rounded-lg p-3">
                  <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground">
                    <span className="font-medium">💡 Wenn du das auf {String(analysis.cheapH).padStart(2, "0")}:00 verschiebst:</span>
                    {" "}sparst du ~{analysis.saving.toFixed(2)} € pro Tag
                  </p>
                </div>
              )}
            </div>

            {/* Chart */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analysis.chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 9 }}
                    interval={3}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    yAxisId="kwh"
                    tick={{ fontSize: 9 }}
                    width={35}
                    label={{ value: "kWh", angle: -90, position: "insideLeft", fontSize: 9 }}
                  />
                  <YAxis
                    yAxisId="price"
                    orientation="right"
                    tick={{ fontSize: 9 }}
                    width={35}
                    label={{ value: "ct/kWh", angle: 90, position: "insideRight", fontSize: 9 }}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8 }}
                    formatter={(v: number, name: string) =>
                      name === "kwh"
                        ? [`${v.toFixed(3)} kWh`, "Verbrauch"]
                        : [`${v.toFixed(1)} ct`, "Preis"]
                    }
                  />
                  <Bar
                    yAxisId="kwh"
                    dataKey="kwh"
                    fill="hsl(var(--primary))"
                    opacity={0.6}
                    radius={[2, 2, 0, 0]}
                  />
                  <Line
                    yAxisId="price"
                    dataKey="price"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Re-import */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => fileRef.current?.click()}
              >
                Neue Daten importieren
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFile}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartmeterImport;
