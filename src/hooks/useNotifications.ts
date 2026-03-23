import { useEffect, useState } from "react";
import { useMarketPrices } from "./useMarketPrices";

export const useNotifications = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const { data: prices } = useMarketPrices();

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  const scheduleNotifications = (priceData: any[]) => {
    if (permission !== "granted" || !priceData) return;

    const now = new Date();
    const upcoming = priceData.filter(p => new Date(p.timestamp) > now);

    upcoming.forEach((slot, i) => {
      const slotTime = new Date(slot.timestamp);
      const price = slot.price;

      const twoHoursBefore = new Date(slotTime.getTime() - 2 * 60 * 60 * 1000);
      const thirtyMinBefore = new Date(slotTime.getTime() - 30 * 60 * 1000);

      const delayTwoHours = twoHoursBefore.getTime() - now.getTime();
      const delayThirtyMin = thirtyMinBefore.getTime() - now.getTime();
      const delayNow = slotTime.getTime() - now.getTime();

      if (price < 5 && delayTwoHours > 0) {
        setTimeout(() => {
          new Notification("⏰ WATTLY – Günstiger Strom in 2 Stunden", {
            body: `Ab ${slotTime.toLocaleTimeString('de-AT', {hour:'2-digit',minute:'2-digit'})} nur ${price.toFixed(1)} ct/kWh → Jetzt Timer für Waschmaschine oder Geschirrspüler stellen!`,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            tag: `cheap-2h-${i}`
          });
        }, delayTwoHours);
      }

      if (price < 5 && delayNow > 0 && delayNow < 4 * 60 * 60 * 1000) {
        setTimeout(() => {
          new Notification("⚡ WATTLY – Jetzt günstiger Strom!", {
            body: `Aktuell nur ${price.toFixed(1)} ct/kWh – Günstigste Stunde! Waschmaschine, Geschirrspüler oder E-Auto jetzt starten!`,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            tag: `cheap-now-${i}`
          });
        }, delayNow);
      }

      if (price > 15 && delayThirtyMin > 0) {
        setTimeout(() => {
          new Notification("⚠️ WATTLY – Teurer Strom in 30 Minuten", {
            body: `Ab ${slotTime.toLocaleTimeString('de-AT', {hour:'2-digit',minute:'2-digit'})} kostet Strom ${price.toFixed(1)} ct/kWh → Große Geräte jetzt noch fertigmachen!`,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            tag: `expensive-30min-${i}`
          });
        }, delayThirtyMin);
      }

      if (price > 15 && delayNow > 0 && delayNow < 2 * 60 * 60 * 1000) {
        setTimeout(() => {
          new Notification("🔴 WATTLY – Strom jetzt teuer!", {
            body: `Aktuell ${price.toFixed(1)} ct/kWh – Unnötige Geräte ausschalten und Verbrauch reduzieren!`,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            tag: `expensive-now-${i}`
          });
        }, delayNow);
      }
    });
  };

  useEffect(() => {
    if (prices && permission === "granted") {
      scheduleNotifications(prices);
    }
  }, [prices, permission]);

  return { permission, requestPermission };
};
