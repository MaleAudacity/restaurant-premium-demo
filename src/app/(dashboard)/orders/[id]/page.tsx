import { notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { getOrderDetail, getDeliveryUsers } from "@/server/queries";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { OrderActions } from "@/components/orders/order-actions";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, riders] = await Promise.all([getOrderDetail(id), getDeliveryUsers()]);

  if (!order) notFound();

  const payment = order.payments[0] ?? null;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/orders"
        className="text-sm"
        style={{ color: "var(--muted)" }}
      >
        ← Back to Orders
      </Link>

      {/* Header card */}
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em]" style={{ color: "var(--accent)" }}>
              Order
            </p>
            <h1 className="mt-1 font-serif text-4xl text-stone-50">{order.orderNumber}</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
              Placed {formatDateTime(order.placedAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={order.status} />
            <StatusBadge status={order.paymentStatus} />
          </div>
        </div>

        <div className="mt-6">
          <OrderActions
            orderId={order.id}
            currentStatus={order.status}
            orderType={order.orderType}
            assignedRiderId={order.assignedDeliveryUser?.id ?? null}
            riders={riders}
          />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer + delivery */}
        <Card className="p-6 space-y-5">
          <h2 className="font-serif text-2xl text-stone-50">Customer</h2>
          <div className="space-y-1 text-sm" style={{ color: "var(--muted)" }}>
            <p>
              {order.customer.firstName}
              {order.customer.lastName ? ` ${order.customer.lastName}` : ""}
            </p>
            <p>{order.customer.phone}</p>
            {order.customer.email && <p>{order.customer.email}</p>}
          </div>

          <div className="border-t pt-4" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
              Order info
            </p>
            <div className="space-y-1 text-sm" style={{ color: "var(--muted)" }}>
              <p>Type: {order.orderType.replaceAll("_", " ")}</p>
              {order.deliveryAddressText && (
                <p>Address: {order.deliveryAddressText}</p>
              )}
              {order.assignedDeliveryUser && (
                <p>Rider: {order.assignedDeliveryUser.name}</p>
              )}
              {order.deliveredAt && (
                <p>Delivered: {formatDateTime(order.deliveredAt)}</p>
              )}
              {order.rejectionReason && (
                <p style={{ color: "oklch(70% 0.2 25)" }}>Reason: {order.rejectionReason}</p>
              )}
            </div>
          </div>

          {/* Payment */}
          {payment && (
            <div className="border-t pt-4" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                Payment
              </p>
              <div className="space-y-1 text-sm" style={{ color: "var(--muted)" }}>
                <p>Method: {order.paymentMethod ?? "—"}</p>
                <p>Provider: {payment.provider ?? "—"}</p>
                <p>Ref: {payment.reference ?? "—"}</p>
                {payment.failureReason && (
                  <p style={{ color: "oklch(70% 0.2 25)" }}>{payment.failureReason}</p>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Items + totals */}
        <Card className="p-6 space-y-5">
          <h2 className="font-serif text-2xl text-stone-50">Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                    style={{ background: "var(--accent-strong)", color: "var(--foreground)" }}
                  >
                    {item.quantity}
                  </span>
                  <span style={{ color: "var(--muted)" }}>{item.nameSnapshot}</span>
                </div>
                <span style={{ color: "var(--muted)" }}>
                  {formatCurrency(item.totalPriceInPaise)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-1 text-sm" style={{ borderColor: "var(--border)" }}>
            <div className="flex justify-between" style={{ color: "var(--muted)" }}>
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotalInPaise)}</span>
            </div>
            {order.deliveryFeeInPaise > 0 && (
              <div className="flex justify-between" style={{ color: "var(--muted)" }}>
                <span>Delivery</span>
                <span>{formatCurrency(order.deliveryFeeInPaise)}</span>
              </div>
            )}
            <div className="flex justify-between" style={{ color: "var(--muted)" }}>
              <span>Tax</span>
              <span>{formatCurrency(order.taxInPaise)}</span>
            </div>
            <div className="flex justify-between pt-2 font-semibold text-amber-100">
              <span>Total</span>
              <span>{formatCurrency(order.totalInPaise)}</span>
            </div>
          </div>

          {/* OTP status */}
          {order.otpVerification && (
            <div className="border-t pt-4" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                OTP Verification
              </p>
              <p className="text-sm" style={{ color: order.otpVerification.usedAt ? "oklch(72% 0.19 145)" : "var(--muted)" }}>
                {order.otpVerification.usedAt
                  ? `Verified at ${formatDateTime(order.otpVerification.usedAt)}`
                  : `Pending · ${order.otpVerification.attempts} attempt${order.otpVerification.attempts !== 1 ? "s" : ""}`}
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Status history */}
      {order.statusLogs.length > 0 && (
        <Card className="p-6">
          <h2 className="font-serif text-2xl text-stone-50 mb-5">Status History</h2>
          <div className="relative space-y-0">
            {order.statusLogs.map((log, i) => (
              <div key={log.id} className="flex gap-4">
                {/* Timeline spine */}
                <div className="flex flex-col items-center">
                  <div
                    className="h-3 w-3 rounded-full shrink-0 mt-1"
                    style={{ background: i === order.statusLogs.length - 1 ? "var(--accent)" : "rgba(255,255,255,0.2)" }}
                  />
                  {i < order.statusLogs.length - 1 && (
                    <div className="w-px flex-1 my-1" style={{ background: "rgba(255,255,255,0.08)", minHeight: "24px" }} />
                  )}
                </div>
                {/* Content */}
                <div className="pb-5">
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    {log.fromStatus ? `${log.fromStatus} → ` : ""}{log.toStatus}
                  </p>
                  {log.note && (
                    <p className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>{log.note}</p>
                  )}
                  <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {formatDateTime(log.createdAt)}
                    {log.actorUser ? ` · ${log.actorUser.name} (${log.actorUser.role})` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
