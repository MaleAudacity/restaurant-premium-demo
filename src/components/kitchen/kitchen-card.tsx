"use client";

import { useState, useTransition } from "react";
import { OrderStatus } from "@prisma/client";
import { startPreparing, markReady } from "@/server/actions/order-lifecycle";
import { Button } from "@/components/ui/button";

interface OrderItem {
  id: string;
  quantity: number;
  nameSnapshot: string;
}

interface Props {
  orderId: string;
  orderNumber: string;
  customerName: string;
  orderType: string;
  placedAt: Date;
  items: OrderItem[];
  status: OrderStatus;
}

function elapsed(from: Date): string {
  const mins = Math.floor((Date.now() - new Date(from).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

function urgencyColor(from: Date): string {
  const mins = Math.floor((Date.now() - new Date(from).getTime()) / 60000);
  if (mins >= 20) return "oklch(70% 0.2 25)";   // red — overdue
  if (mins >= 10) return "oklch(80% 0.18 75)";  // amber — getting old
  return "var(--muted)";                          // normal
}

export function KitchenCard({
  orderId,
  orderNumber,
  customerName,
  orderType,
  placedAt,
  items,
  status,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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
            {customerName} · {orderType.replace("_", " ")}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums"
          style={{
            color: urgencyColor(placedAt),
            border: `1px solid ${urgencyColor(placedAt)}40`,
            background: `${urgencyColor(placedAt)}15`,
          }}
        >
          {elapsed(placedAt)}
        </span>
      </div>

      {/* Items */}
      <div className="mt-4 space-y-1.5">
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

      {/* Action */}
      <div className="mt-5 space-y-1.5">
        {status === OrderStatus.CONFIRMED && (
          <Button
            size="sm"
            className="w-full"
            disabled={isPending}
            onClick={() => run(() => startPreparing(orderId))}
            style={{ background: "oklch(52% 0.19 230 / 0.85)" }}
          >
            {isPending ? "Updating…" : "Start Preparing"}
          </Button>
        )}

        {status === OrderStatus.PREPARING && (
          <Button
            size="sm"
            className="w-full"
            disabled={isPending}
            onClick={() => run(() => markReady(orderId))}
            style={{ background: "oklch(52% 0.19 145 / 0.85)" }}
          >
            {isPending ? "Updating…" : "Mark Ready ✓"}
          </Button>
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
