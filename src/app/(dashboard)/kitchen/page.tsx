import { KitchenCard } from "@/components/kitchen/kitchen-card";
import { getKitchenPageData } from "@/server/queries";
import { OrderStatus } from "@prisma/client";

const COLUMNS = [
  {
    key: "confirmed" as const,
    label: "Queue",
    subtitle: "Approved — start preparing",
    accent: "oklch(52% 0.19 230 / 0.12)",
    border: "oklch(52% 0.19 230 / 0.35)",
    status: OrderStatus.CONFIRMED,
  },
  {
    key: "preparing" as const,
    label: "Preparing",
    subtitle: "In the kitchen now",
    accent: "oklch(74% 0.13 82 / 0.1)",
    border: "oklch(74% 0.13 82 / 0.35)",
    status: OrderStatus.PREPARING,
  },
  {
    key: "ready" as const,
    label: "Ready",
    subtitle: "Awaiting pickup / dispatch",
    accent: "oklch(52% 0.19 145 / 0.1)",
    border: "oklch(52% 0.19 145 / 0.35)",
    status: OrderStatus.READY,
  },
] as const;

export default async function KitchenPage() {
  const queue = await getKitchenPageData();

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      {COLUMNS.map((col) => {
        const orders = queue[col.key];
        return (
          <div key={col.key}>
            {/* Column header */}
            <div
              className="mb-4 rounded-2xl px-5 py-3"
              style={{ background: col.accent, border: `1px solid ${col.border}` }}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-stone-50">{col.label}</p>
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: col.border, color: "var(--foreground)" }}
                >
                  {orders.length}
                </span>
              </div>
              <p className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>
                {col.subtitle}
              </p>
            </div>

            {/* Cards */}
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div
                  className="rounded-[24px] border border-dashed p-8 text-center text-sm"
                  style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                >
                  No orders
                </div>
              ) : (
                orders.map((order) => (
                  <KitchenCard
                    key={order.id}
                    orderId={order.id}
                    orderNumber={order.orderNumber}
                    customerName={order.customer.firstName}
                    orderType={order.orderType}
                    placedAt={order.placedAt}
                    items={order.items}
                    status={col.status}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
