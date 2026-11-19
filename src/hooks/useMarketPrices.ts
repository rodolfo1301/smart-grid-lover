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
  time: string; // HH:mm
  price: number; // ct/kWh
  timestamp: number; // start
  endTimestamp: number;
  intervalMinutes: number; // derived from end - start (60 or 15)
  recommendation: "laden" | "einspeisen" | "neutral";
}

export const PRICES_UNAVAILABLE_TEXT = "Börsenpreise derzeit nicht verfügbar";

function classifyPrice(price: number, avg: number): "laden" | "einspeisen" | "neutral" {
  if (price <= avg * 0.7) return "laden";
  if (price >= avg * 1.3) return "einspeisen";
  return "neutral";
}

async function fetchMarketPrices(): Promise<PriceDataPoint[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  end.setHours(23, 59, 59, 999);

  // Austrian price zone (AT), not DE
  const url = `https://api.awattar.at/v1/marketdata?start=${start.getTime()}&end=${end.getTime()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`aWATTar API error: ${res.status}`);

  const data: AwattarResponse = await res.json();
  if (!data?.data?.length) throw new Error(PRICES_UNAVAILABLE_TEXT);
  const prices = data.data.map((d) => d.marketprice / 10); // €/MWh → ct/kWh
  const avg = prices.reduce((s, p) => s + p, 0) / prices.length;

  return data.data.map((d) => {
    const date = new Date(d.start_timestamp);
    const ctPerKwh = Math.round((d.marketprice / 10) * 100) / 100;
    return {
      time: date.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }),
      price: ctPerKwh,
      timestamp: d.start_timestamp,
      endTimestamp: d.end_timestamp,
      intervalMinutes: Math.round((d.end_timestamp - d.start_timestamp) / 60000),
      recommendation: classifyPrice(ctPerKwh, avg),
    };
  });
}

export function useMarketPrices() {
  return useQuery({
    queryKey: ["market-prices"],
    queryFn: fetchMarketPrices,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 60 * 1000,
  });
}

export function getCurrentPrice(data: PriceDataPoint[], now = Date.now()): PriceDataPoint | undefined {
  return data.find((d) => d.timestamp <= now && d.endTimestamp > now);
}

export function getLowestPrice(data: PriceDataPoint[]): PriceDataPoint | undefined {
  if (!data.length) return undefined;
  return data.reduce((min, d) => (d.price < min.price ? d : min), data[0]);
}

export function getHighestPrice(data: PriceDataPoint[]): PriceDataPoint | undefined {
  if (!data.length) return undefined;
  return data.reduce((max, d) => (d.price > max.price ? d : max), data[0]);
}

/** Slots that start on the current local calendar day. */
export function getTodayPrices(data: PriceDataPoint[], now = Date.now()): PriceDataPoint[] {
  const s = new Date(now);
  s.setHours(0, 0, 0, 0);
  const e = new Date(s);
  e.setDate(e.getDate() + 1);
  return data.filter((d) => d.timestamp >= s.getTime() && d.timestamp < e.getTime());
}

/** Slots that have not ended yet. */
export function getUpcomingPrices(data: PriceDataPoint[], now = Date.now()): PriceDataPoint[] {
  return data.filter((d) => d.endTimestamp > now);
}

export interface PriceWindow {
  start: number;
  end: number;
  startTime: string;
  endTime: string;
  avgPrice: number; // time-weighted ct/kWh
}

const fmt = (ts: number) => new Date(ts).toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });

/**
 * Finds the contiguous window of `hours` length with the lowest (or highest) time-weighted
 * average price. Works with any interval length (15 min, 60 min).
 */
export function findPriceWindow(
  data: PriceDataPoint[],
  hours: number,
  mode: "cheapest" | "expensive" = "cheapest"
): PriceWindow | undefined {
  const target = hours * 60;
  let best: PriceWindow | undefined;
  for (let i = 0; i < data.length; i++) {
    let minutes = 0;
    let weighted = 0;
    let j = i;
    while (j < data.length && minutes < target) {
      if (j > i && data[j].timestamp !== data[j - 1].endTimestamp) break; // gap
      const take = Math.min(data[j].intervalMinutes, target - minutes);
      weighted += data[j].price * take;
      minutes += take;
      j++;
    }
    if (minutes < target) continue;
    const avg = weighted / minutes;
    const end = data[i].timestamp + target * 60000;
    if (!best || (mode === "cheapest" ? avg < best.avgPrice : avg > best.avgPrice)) {
      best = { start: data[i].timestamp, end, startTime: fmt(data[i].timestamp), endTime: fmt(end), avgPrice: avg };
    }
  }
  return best;
}

/** Time-weighted average ct/kWh per local hour (0–23). */
export function getHourlyAverages(data: PriceDataPoint[]): Record<number, number> {
  const sum: Record<number, number> = {};
  const min: Record<number, number> = {};
  data.forEach((d) => {
    const h = new Date(d.timestamp).getHours();
    sum[h] = (sum[h] || 0) + d.price * d.intervalMinutes;
    min[h] = (min[h] || 0) + d.intervalMinutes;
  });
  const out: Record<number, number> = {};
  Object.keys(sum).forEach((h) => (out[+h] = sum[+h] / min[+h]));
  return out;
}

/** € difference of shifting `kwh` from price `fromCt` to `toCt` (ct/kWh). */
export function shiftSavingEur(fromCt: number, toCt: number, kwh: number): number {
  return Math.max(0, ((fromCt - toCt) / 100) * kwh);
}

export const formatEur = (v: number) => v.toFixed(2).replace(".", ",");
