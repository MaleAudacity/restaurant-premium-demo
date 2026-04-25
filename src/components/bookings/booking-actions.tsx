"use client";

import { useTransition, useState } from "react";
import { BookingStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { confirmBooking, cancelBooking, markBookingSeated } from "@/server/actions/bookings";

interface Props {
  bookingId: string;
  status: BookingStatus;
}

export function BookingActions({ bookingId, status }: Props) {
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
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-2">
        {status === BookingStatus.PENDING && (
          <Button size="sm" disabled={isPending} onClick={() => run(() => confirmBooking(bookingId))}
            style={{ background: "oklch(52% 0.19 145 / 0.85)" }}>
            {isPending ? "…" : "Confirm"}
          </Button>
        )}
        {status === BookingStatus.CONFIRMED && (
          <Button size="sm" disabled={isPending} onClick={() => run(() => markBookingSeated(bookingId))}
            style={{ background: "oklch(52% 0.19 230 / 0.85)" }}>
            {isPending ? "…" : "Mark Seated"}
          </Button>
        )}
        {(status === BookingStatus.PENDING || status === BookingStatus.CONFIRMED) && (
          <Button size="sm" variant="outline" disabled={isPending}
            onClick={() => run(() => cancelBooking(bookingId))}
            style={{ color: "oklch(70% 0.2 25)", borderColor: "oklch(60% 0.2 25 / 0.4)" }}>
            {isPending ? "…" : "Cancel"}
          </Button>
        )}
      </div>
      {error && <p className="text-xs" style={{ color: "oklch(70% 0.2 25)" }}>{error}</p>}
    </div>
  );
}
