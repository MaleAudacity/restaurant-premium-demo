"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createDeliveryZone, deleteDeliveryZone, toggleDeliveryZone } from "@/server/actions/settings";
import { formatCurrency } from "@/lib/utils";

interface Zone {
  id: string;
  name: string;
  minOrderInPaise: number;
  deliveryFeeInPaise: number;
  estimatedMinutes: number;
  isActive: boolean;
}

const inputStyle = {
  background: "oklch(12% 0.018 36)",
  border: "1px solid var(--border)",
  color: "var(--foreground)",
};

export function DeliveryZonesManager({ zones }: { zones: Zone[] }) {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createDeliveryZone(fd);
      if (result.success) setShowForm(false);
      else setError(result.error);
    });
  }

  return (
    <div className="space-y-3">
      {zones.map((zone) => (
        <ZoneRow key={zone.id} zone={zone} />
      ))}

      {showForm ? (
        <form onSubmit={handleCreate} className="rounded-2xl p-4 space-y-3" style={{ border: "1px solid var(--border)", background: "oklch(12% 0.018 36 / 0.4)" }}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs" style={{ color: "var(--muted)" }}>Zone name</label>
              <input name="name" required placeholder="e.g. Central Bengaluru" className="mt-1 w-full rounded-xl px-3 py-2 text-sm" style={inputStyle} />
            </div>
            <div>
              <label className="text-xs" style={{ color: "var(--muted)" }}>Min order (₹)</label>
              <input name="minOrder" type="number" min="0" step="10" defaultValue="200" className="mt-1 w-full rounded-xl px-3 py-2 text-sm" style={inputStyle} />
            </div>
            <div>
              <label className="text-xs" style={{ color: "var(--muted)" }}>Delivery fee (₹)</label>
              <input name="deliveryFee" type="number" min="0" step="5" defaultValue="49" className="mt-1 w-full rounded-xl px-3 py-2 text-sm" style={inputStyle} />
            </div>
            <div>
              <label className="text-xs" style={{ color: "var(--muted)" }}>Est. time (min)</label>
              <input name="estimatedMinutes" type="number" min="5" max="120" defaultValue="30" className="mt-1 w-full rounded-xl px-3 py-2 text-sm" style={inputStyle} />
            </div>
          </div>
          {error && <p className="text-xs" style={{ color: "oklch(70% 0.2 25)" }}>{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" type="submit" disabled={isPending}>{isPending ? "Adding…" : "Add zone"}</Button>
            <Button size="sm" type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>+ Add zone</Button>
      )}
    </div>
  );
}

function ZoneRow({ zone }: { zone: Zone }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3" style={{ border: "1px solid var(--border)", background: "oklch(12% 0.018 36 / 0.4)", opacity: zone.isActive ? 1 : 0.5 }}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{zone.name}</p>
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          Min {formatCurrency(zone.minOrderInPaise)} · Fee {formatCurrency(zone.deliveryFeeInPaise)} · ~{zone.estimatedMinutes} min
        </p>
      </div>
      <button
        disabled={isPending}
        onClick={() => startTransition(async () => { await toggleDeliveryZone(zone.id, !zone.isActive); })}
        className="text-xs px-2 py-1 rounded-lg transition"
        style={{ border: "1px solid var(--border)", color: zone.isActive ? "oklch(70% 0.18 75)" : "oklch(72% 0.19 145)" }}
      >
        {zone.isActive ? "Disable" : "Enable"}
      </button>
      <button
        disabled={isPending}
        onClick={() => { if (confirm(`Delete zone "${zone.name}"?`)) startTransition(async () => { await deleteDeliveryZone(zone.id); }); }}
        className="text-xs px-2 py-1 rounded-lg transition"
        style={{ border: "1px solid oklch(60% 0.2 25 / 0.4)", color: "oklch(70% 0.2 25)" }}
      >
        Delete
      </button>
    </div>
  );
}
