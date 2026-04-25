"use client";

import { useState, useTransition } from "react";
import { OrderStatus } from "@prisma/client";
import {
  approveOrder,
  rejectOrder,
  cancelOrder,
  assignDelivery,
  startDelivery,
} from "@/server/actions/order-lifecycle";
import { Button } from "@/components/ui/button";

interface Rider {
  id: string;
  name: string;
}

interface Props {
  orderId: string;
  currentStatus: OrderStatus;
  orderType?: string;
  assignedRiderId?: string | null;
  riders?: Rider[];
}

export function OrderActions({
  orderId,
  currentStatus,
  orderType,
  assignedRiderId,
  riders = [],
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRiderId, setSelectedRiderId] = useState(assignedRiderId ?? "");

  function run(action: () => Promise<{ success: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success && result.error) setError(result.error);
    });
  }

  if (currentStatus === OrderStatus.PENDING) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => run(() => approveOrder(orderId))}
            style={{ background: "oklch(52% 0.19 145 / 0.85)" }}
          >
            {isPending ? "…" : "Approve"}
          </Button>

          {!showRejectForm && (
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => setShowRejectForm(true)}
              style={{ borderColor: "oklch(60% 0.2 25 / 0.5)", color: "oklch(70% 0.2 25)" }}
            >
              Reject
            </Button>
          )}
        </div>

        {showRejectForm && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="rounded-lg px-3 py-1.5 text-sm"
              placeholder="Reason (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{
                background: "oklch(15% 0.022 36)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => {
                run(() => rejectOrder(orderId, rejectReason));
                setShowRejectForm(false);
              }}
              style={{ background: "oklch(45% 0.2 25 / 0.85)" }}
            >
              {isPending ? "…" : "Confirm Reject"}
            </Button>
            <button
              className="text-xs"
              style={{ color: "var(--muted)" }}
              onClick={() => setShowRejectForm(false)}
            >
              Cancel
            </button>
          </div>
        )}

        {error && (
          <p className="text-xs" style={{ color: "oklch(70% 0.2 25)" }}>
            {error}
          </p>
        )}
      </div>
    );
  }

  if (currentStatus === OrderStatus.CONFIRMED) {
    return (
      <div className="space-y-1">
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => run(() => cancelOrder(orderId, "Cancelled by manager"))}
          style={{ borderColor: "oklch(60% 0.2 25 / 0.4)", color: "oklch(70% 0.2 25)" }}
        >
          {isPending ? "…" : "Cancel"}
        </Button>
        {error && (
          <p className="text-xs" style={{ color: "oklch(70% 0.2 25)" }}>
            {error}
          </p>
        )}
      </div>
    );
  }

  if (currentStatus === OrderStatus.READY && orderType === "DELIVERY") {
    return (
      <div className="space-y-2">
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

        {error && (
          <p className="text-xs" style={{ color: "oklch(70% 0.2 25)" }}>
            {error}
          </p>
        )}
      </div>
    );
  }

  return null;
}
