import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Note: Run this in Supabase SQL editor:
// CREATE POLICY "Anyone can sign up" ON email_signups
// FOR INSERT WITH CHECK (true);

interface EmailSignupProps {
  onDismiss?: () => void;
}

const EmailSignup = ({ onDismiss }: EmailSignupProps) => {
  const [email, setEmail] = useState(localStorage.getItem("wattly_email") || "");
  const [threshold, setThreshold] = useState(localStorage.getItem("wattly_alert_threshold") || "5");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(!!localStorage.getItem("wattly_email"));
  const [error, setError] = useState("");

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Bitte gib eine gültige Email-Adresse ein.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error: sbError } = await supabase
        .from("email_signups")
        .insert([{ email, threshold }]);
      if (sbError) throw sbError;
      localStorage.setItem("wattly_email", email);
      localStorage.setItem("wattly_alert_threshold", threshold);
      setSuccess(true);
    } catch (err) {
      setError("Fehler beim Speichern. Bitte versuche es nochmal.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-card border border-border rounded-xl p-5 space-y-2 relative"
      >
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 p-1 rounded-md hover:bg-secondary transition-colors text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xl">✅</span>
          <h3 className="text-base font-bold text-foreground">Email-Alerts aktiviert!</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Du bekommst eine Nachricht an{" "}
          <span className="font-medium text-foreground">{email}</span>{" "}
          wenn Strom unter {threshold} ct/kWh fällt.
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            localStorage.removeItem("wattly_email");
          }}
          className="text-xs text-muted-foreground underline mt-3 block"
        >
          Abmelden
        </button>
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
          Bekomme eine Email wenn Strom besonders günstig wird — funktioniert auf jedem Handy, auch iPhone.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="deine@email.at"
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
        />

        <select
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
        >
          <option value="3">unter 3 ct/kWh (sehr günstig)</option>
          <option value="5">unter 5 ct/kWh (günstig)</option>
          <option value="8">unter 8 ct/kWh (unter Durchschnitt)</option>
          <option value="15">über 15 ct/kWh (teuer — warnen)</option>
        </select>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Wird gespeichert..." : "⚡ Alerts aktivieren"}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          Kein Spam · Jederzeit abmeldbar · Kostenlos
        </p>
      </form>
    </motion.div>
  );
};

export default EmailSignup;
