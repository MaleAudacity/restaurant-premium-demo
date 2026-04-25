import { Card } from "@/components/ui/card";
import { BookingForm } from "@/components/bookings/booking-form";
import { getSettingsPageData } from "@/server/queries";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function BookTablePage() {
  const { businessHours } = await getSettingsPageData();

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="p-8">
        <p className="text-xs uppercase tracking-[0.32em]" style={{ color: "var(--accent)" }}>
          Book a Table
        </p>
        <h1 className="mt-4 font-serif text-5xl" style={{ color: "var(--foreground)" }}>
          Reserve your experience
        </h1>
        <p className="mt-3 text-sm leading-6" style={{ color: "var(--muted)" }}>
          Private dinners, date nights, birthdays, and premium celebrations. We&apos;ll confirm your table within the hour.
        </p>
        <div className="mt-8">
          <BookingForm />
        </div>
      </Card>

      <Card className="p-8">
        <h2 className="font-serif text-3xl" style={{ color: "var(--foreground)" }}>Service hours</h2>
        <div className="mt-6 space-y-3 text-sm" style={{ color: "var(--muted)" }}>
          {businessHours.map((hour) => (
            <div
              className="flex items-center justify-between rounded-[20px] px-4 py-3"
              key={hour.dayOfWeek}
              style={{ border: "1px solid var(--border)", background: "oklch(15% 0.022 36 / 0.4)" }}
            >
              <span>{dayNames[hour.dayOfWeek]}</span>
              <span>{hour.isClosed ? "Closed" : `${hour.opensAt} – ${hour.closesAt}`}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          {["Window seating", "Private lounge", "Chef's table", "Outdoor terrace"].map((option) => (
            <div
              className="rounded-[20px] px-4 py-3 text-sm"
              key={option}
              style={{ border: "1px solid var(--border)", background: "oklch(15% 0.022 36 / 0.4)", color: "var(--muted)" }}
            >
              {option}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
