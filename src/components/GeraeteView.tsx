import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Battery, Car, Thermometer, ChevronDown, Zap, Leaf } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import DeviceCard from "@/components/DeviceCard";
import EnergyFlowDiagram from "@/components/EnergyFlowDiagram";

interface DeviceStates {
  [key: string]: boolean;
}

interface GeraeteViewProps {
  deviceStates: DeviceStates;
  toggleDevice: (id: string) => void;
}

const GeraeteView = ({ deviceStates, toggleDevice }: GeraeteViewProps) => {
  const [expandedDevice, setExpandedDevice] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpandedDevice(expandedDevice === id ? null : id);
  };

  const devices = [
    { id: "pv", name: "PV-Anlage", icon: <Sun className="w-5 h-5" />, status: "Produziert aktiv", power: "3.8 kW" },
    { id: "battery", name: "Heimspeicher", icon: <Battery className="w-5 h-5" />, status: "Laden · 92%", power: "10.4 kWh", batteryPercent: 92 },
    { id: "ev", name: "E-Auto", icon: <Car className="w-5 h-5" />, status: "Verbunden · 67%", power: "45 kWh", batteryPercent: 67 },
    { id: "heatpump", name: "Wärmepumpe", icon: <Thermometer className="w-5 h-5" />, status: "Heizen · 22°C", power: "2.1 kW" },
  ];

  return (
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
      <div className="space-y-3">
        {devices.map((d, i) => (
          <div key={d.id} className="space-y-0">
            <div onClick={() => toggle(d.id)} className="relative">
              <DeviceCard
                name={d.name}
                icon={d.icon}
                status={d.status}
                power={d.power}
                isActive={deviceStates[d.id]}
                onToggle={() => toggleDevice(d.id)}
                delay={i * 0.05}
                deviceId={d.id}
                batteryPercent={d.batteryPercent}
                disableNav
              />
              <div className="absolute bottom-2 right-3">
                <motion.div animate={{ rotate: expandedDevice === d.id ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              </div>
            </div>
            <AnimatePresence>
              {expandedDevice === d.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="bg-gradient-card border border-t-0 border-border rounded-b-xl p-4 -mt-2 pt-5">
                    <DeviceSettings deviceId={d.id} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const DeviceSettings = ({ deviceId }: { deviceId: string }) => {
  const [evTarget, setEvTarget] = useState(80);
  const [batteryReserve, setBatteryReserve] = useState(20);
  const [heatTemp, setHeatTemp] = useState(22);

  if (deviceId === "pv") {
    return (
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Heutige Produktion</h4>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Peak" value="4.2 kW" icon={<Zap className="w-3 h-3 text-warning" />} />
          <Stat label="Gesamt" value="18.5 kWh" icon={<Sun className="w-3 h-3 text-warning" />} />
          <Stat label="CO₂ gespart" value="8.1 kg" icon={<Leaf className="w-3 h-3 text-success" />} />
        </div>
      </div>
    );
  }

  if (deviceId === "ev") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ziel-Ladezustand</h4>
          <span className="text-sm font-bold font-mono-numbers text-primary">{evTarget}%</span>
        </div>
        <Slider value={[evTarget]} onValueChange={([v]) => setEvTarget(v)} min={50} max={100} step={5} />
        <p className="text-[10px] text-muted-foreground">Auto wird bis {evTarget}% geladen</p>
      </div>
    );
  }

  if (deviceId === "battery") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mindest-Reserve</h4>
          <span className="text-sm font-bold font-mono-numbers text-primary">{batteryReserve}%</span>
        </div>
        <Slider value={[batteryReserve]} onValueChange={([v]) => setBatteryReserve(v)} min={10} max={50} step={5} />
        <p className="text-[10px] text-muted-foreground">Speicher entlädt nicht unter {batteryReserve}%</p>
      </div>
    );
  }

  if (deviceId === "heatpump") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Zieltemperatur</h4>
          <span className="text-sm font-bold font-mono-numbers text-primary">{heatTemp}°C</span>
        </div>
        <Slider value={[heatTemp]} onValueChange={([v]) => setHeatTemp(v)} min={18} max={24} step={0.5} />
        <p className="text-[10px] text-muted-foreground">Wärmepumpe heizt auf {heatTemp}°C</p>
      </div>
    );
  }

  return null;
};

const Stat = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
    <div className="flex items-center justify-center gap-1 mb-1">{icon}<span className="text-[10px] text-muted-foreground">{label}</span></div>
    <p className="text-sm font-bold font-mono-numbers text-foreground">{value}</p>
  </div>
);

export default GeraeteView;
