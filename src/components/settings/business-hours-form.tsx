"use client";

import { useState, useTransition } from "react";
import { updateBusinessHour } from "@/server/actions/settings";

interface Hour {
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const inputStyle = {
  background: "oklch(12% 0.018 36)",
  border: "1px solid var(--border)",
  color: "var(--foreground)",
};

function HourRow({ hour }: { hour: Hour }) {
  const [isPending, startTransition] = useTransition();
  const [opensAt, setOpensAt] = useState(hour.opensAt);
  const [closesAt, setClosesAt] = useState(hour.closesAt);
  const [isClosed, setIsClosed] = useState(hour.isClosed);
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(false);
    startTransition(async () => {
      const result = await updateBusinessHour(hour.dayOfWeek, opensAt, closesAt, isClosed);
      if (result.success) setSaved(true);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3" style={{ border: "1px solid var(--border)", background: "oklch(12% 0.018 36 / 0.4)" }}>
      <span className="w-24 text-sm" style={{ color: "var(--foreground)" }}>{DAY_NAMES[hour.dayOfWeek]}</span>
      <label className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted)" }}>
        <input type="checkbox" checked={isClosed} onChange={(e) => setIsClosed(e.target.checked)} className="h-3.5 w-3.5" />
        Closed
      </label>
      {!isClosed && (
        <>
          <input type="time" value={opensAt} onChange={(e) => setOpensAt(e.target.value)}
            className="rounded-lg px-2 py-1 text-xs" style={inputStyle} />
          <span className="text-xs" style={{ color: "var(--muted)" }}>–</span>
          <input type="time" value={closesAt} onChange={(e) => setClosesAt(e.target.value)}
            className="rounded-lg px-2 py-1 text-xs" style={inputStyle} />
        </>
      )}
      <button
        onClick={save}
        disabled={isPending}
        className="ml-auto rounded-lg px-3 py-1 text-xs font-medium transition hover:brightness-110"
        style={{ background: "oklch(20% 0.02 36)", border: "1px solid var(--border)", color: saved ? "oklch(72% 0.19 145)" : "var(--muted)" }}
      >
        {isPending ? "…" : saved ? "Saved ✓" : "Save"}
      </button>
    </div>
  );
}

export function BusinessHoursForm({ hours }: { hours: Hour[] }) {
  return (
    <div className="space-y-2">
      {hours.map((h) => <HourRow key={h.dayOfWeek} hour={h} />)}
    </div>
  );
}
