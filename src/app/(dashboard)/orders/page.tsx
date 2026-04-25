import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { OrderActions } from "@/components/orders/order-actions";
import { getOrdersPageData, getDeliveryUsers } from "@/server/queries";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default async function OrdersPage() {
  const [orders, riders] = await Promise.all([getOrdersPageData(), getDeliveryUsers()]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl text-stone-50">Orders</h1>
        <span className="text-sm" style={{ color: "var(--muted)" }}>
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </span>
      </div>

      {orders.length === 0 ? (
        <p className="mt-10 text-center text-sm" style={{ color: "var(--muted)" }}>
          No orders yet. Orders placed via the menu will appear here.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <div
              className="rounded-[24px] border border-white/10 bg-black/20 p-5"
              key={order.id}
            >
              {/* Header row */}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-semibold text-stone-50 hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                    <StatusBadge status={order.status} />
                    <StatusBadge status={order.paymentStatus} />
                  </div>
                  <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                    {order.customer.firstName}
                    {order.customer.lastName ? ` ${order.customer.lastName}` : ""}
                    {" · "}
                    {order.customer.phone}
                    {" · "}
                    {order.orderType.replaceAll("_", " ")}
                    {" · "}
                    {formatDateTime(order.placedAt)}
                  </p>

                  {/* Order items */}
                  {order.items.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {order.items.map((item) => (
                        <span
                          key={item.id}
                          className="rounded-full px-2.5 py-0.5 text-xs"
                          style={{
                            border: "1px solid var(--border)",
                            color: "var(--muted)",
                            background: "oklch(15% 0.022 36 / 0.5)",
                          }}
                        >
                          {item.quantity}× {item.nameSnapshot}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Rejection reason */}
                  {order.rejectionReason && (
                    <p className="mt-2 text-xs" style={{ color: "oklch(70% 0.2 25)" }}>
                      Reason: {order.rejectionReason}
                    </p>
                  )}

                  {/* Delivery address */}
                  {order.deliveryAddressText && order.orderType === "DELIVERY" && (
                    <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                      📍 {order.deliveryAddressText}
                    </p>
                  )}

                  {/* Status log timeline */}
                  {order.statusLogs.length > 0 && (
                    <div className="mt-4 space-y-1.5 border-l-2 pl-3" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                      {order.statusLogs.map((log) => (
                        <div key={log.id} className="flex items-start gap-2">
                          <span
                            className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ background: "var(--accent)" }}
                          />
                          <div>
                            <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                              {log.fromStatus ? `${log.fromStatus} → ` : ""}{log.toStatus}
                            </p>
                            {log.note && (
                              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                                {log.note}
                              </p>
                            )}
                            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                              {formatDateTime(log.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: total + actions */}
                <div className="flex flex-col items-end gap-3">
                  <p className="text-sm font-semibold text-amber-100">
                    {formatCurrency(order.totalInPaise)}
                  </p>
                  <OrderActions
                    orderId={order.id}
                    currentStatus={order.status}
                    orderType={order.orderType}
                    assignedRiderId={order.assignedDeliveryUser?.id ?? null}
                    riders={riders}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
