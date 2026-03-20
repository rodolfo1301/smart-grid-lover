import { Zap, Sun, Battery, Car, Thermometer, TrendingUp, TrendingDown, BarChart3, Home, Cpu, BarChart2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import EnergyOverviewCard from "@/components/EnergyOverviewCard";
import PriceChart from "@/components/PriceChart";
import DeviceCard from "@/components/DeviceCard";
import SmartRecommendations from "@/components/SmartRecommendations";
import EnergyFlowDiagram from "@/components/EnergyFlowDiagram";
import HistoryChart from "@/components/HistoryChart";
import ThemeToggle from "@/components/ThemeToggle";
import PriceAlertBanner from "@/components/PriceAlertBanner";
import { useMarketPrices, getCurrentPrice } from "@/hooks/useMarketPrices";

type TabId = "dashboard" | "preise" | "geraete" | "verlauf";

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
  { id: "preise", label: "Preise", icon: <TrendingUp className="w-5 h-5" /> },
  { id: "geraete", label: "Geräte", icon: <Cpu className="w-5 h-5" /> },
  { id: "verlauf", label: "Verlauf", icon: <BarChart2 className="w-5 h-5" /> },
];

const Index = () => {
  const { data: prices } = useMarketPrices();
  const current = prices ? getCurrentPrice(prices) : undefined;
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b border-border px-4 sm:px-6 py-4 sticky top-0 z-40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-energy">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                <span className="text-gradient-energy">WATTLY</span>
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Smart Energy Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">Live</span>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-success"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Price Alert Banner */}
      <PriceAlertBanner />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && <DashboardView current={current} />}
          {activeTab === "preise" && <PreiseView />}
          {activeTab === "geraete" && <GeraeteView />}
          {activeTab === "verlauf" && <VerlaufView />}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-around h-16">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px] ${
                activeTab === tab.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              <span className="text-[10px] font-medium">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 h-0.5 w-10 bg-primary rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

// ─── Dashboard View ───────────────────────────────────────
const DashboardView = ({ current }: { current?: { price: number; recommendation: string } }) => (
  <motion.div
    key="dashboard"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25 }}
    className="space-y-6"
  >
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <DeviceCard name="PV-Anlage" icon={<Sun className="w-5 h-5" />} status="Produziert aktiv" power="3.8 kW" isActive delay={0.1} deviceId="pv" />
        <DeviceCard name="Heimspeicher" icon={<Battery className="w-5 h-5" />} status="Laden · 92%" power="10.4 kWh" isActive delay={0.2} deviceId="battery" batteryPercent={92} />
        <DeviceCard name="E-Auto" icon={<Car className="w-5 h-5" />} status="Verbunden · 67%" power="45 kWh" isActive={false} delay={0.3} deviceId="ev" batteryPercent={67} />
        <DeviceCard name="Wärmepumpe" icon={<Thermometer className="w-5 h-5" />} status="Heizen · 22°C" power="2.1 kW" isActive delay={0.4} deviceId="heatpump" />
      </div>
    </div>

    <HistoryChart />
  </motion.div>
);

// ─── Preise View ──────────────────────────────────────────
const PreiseView = () => (
  <motion.div
    key="preise"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25 }}
    className="space-y-4"
  >
    <h2 className="text-lg font-bold text-foreground">Börsenstrompreise</h2>
    <PriceChart />
    <SmartRecommendations />
  </motion.div>
);

// ─── Geräte View ──────────────────────────────────────────
const GeraeteView = () => (
  <motion.div
    key="geraete"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25 }}
    className="space-y-4"
  >
    <h2 className="text-lg font-bold text-foreground">Meine Geräte</h2>
    <EnergyFlowDiagram />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <DeviceCard name="PV-Anlage" icon={<Sun className="w-5 h-5" />} status="Produziert aktiv" power="3.8 kW" isActive delay={0.05} deviceId="pv" />
      <DeviceCard name="Heimspeicher" icon={<Battery className="w-5 h-5" />} status="Laden · 92%" power="10.4 kWh" isActive delay={0.1} deviceId="battery" batteryPercent={92} />
      <DeviceCard name="E-Auto" icon={<Car className="w-5 h-5" />} status="Verbunden · 67%" power="45 kWh" isActive={false} delay={0.15} deviceId="ev" batteryPercent={67} />
      <DeviceCard name="Wärmepumpe" icon={<Thermometer className="w-5 h-5" />} status="Heizen · 22°C" power="2.1 kW" isActive delay={0.2} deviceId="heatpump" />
    </div>
  </motion.div>
);

// ─── Verlauf View ─────────────────────────────────────────
const VerlaufView = () => (
  <motion.div
    key="verlauf"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25 }}
    className="space-y-4"
  >
    <h2 className="text-lg font-bold text-foreground">Verlauf</h2>
    <HistoryChart />
  </motion.div>
);

export default Index;
