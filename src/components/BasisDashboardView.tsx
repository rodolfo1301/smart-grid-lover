import { useState } from "react";
import { motion } from "framer-motion";
import {
  WashingMachine, CookingPot, Wind, Flame, Droplets, Zap, Battery, ArrowRight,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import PriceChart from "@/components/PriceChart";
import SmartRecommendations from "@/components/SmartRecommendations";
import SavingsCounter from "@/components/SavingsCounter";
import SmartmeterImport from "@/components/SmartmeterImport";
import EmailSignup from "@/components/EmailSignup";
import { useMarketPrices } from "@/hooks/useMarketPrices";

interface Appliance {
  id: string;
  name: string;
  icon: React.ReactNode;
  power: string;
  kw: number;
}

const APPLIANCES: Appliance[] = [
  { id: "washer", name: "Waschmaschine", icon: <WashingMachine className="w-5 h-5" />, power: "2.2 kW", kw: 2.2 },
  { id: "dishwasher", name: "Geschirrspüler", icon: <Droplets className="w-5 h-5" />, power: "1.8 kW", kw: 1.8 },
  { id: "dryer", name: "Trockner", icon: <Wind className="w-5 h-5" />, power: "3.5 kW", kw: 3.5 },
  { id: "oven", name: "Backofen", icon: <Flame className="w-5 h-5" />, power: "2.1 kW", kw: 2.1 },
  { id: "ac", name: "Klimaanlage", icon: <Wind className="w-5 h-5" />, power: "1.5 kW", kw: 1.5 },
  { id: "boiler", name: "Warmwasserboiler", icon: <Droplets className="w-5 h-5" />, power: "2.0 kW", kw: 2.0 },
];

interface BasisDashboardViewProps {
  onReOnboard: () => void;
}

const BasisDashboardView = ({ onReOnboard }: BasisDashboardViewProps) => {
  const { data: prices } = useMarketPrices();
  const [applianceStates, setApplianceStates] = useState<Record<string, boolean>>(() => {
    try {
      const v = localStorage.getItem("wattly_applianceStates");
      return v ? JSON.parse(v) : {};
    } catch { return {}; }
  });
  const [monthlyKwh, setMonthlyKwh] = useState(() => localStorage.getItem("wattly_monthlyKwh") || "350");
  const [emailDismissed, setEmailDismissed] = useState(() => localStorage.getItem("wattly_email_dismissed") === "true");

  const toggleAppliance = (id: string) => {
    setApplianceStates((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem("wattly_applianceStates", JSON.stringify(next));
      return next;
    });
  };

  // Find cheapest 2-hour window
  const getCheapestWindow = (): string => {
    if (!prices || prices.length < 2) return "—";
    let minSum = Infinity;
    let bestIdx = 0;
    for (let i = 0; i < prices.length - 1; i++) {
      const sum = prices[i].price + prices[i + 1].price;
      if (sum < minSum) { minSum = sum; bestIdx = i; }
    }
    return `${prices[bestIdx].time}–${prices[bestIdx + 1]?.time ?? ""}`;
  };

  const cheapestWindow = getCheapestWindow();
  const kwh = parseFloat(monthlyKwh) || 350;
  const gridPrice = parseFloat(localStorage.getItem("wattly_fixedPrice") || "30");
  const monthlyCost = (kwh * gridPrice) / 100;
  const dynamicSavings = Math.round(kwh * 0.04); // ~4ct/kWh average savings estimate
  const lastMonthKwh = kwh * 1.05;
  const progressPercent = Math.min(100, Math.round((kwh / lastMonthKwh) * 100));

  return (
    <motion.div
      key="basis-dashboard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <SmartmeterImport />
      <SavingsCounter />

      {/* Mein Verbrauch */}
      <section className="bg-card border border-border rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Mein Verbrauch</h3>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Monatsverbrauch (kWh)</Label>
          <Input
            type="number"
            value={monthlyKwh}
            onChange={(e) => {
              setMonthlyKwh(e.target.value);
              localStorage.setItem("wattly_monthlyKwh", e.target.value);
            }}
            className="font-mono max-w-[140px]"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Geschätzte Kosten</p>
            <p className="text-xl font-bold text-foreground font-mono">{monthlyCost.toFixed(0)} €<span className="text-sm font-normal text-muted-foreground">/Monat</span></p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Sparpotenzial (dyn. Tarif)</p>
            <p className="text-xl font-bold text-primary font-mono">~{dynamicSavings} €<span className="text-sm font-normal text-muted-foreground">/Monat</span></p>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Dieser Monat vs. letzter Monat</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </section>

      {/* Price Chart */}
      <PriceChart />

      {/* Haushaltsgeräte */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Haushaltsgeräte – Smarte Planung</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {APPLIANCES.map((a) => {
            const isOn = applianceStates[a.id] ?? false;
            return (
              <div
                key={a.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isOn ? "border-primary/50 bg-primary/5" : "border-border bg-card"
                }`}
              >
                <div className={`p-2 rounded-lg ${isOn ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.power}</p>
                  <p className="text-xs text-primary">Beste Zeit: {cheapestWindow}</p>
                </div>
                <Switch checked={isOn} onCheckedChange={() => toggleAppliance(a.id)} />
              </div>
            );
          })}
        </div>
      </section>

      <SmartRecommendations />

      {/* Email Alerts */}
      {!emailDismissed && (
        <EmailSignup onDismiss={() => { localStorage.setItem("wattly_email_dismissed", "true"); setEmailDismissed(true); }} />
      )}

      {/* Upgrade Banner */}
      <section className="rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-5 text-center space-y-3">
        <div className="flex justify-center">
          <Battery className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-base font-bold text-foreground">Hast du eine PV-Anlage oder E-Auto?</h3>
        <p className="text-sm text-muted-foreground">Schalte den vollen WATTLY-Autopiloten frei</p>
        <Button onClick={onReOnboard} className="gap-2">
          Geräte hinzufügen <ArrowRight className="w-4 h-4" />
        </Button>
      </section>
    </motion.div>
  );
};

export default BasisDashboardView;
