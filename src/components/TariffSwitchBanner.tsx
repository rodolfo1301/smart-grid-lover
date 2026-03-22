import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "wattly_tariff_dismissed";

const TariffSwitchBanner = () => {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");

  if (dismissed) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="relative border-2 border-primary/50 bg-primary/5 rounded-xl p-4 sm:p-5"
      >
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1 rounded-md hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <span className="text-2xl">💡</span>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-foreground">
              {(() => {
                const fixedPrice = parseFloat(localStorage.getItem("wattly_fixedPrice") || "28");
                const savings = Math.round(fixedPrice * 0.3 * 12 * 3.5);
                return `Du würdest mit einem dynamischen Tarif ~${savings}\u00A0€/Jahr sparen`;
              })()}
            </h3>
            <p className="text-xs text-muted-foreground">
              Basierend auf deinem Verbrauch und den aktuellen Börsenpreisen
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" variant="default" asChild>
                <a href="https://www.awattar.at" target="_blank" rel="noopener noreferrer" className="gap-1.5">
                  Zu aWATTar wechseln <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href="https://tibber.com/de" target="_blank" rel="noopener noreferrer" className="gap-1.5">
                  Zu Tibber wechseln <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TariffSwitchBanner;
