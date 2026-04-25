"use client";

import { useState, useEffect } from "react";
import { saveSubscription } from "@/server/actions/push";

export function PushSubscribeButton({ customerId }: { customerId?: string }) {
  const [state, setState] = useState<"idle" | "subscribed" | "denied" | "unsupported">("idle");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    navigator.serviceWorker.register("/sw.js");
    Notification.permission === "granted"
      ? setState("subscribed")
      : Notification.permission === "denied"
      ? setState("denied")
      : setState("idle");
  }, []);

  async function subscribe() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });
    const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
    await saveSubscription(json, customerId);
    setState("subscribed");
  }

  if (state === "unsupported" || state === "denied") return null;

  if (state === "subscribed") {
    return (
      <div className="flex items-center gap-2 text-xs" style={{ color: "oklch(72% 0.19 145)" }}>
        <span>🔔</span> Notifications enabled
      </div>
    );
  }

  return (
    <button
      onClick={subscribe}
      className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition hover:brightness-110"
      style={{ background: "oklch(15% 0.02 36)", border: "1px solid var(--border)", color: "var(--muted)" }}
    >
      🔔 Enable notifications
    </button>
  );
}
