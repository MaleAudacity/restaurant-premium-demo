import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { BookingActions } from "@/components/bookings/booking-actions";
import { getBookingsPageDataFull } from "@/server/queries";
import { formatDateTime } from "@/lib/utils";

export default async function BookingsPage() {
  const bookings = await getBookingsPageDataFull();

  const pending = bookings.filter((b) => b.status === "PENDING");
  const upcoming = bookings.filter((b) => b.status === "CONFIRMED");
  const others = bookings.filter((b) => !["PENDING", "CONFIRMED"].includes(b.status));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl text-stone-50">Bookings</h1>
        <span className="text-sm" style={{ color: "var(--muted)" }}>{bookings.length} total</span>
      </div>

      {bookings.length === 0 && (
        <p className="mt-10 text-center text-sm" style={{ color: "var(--muted)" }}>
          No bookings yet. Customers can book from the public site.
        </p>
      )}

      {pending.length > 0 && (
        <Section title="Awaiting Confirmation" accent="oklch(52% 0.19 230 / 0.12)" border="oklch(52% 0.19 230 / 0.35)">
          {pending.map((b) => <BookingCard key={b.id} booking={b} />)}
        </Section>
      )}

      {upcoming.length > 0 && (
        <Section title="Confirmed" accent="oklch(52% 0.19 145 / 0.08)" border="oklch(52% 0.19 145 / 0.3)">
          {upcoming.map((b) => <BookingCard key={b.id} booking={b} />)}
        </Section>
      )}

      {others.length > 0 && (
        <Section title="Past / Other" accent="transparent" border="rgba(255,255,255,0.06)">
          {others.map((b) => <BookingCard key={b.id} booking={b} />)}
        </Section>
      )}
    </Card>
  );
}

function Section({ title, accent, border, children }: { title: string; accent: string; border: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <div className="mb-3 rounded-2xl px-4 py-2.5" style={{ background: accent, border: `1px solid ${border}` }}>
        <p className="text-sm font-semibold text-stone-50">{title}</p>
      </div>
      <div className="grid gap-3 xl:grid-cols-2">{children}</div>
    </div>
  );
}

type Booking = Awaited<ReturnType<typeof getBookingsPageDataFull>>[number];

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-stone-50">{booking.bookingReference}</p>
          <p className="mt-0.5 text-sm" style={{ color: "var(--muted)" }}>
            {booking.customer.firstName}
            {booking.customer.lastName ? ` ${booking.customer.lastName}` : ""} · {booking.customer.phone}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs" style={{ color: "var(--muted)" }}>
        <p>{formatDateTime(booking.bookingDateTime)}</p>
        <p>{booking.guestCount} guest{booking.guestCount !== 1 ? "s" : ""}</p>
        {booking.seatingPreference && <p>{booking.seatingPreference}</p>}
        {booking.specialOccasion && booking.specialOccasion !== "None" && <p>{booking.specialOccasion}</p>}
      </div>
      {booking.notes && (
        <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>{booking.notes}</p>
      )}
      <div className="mt-4">
        <BookingActions bookingId={booking.id} status={booking.status as any} />
      </div>
    </div>
  );
}
