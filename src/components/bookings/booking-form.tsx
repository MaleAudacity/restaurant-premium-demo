"use client";

import { useState, useTransition } from "react";
import { createBooking } from "@/server/actions/bookings";
import { Button } from "@/components/ui/button";

const SEATING_OPTIONS = ["Window seating", "Private lounge", "Chef's table", "Outdoor terrace", "No preference"];
const OCCASION_OPTIONS = ["Birthday", "Anniversary", "Business dinner", "Proposal", "Family gathering", "None"];

export function BookingForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  const inputStyle = {
    background: "oklch(12% 0.018 36)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createBooking({
        firstName: fd.get("firstName") as string,
        lastName: fd.get("lastName") as string,
        phone: fd.get("phone") as string,
        email: fd.get("email") as string,
        guestCount: Number(fd.get("guestCount")),
        bookingDate: fd.get("bookingDate") as string,
        bookingTime: fd.get("bookingTime") as string,
        seatingPreference: fd.get("seatingPreference") as string,
        specialOccasion: fd.get("specialOccasion") as string,
        notes: fd.get("notes") as string,
      });

      if (!result.success) setError(result.error);
      else setBookingRef(result.bookingReference);
    });
  }

  if (bookingRef) {
    return (
      <div className="rounded-[28px] p-8 text-center space-y-4" style={{ background: "oklch(15% 0.022 36 / 0.4)", border: "1px solid oklch(52% 0.19 145 / 0.3)" }}>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "oklch(52% 0.19 145 / 0.2)" }}>
          <span className="text-2xl">✓</span>
        </div>
        <div>
          <p className="font-serif text-2xl text-stone-50">Booking confirmed!</p>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>Your reference number is</p>
          <p className="mt-2 font-mono text-3xl font-bold tracking-widest" style={{ color: "var(--accent)" }}>{bookingRef}</p>
          <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
            We&apos;ll confirm your table shortly. Please save your reference number.
          </p>
        </div>
        <Button onClick={() => setBookingRef(null)} variant="outline">Make another booking</Button>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs" style={{ color: "var(--muted)" }}>First name *</label>
          <input name="firstName" required className="mt-1 w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle} />
        </div>
        <div>
          <label className="text-xs" style={{ color: "var(--muted)" }}>Last name</label>
          <input name="lastName" className="mt-1 w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle} />
        </div>
        <div>
          <label className="text-xs" style={{ color: "var(--muted)" }}>Phone *</label>
          <input name="phone" type="tel" required className="mt-1 w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle} placeholder="+91 90000 00000" />
        </div>
        <div>
          <label className="text-xs" style={{ color: "var(--muted)" }}>Email</label>
          <input name="email" type="email" className="mt-1 w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle} />
        </div>
        <div>
          <label className="text-xs" style={{ color: "var(--muted)" }}>Date *</label>
          <input name="bookingDate" type="date" required min={today} className="mt-1 w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle} />
        </div>
        <div>
          <label className="text-xs" style={{ color: "var(--muted)" }}>Time *</label>
          <input name="bookingTime" type="time" required className="mt-1 w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle} />
        </div>
        <div>
          <label className="text-xs" style={{ color: "var(--muted)" }}>Guests *</label>
          <input name="guestCount" type="number" required min="1" max="50" defaultValue="2" className="mt-1 w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle} />
        </div>
        <div>
          <label className="text-xs" style={{ color: "var(--muted)" }}>Seating preference</label>
          <select name="seatingPreference" className="mt-1 w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle}>
            {SEATING_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs" style={{ color: "var(--muted)" }}>Special occasion</label>
        <select name="specialOccasion" className="mt-1 w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle}>
          {OCCASION_OPTIONS.map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs" style={{ color: "var(--muted)" }}>Special requests</label>
        <textarea name="notes" rows={3} className="mt-1 w-full rounded-xl px-4 py-2.5 text-sm" style={inputStyle} placeholder="Dietary requirements, accessibility needs, decorations…" />
      </div>

      {error && <p className="text-sm" style={{ color: "oklch(70% 0.2 25)" }}>{error}</p>}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Requesting table…" : "Request table"}
      </Button>
    </form>
  );
}
