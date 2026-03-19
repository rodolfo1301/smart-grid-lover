import { useQuery } from "@tanstack/react-query";

interface AwattarDataPoint {
  start_timestamp: number;
  end_timestamp: number;
  marketprice: number; // €/MWh
  unit: string;
}

interface AwattarResponse {
  object: string;
  data: AwattarDataPoint[];
}

export interface PriceDataPoint {
  time: string;
  price: number; // ct/kWh
  timestamp: number;
  recommendation: "laden" | "einspeisen" | "neutral";
}

function classifyPrice(price: number, avg: number): "laden" | "einspeisen" | "neutral" {
  if (price <= avg * 0.7) return "laden";
  if (price >= avg * 1.3) return "einspeisen";
  return "neutral";
}

async function fetchMarketPrices(): Promise<PriceDataPoint[]> {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  end.setHours(23, 59, 59, 999);

  const url = `https://api.awattar.de/v1/marketdata?start=${start.getTime()}&end=${end.getTime()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`aWATTar API error: ${res.status}`);
  
  const data: AwattarResponse = await res.json();
  const prices = data.data.map((d) => d.marketprice / 10); // €/MWh → ct/kWh
  const avg = prices.reduce((s, p) => s + p, 0) / prices.length;

  return data.data.map((d) => {
    const date = new Date(d.start_timestamp);
    const ctPerKwh = Math.round((d.marketprice / 10) * 100) / 100;
    return {
      time: date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
      price: ctPerKwh,
      timestamp: d.start_timestamp,
      recommendation: classifyPrice(ctPerKwh, avg),
    };
  });
}

export function useMarketPrices() {
  return useQuery({
    queryKey: ["market-prices"],
    queryFn: fetchMarketPrices,
    refetchInterval: 5 * 60 * 1000, // refresh every 5 min
    staleTime: 60 * 1000,
  });
}

export function getCurrentPrice(data: PriceDataPoint[]): PriceDataPoint | undefined {
  const now = Date.now();
  return data.find((d, i) => {
    const next = data[i + 1];
    return d.timestamp <= now && (!next || next.timestamp > now);
  });
}

export function getLowestPrice(data: PriceDataPoint[]): PriceDataPoint | undefined {
  return data.reduce((min, d) => (d.price < min.price ? d : min), data[0]);
}

export function getHighestPrice(data: PriceDataPoint[]): PriceDataPoint | undefined {
  return data.reduce((max, d) => (d.price > max.price ? d : max), data[0]);
}
