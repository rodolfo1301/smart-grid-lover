import { Zap, Sun, Battery, Car, Thermometer, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import EnergyOverviewCard from "@/components/EnergyOverviewCard";
import PriceChart from "@/components/PriceChart";
import DeviceCard from "@/components/DeviceCard";
import SmartRecommendations from "@/components/SmartRecommendations";
import EnergyFlowDiagram from "@/components/EnergyFlowDiagram";
import HistoryChart from "@/components/HistoryChart";
import ThemeToggle from "@/components/ThemeToggle";
import { useMarketPrices, getCurrentPrice } from "@/hooks/useMarketPrices";

const Index = () => {
  const { data: prices } = useMarketPrices();
  const current = prices ? getCurrentPrice(prices) : undefined;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-energy">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                <span className="text-gradient-energy">WATTLY</span>
              </h1>
              <p className="text-xs text-muted-foreground">Smart Energy Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Live</span>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-success"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <EnergyOverviewCard
            title="PV-Erzeugung"
            value="3.8"
            unit="kW"
            icon={<Sun className="w-4 h-4 text-warning" />}
            trend="↑ 12% vs. gestern"
            trendPositive
            variant="energy"
          />
          <EnergyOverviewCard
            title="Verbrauch"
            value="1.2"
            unit="kW"
            icon={<BarChart3 className="w-4 h-4 text-accent" />}
            trend="↓ 8% vs. Durchschnitt"
            trendPositive
            variant="consumption"
          />
          <EnergyOverviewCard
            title="Einspeisung"
            value="2.6"
            unit="kW"
            icon={<TrendingUp className="w-4 h-4 text-primary" />}
            trend="+4,68 € heute"
            trendPositive
          />
          <EnergyOverviewCard
            title="Strompreis"
            value={current ? current.price.toFixed(1) : "—"}
            unit="ct/kWh"
            icon={<TrendingDown className="w-4 h-4 text-muted-foreground" />}
            trend={
              current
                ? current.recommendation === "laden"
                  ? "⚡ Günstig – jetzt laden"
                  : current.recommendation === "einspeisen"
                  ? "💰 Teuer – einspeisen"
                  : "— Neutral"
                : "Lade..."
            }
            trendPositive={current?.recommendation === "laden"}
          />
        </div>

        <EnergyFlowDiagram />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PriceChart />
          </div>
          <SmartRecommendations />
        </div>

        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Meine Geräte</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DeviceCard name="PV-Anlage" icon={<Sun className="w-5 h-5" />} status="Produziert aktiv" power="3.8 kW" isActive delay={0.1} deviceId="pv" />
            <DeviceCard name="Heimspeicher" icon={<Battery className="w-5 h-5" />} status="Laden · 92%" power="10.4 kWh" isActive delay={0.2} deviceId="battery" batteryPercent={92} />
            <DeviceCard name="E-Auto" icon={<Car className="w-5 h-5" />} status="Verbunden · 67%" power="45 kWh" isActive={false} delay={0.3} deviceId="ev" batteryPercent={67} />
            <DeviceCard name="Wärmepumpe" icon={<Thermometer className="w-5 h-5" />} status="Heizen · 22°C" power="2.1 kW" isActive delay={0.4} deviceId="heatpump" />
          </div>
        </div>

        <HistoryChart />
      </main>
    </div>
  );
};

export default Index;
