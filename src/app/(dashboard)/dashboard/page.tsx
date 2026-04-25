import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/ui/badge";
import { getDashboardSnapshot } from "@/server/queries";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default async function DashboardPage() {
  const snapshot = await getDashboardSnapshot();

  return (
    <div className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-4">
        {snapshot.stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <h2 className="font-serif text-3xl text-stone-50">Recent orders</h2>
          <div className="mt-6 space-y-4">
            {snapshot.orders.length ? (
              snapshot.orders.map((order) => (
                <div className="rounded-[24px] border border-white/10 bg-black/20 p-5" key={order.id}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-stone-50">{order.orderNumber}</p>
                      <p className="text-sm text-stone-300/75">
                        {order.customer.firstName} • {formatDateTime(order.placedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.status} />
                      <p className="text-sm font-semibold text-amber-100">
                        {formatCurrency(order.totalInPaise)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-stone-300/78">Seed the database to populate dashboard order cards.</p>
            )}
          </div>
        </Card>
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-serif text-3xl text-stone-50">Bookings & events</h2>
            <div className="mt-6 space-y-4">
              {[...snapshot.bookings, ...snapshot.events].slice(0, 6).map((entry) => (
                <div className="rounded-[24px] border border-white/10 bg-black/20 p-4" key={entry.id}>
                  <p className="font-semibold text-stone-50">
                    {"bookingReference" in entry ? entry.bookingReference : entry.inquiryReference}
                  </p>
                  <p className="mt-1 text-sm text-stone-300/76">
                    {"specialOccasion" in entry
                      ? entry.specialOccasion ?? "Dining reservation"
                      : entry.eventType}
                  </p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="font-serif text-3xl text-stone-50">Inventory pulse</h2>
            <div className="mt-6 space-y-3">
              {snapshot.inventory.map((entry) => (
                <div className="flex items-center justify-between rounded-[22px] border border-white/10 bg-black/20 px-4 py-3" key={entry.id}>
                  <div>
                    <p className="text-sm font-semibold text-stone-50">{entry.menuItem.name}</p>
                    <p className="text-xs text-stone-400">{entry.quantityAvailable ?? 0} portions available</p>
                  </div>
                  <StatusBadge status={entry.state} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
