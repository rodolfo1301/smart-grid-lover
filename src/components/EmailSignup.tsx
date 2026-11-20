import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CONTACT_EMAIL } from "@/lib/config";

// Note: Run this in Supabase SQL editor:
// CREATE POLICY "Anyone can sign up" ON email_signups
// FOR INSERT WITH CHECK (true);

interface EmailSignupProps {
  onDismiss?: () => void;
}

const EmailSignup = ({ onDismiss }: EmailSignupProps) => {
  const [email, setEmail] = useState(localStorage.getItem("wattly_email") || "");
  const [threshold, setThreshold] = useState(localStorage.getItem("wattly_alert_threshold") || "5");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(!!localStorage.getItem("wattly_email"));
  const [error, setError] = useState("");

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Bitte gib eine gültige Email-Adresse ein.");
      return;
    }
    if (!consent) {
      setError("Bitte bestätige die Einwilligung.");
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
      console.error("Email signup failed:", err);
      setError("Eintragen gerade nicht möglich. Bitte später nochmal versuchen.");
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
          <h3 className="text-base font-bold text-foreground">Du stehst auf der Warteliste</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Wir melden uns an{" "}
          <span className="font-medium text-foreground">{email}</span>,{" "}
          sobald die Preis-Alerts starten. Gewünschte Schwelle: {threshold} ct/kWh.
        </p>
        <p className="text-xs text-muted-foreground mt-3">
          Löschung deiner Adresse jederzeit{" "}
          {CONTACT_EMAIL ? (
            <>
              auf Anfrage an{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
                {CONTACT_EMAIL}
              </a>
            </>
          ) : (
            "auf Anfrage"
          )}
          .
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
        <h3 className="text-base font-bold text-foreground">📧 Preis-Alerts – Warteliste</h3>
        <p className="text-sm text-muted-foreground mt-1">
          E-Mail-Alerts sind in Vorbereitung. Trag dich ein und wir informieren dich, sobald sie starten.
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

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 accent-primary"
          />
          <span className="text-xs text-muted-foreground">
            Ich willige ein, dass WATTLY meine E-Mail-Adresse speichert, um mich über den Start der
            Preis-Alerts zu informieren. Die Einwilligung kann ich jederzeit widerrufen.
          </span>
        </label>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={loading || !consent}
          className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Wird gespeichert..." : "⚡ Auf Warteliste eintragen"}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          Kein Spam · Kostenlos
        </p>
      </form>
    </motion.div>
  );
};

export default EmailSignup;
