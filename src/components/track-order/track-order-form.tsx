"use client";

import { useState, useTransition } from "react";
import { trackOrder, type TrackOrderResult } from "@/server/actions/orders";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const STATUS_STEPS = [
  { key: "PENDING", label: "Order placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PREPARING", label: "Being prepared" },
  { key: "READY", label: "Ready" },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { key: "COMPLETED", label: "Delivered" },
];

function stepIndex(status: string) {
  const i = STATUS_STEPS.findIndex((s) => s.key === status);
  return i === -1 ? 0 : i;
}

export function TrackOrderForm() {
  const [isPending, startTransition] = useTransition();
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<TrackOrderResult | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await trackOrder(orderNumber, phone);
      setResult(res);
    });
  }

  const activeStep = result?.found ? stepIndex(result.status) : -1;

  return (
    <div className="mt-8 space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-[24px] border p-6 space-y-4"
        style={{ borderColor: "var(--border)", background: "oklch(15% 0.022 36 / 0.4)" }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs" style={{ color: "var(--muted)" }}>
              Order Number
            </label>
            <input
              className="w-full rounded-xl px-4 py-2.5 text-sm font-mono tracking-wider"
              placeholder="MM-1001"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              required
              style={{
                background: "oklch(12% 0.018 36)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs" style={{ color: "var(--muted)" }}>
              Phone Number
            </label>
            <input
              className="w-full rounded-xl px-4 py-2.5 text-sm"
              placeholder="+91 90000 10001"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={{
                background: "oklch(12% 0.018 36)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>
        </div>
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Searching…" : "Track Order"}
        </Button>
      </form>

      {result && !result.found && (
        <div
          className="rounded-[24px] border p-5 text-sm text-center"
          style={{ borderColor: "oklch(60% 0.2 25 / 0.4)", color: "oklch(70% 0.2 25)" }}
        >
          {result.error}
        </div>
      )}

      {result?.found && (
        <div
          className="rounded-[24px] border p-6 space-y-6"
          style={{ borderColor: "var(--border)", background: "oklch(15% 0.022 36 / 0.4)" }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs" style={{ color: "var(--muted)" }}>Order number</p>
              <p className="font-mono text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                {result.orderNumber}
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                Placed {formatDateTime(result.placedAt)} · {formatCurrency(result.totalInPaise)}
              </p>
            </div>
          </div>

          {/* Progress steps */}
          <div className="space-y-2">
            {STATUS_STEPS.map((step, i) => {
              const done = i < activeStep;
              const active = i === activeStep;
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      background: active
                        ? "var(--accent)"
                        : done
                          ? "oklch(52% 0.19 145 / 0.5)"
                          : "rgba(255,255,255,0.06)",
                      color: active || done ? "var(--foreground)" : "var(--muted)",
                    }}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <p
                    className="text-sm"
                    style={{
                      color: active ? "var(--foreground)" : done ? "oklch(72% 0.19 145)" : "var(--muted)",
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Items */}
          <div className="space-y-1">
            {result.items.map((item, i) => (
              <p key={i} className="text-sm" style={{ color: "var(--muted)" }}>
                {item.quantity}× {item.name}
              </p>
            ))}
          </div>

          {/* OTP — shown only when OUT_FOR_DELIVERY */}
          {result.otp && (
            <div
              className="rounded-2xl p-5 text-center"
              style={{
                background: "oklch(74% 0.13 82 / 0.08)",
                border: "1px solid oklch(74% 0.13 82 / 0.3)",
              }}
            >
              <p className="text-xs font-medium" style={{ color: "oklch(74% 0.13 82)" }}>
                Your delivery OTP
              </p>
              <p className="mt-2 font-mono text-4xl font-bold tracking-[0.3em]" style={{ color: "oklch(88% 0.13 82)" }}>
                {result.otp}
              </p>
              <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
                Share this code with your delivery rider to confirm receipt
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
