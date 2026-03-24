import { useEffect, useState } from "react";
import { useMarketPrices } from "./useMarketPrices";

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const { data: prices } = useMarketPrices();

  const requestPermission = async () => {
    if (typeof Notification === "undefined") return "denied";
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  const sendNotification = (title: string, body: string, tag: string) => {
    if (permission !== "granted") return;
    new Notification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag,
    });
  };

  useEffect(() => {
    if (!prices || permission !== "granted") return;

    const now = new Date();

    prices.forEach((slot: any, i: number) => {
      const slotTime = new Date(slot.start_timestamp);
      const price = slot.marketprice / 10;

      const delayNow = slotTime.getTime() - now.getTime();
      const delay2h = delayNow - 2 * 60 * 60 * 1000;
      const delay30m = delayNow - 30 * 60 * 1000;

      const cheapThreshold = Number(
        localStorage.getItem("wattly_notif_cheap") || "5"
      );
      const expensiveThreshold = Number(
        localStorage.getItem("wattly_notif_expensive") || "15"
      );

      const notif2h = localStorage.getItem("wattly_notif_2h") !== "false";
      const notifNow = localStorage.getItem("wattly_notif_now") !== "false";
      const notif30m = localStorage.getItem("wattly_notif_30m") !== "false";
      const notifExpNow = localStorage.getItem("wattly_notif_exp_now") !== "false";

      const time = slotTime.toLocaleTimeString("de-AT", {
        hour: "2-digit", minute: "2-digit"
      });

      if (price <= cheapThreshold) {
        if (notif2h && delay2h > 0)
          setTimeout(() => sendNotification(
            "⏰ Günstiger Strom in 2 Stunden",
            `Ab ${time} nur ${price.toFixed(1)} ct/kWh → Timer für Waschmaschine oder Geschirrspüler stellen!`,
            `cheap-2h-${i}`
          ), delay2h);

        if (notifNow && delayNow > 0 && delayNow < 4 * 3600 * 1000)
          setTimeout(() => sendNotification(
            "⚡ Jetzt günstiger Strom!",
            `Aktuell ${price.toFixed(1)} ct/kWh → Waschmaschine, Geschirrspüler oder E-Auto jetzt starten!`,
            `cheap-now-${i}`
          ), delayNow);
      }

      if (price >= expensiveThreshold) {
        if (notif30m && delay30m > 0)
          setTimeout(() => sendNotification(
            "⚠️ Teurer Strom in 30 Minuten",
            `Ab ${time} kostet Strom ${price.toFixed(1)} ct/kWh → Große Geräte jetzt noch fertigmachen!`,
            `exp-30m-${i}`
          ), delay30m);

        if (notifExpNow && delayNow > 0 && delayNow < 2 * 3600 * 1000)
          setTimeout(() => sendNotification(
            "🔴 Strom jetzt teuer!",
            `Aktuell ${price.toFixed(1)} ct/kWh → Unnötige Geräte ausschalten!`,
            `exp-now-${i}`
          ), delayNow);
      }
    });
  }, [prices, permission]);

  return { permission, requestPermission };
};
