"use client";

import { useState, useTransition } from "react";
import { OrderStatus } from "@prisma/client";
import { assignDelivery, startDelivery, verifyAndCompleteDelivery } from "@/server/actions/order-lifecycle";
import { Button } from "@/components/ui/button";

interface OrderItem {
  id: string;
  quantity: number;
  nameSnapshot: string;
}

interface Rider {
  id: string;
  name: string;
}

interface OtpInfo {
  code: string;
  expiresAt: Date;
  usedAt: Date | null;
  attempts: number;
  maxAttempts: number;
}

interface Props {
  orderId: string;
  orderNumber: string;
  customerName: string;
  deliveryAddress: string;
  placedAt: Date;
  items: OrderItem[];
  status: OrderStatus;
  assignedRider: Rider | null;
  riders: Rider[];
  otpVerification: OtpInfo | null;
}

function elapsed(from: Date): string {
  const mins = Math.floor((Date.now() - new Date(from).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

export function DeliveryCard({
  orderId,
  orderNumber,
  customerName,
  deliveryAddress,
  placedAt,
  items,
  status,
  assignedRider,
  riders,
  otpVerification,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedRiderId, setSelectedRiderId] = useState(assignedRider?.id ?? "");
  const [enteredOtp, setEnteredOtp] = useState("");

  function run(action: () => Promise<{ success: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success && result.error) setError(result.error);
    });
  }

  return (
    <div
      className="rounded-[24px] border bg-black/20 p-5 transition-all"
      style={{ borderColor: "rgba(255,255,255,0.1)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-stone-50">{orderNumber}</p>
          <p className="mt-0.5 text-sm" style={{ color: "var(--muted)" }}>
            {customerName}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums"
          style={{
            color: "var(--muted)",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
          }}
        >
          {elapsed(placedAt)}
        </span>
      </div>

      {/* Address */}
      <p className="mt-3 text-xs" style={{ color: "var(--muted)" }}>
        {deliveryAddress}
      </p>

      {/* Items */}
      <div className="mt-3 space-y-1">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
              style={{ background: "var(--accent-strong)", color: "var(--foreground)" }}
            >
              {item.quantity}
            </span>
            <span className="text-sm" style={{ color: "var(--muted)" }}>
              {item.nameSnapshot}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-5 space-y-2">
        {status === OrderStatus.READY && (
          <>
            {riders.length > 0 && (
              <div className="flex gap-2">
                <select
                  className="flex-1 rounded-lg px-3 py-1.5 text-sm"
                  style={{
                    background: "oklch(15% 0.022 36)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                  value={selectedRiderId}
                  onChange={(e) => setSelectedRiderId(e.target.value)}
                  disabled={isPending}
                >
                  <option value="">— Assign rider —</option>
                  {riders.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  disabled={isPending || !selectedRiderId}
                  onClick={() => run(() => assignDelivery(orderId, selectedRiderId))}
                  style={{ background: "oklch(52% 0.19 230 / 0.85)" }}
                >
                  {isPending ? "…" : "Assign"}
                </Button>
              </div>
            )}

            <Button
              size="sm"
              className="w-full"
              disabled={isPending}
              onClick={() => run(() => startDelivery(orderId))}
              style={{ background: "oklch(74% 0.13 82 / 0.85)" }}
            >
              {isPending ? "Updating…" : "Dispatch →"}
            </Button>
          </>
        )}

        {status === OrderStatus.OUT_FOR_DELIVERY && (
          <>
            {/* Rider info */}
            <div
              className="rounded-xl px-3 py-2 text-sm"
              style={{ background: "oklch(52% 0.19 230 / 0.1)", color: "oklch(72% 0.19 230)" }}
            >
              {assignedRider ? `Rider: ${assignedRider.name}` : "In transit"}
            </div>

            {/* OTP display for demo — in production this goes to customer's phone */}
            {otpVerification && !otpVerification.usedAt && (
              <div
                className="rounded-xl px-3 py-2 text-center"
                style={{ background: "oklch(74% 0.13 82 / 0.08)", border: "1px solid oklch(74% 0.13 82 / 0.25)" }}
              >
                <p className="text-xs" style={{ color: "var(--muted)" }}>Customer OTP</p>
                <p className="mt-0.5 font-mono text-2xl font-bold tracking-widest" style={{ color: "oklch(85% 0.13 82)" }}>
                  {otpVerification.code}
                </p>
                <p className="mt-0.5 text-[10px]" style={{ color: "var(--muted)" }}>
                  Share with customer · expires in 30 min
                </p>
              </div>
            )}

            {/* OTP verify form */}
            {otpVerification && !otpVerification.usedAt && (
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg px-3 py-1.5 text-center font-mono text-sm tracking-widest"
                  placeholder="Enter OTP"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                  disabled={isPending}
                  style={{
                    background: "oklch(15% 0.022 36)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                />
                <Button
                  size="sm"
                  disabled={isPending || enteredOtp.length !== 6}
                  onClick={() => run(() => verifyAndCompleteDelivery(orderId, enteredOtp))}
                  style={{ background: "oklch(52% 0.19 145 / 0.85)" }}
                >
                  {isPending ? "…" : "Verify ✓"}
                </Button>
              </div>
            )}

            {otpVerification?.usedAt && (
              <div
                className="rounded-xl px-3 py-2 text-sm text-center"
                style={{ background: "oklch(52% 0.19 145 / 0.12)", color: "oklch(72% 0.19 145)" }}
              >
                OTP verified — delivery complete
              </div>
            )}
          </>
        )}

        {error && (
          <p className="text-xs" style={{ color: "oklch(70% 0.2 25)" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
