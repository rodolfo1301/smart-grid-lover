import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface EmailSignupProps {
  onDismiss?: () => void;
}

const THRESHOLDS = [
  { value: "5", label: "unter 5 ct/kWh (sehr günstig)" },
  { value: "8", label: "unter 8 ct/kWh (günstig)" },
  { value: "15", label: "über 15 ct/kWh (teuer)" },
  { value: "20", label: "über 20 ct/kWh (sehr teuer)" },
];

const EmailSignup = ({ onDismiss }: EmailSignupProps) => {
  const [email, setEmail] = useState(localStorage.getItem("wattly_email") || "");
  const [threshold, setThreshold] = useState(localStorage.getItem("wattly_alert_threshold") || "5");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    localStorage.setItem("wattly_email", email);
    localStorage.setItem("wattly_alert_threshold", threshold);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-card border border-border rounded-xl p-5 space-y-3"
      >
        <p className="text-sm font-medium text-success">
          ✅ Eingetragen! Du bekommst bald deinen ersten Alert.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-card border border-border rounded-xl p-5 space-y-4 relative"
    >
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1 rounded-md hover:bg-secondary transition-colors text-muted-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div>
        <h3 className="text-base font-bold text-foreground">📧 Preis-Alerts per Email</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Bekomme eine Email wenn Strom besonders günstig oder teuer wird — funktioniert auf jedem Handy
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Email-Adresse</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="deine@email.at"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Benachrichtigen wenn Preis...</Label>
          <select
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {THRESHOLDS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
          Alerts aktivieren
        </Button>
      </form>

      <p className="text-xs text-muted-foreground text-center">
        Kein Spam · Jederzeit abmeldbar
      </p>
    </motion.div>
  );
};

export default EmailSignup;
