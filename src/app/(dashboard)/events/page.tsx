import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { getEventsPageData } from "@/server/queries";
import { formatDateOnly } from "@/lib/utils";

export default async function EventsPage() {
  const events = await getEventsPageData();

  return (
    <Card className="p-6">
      <h1 className="font-serif text-4xl text-stone-50">Event Inquiries</h1>
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {events.map((event) => (
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5" key={event.id}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-stone-50">{event.inquiryReference}</p>
                <p className="mt-1 text-sm text-stone-300/76">{event.eventType} • {event.guestCount} guests</p>
              </div>
              <StatusBadge status={event.status} />
            </div>
            <p className="mt-4 text-sm text-stone-300/76">
              {event.eventDate ? formatDateOnly(event.eventDate) : "Date pending"}
            </p>
            <p className="mt-2 text-sm text-stone-400">{event.budgetRange ?? "Budget pending"}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
