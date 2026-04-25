import { getDeliveryPageData } from "@/server/queries";
import { DeliveryCard } from "@/components/delivery/delivery-card";
import { OrderStatus } from "@prisma/client";

const COLUMNS = [
  {
    key: "ready" as const,
    label: "Ready for Dispatch",
    subtitle: "Assign a rider and dispatch",
    accent: "oklch(52% 0.19 230 / 0.12)",
    border: "oklch(52% 0.19 230 / 0.35)",
    status: OrderStatus.READY,
  },
  {
    key: "inTransit" as const,
    label: "Out for Delivery",
    subtitle: "Currently in transit",
    accent: "oklch(74% 0.13 82 / 0.1)",
    border: "oklch(74% 0.13 82 / 0.35)",
    status: OrderStatus.OUT_FOR_DELIVERY,
  },
] as const;

export default async function DeliveryPage() {
  const { ready, inTransit, riders } = await getDeliveryPageData();

  const data = { ready, inTransit };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {COLUMNS.map((col) => {
        const orders = data[col.key];
        return (
          <div key={col.key}>
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
                  <DeliveryCard
                    key={order.id}
                    orderId={order.id}
                    orderNumber={order.orderNumber}
                    customerName={order.customer.firstName}
                    deliveryAddress={order.deliveryAddressText ?? "—"}
                    placedAt={order.placedAt}
                    items={order.items}
                    status={col.status}
                    assignedRider={order.assignedDeliveryUser ?? null}
                    riders={riders}
                    otpVerification={order.otpVerification ?? null}
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
