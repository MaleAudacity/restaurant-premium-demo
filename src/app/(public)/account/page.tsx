import { auth } from "@/lib/customer-auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import Image from "next/image";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/account");
  }

  const customer = await prisma.customer.findUnique({
    where: { id: session.user.id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { items: { include: { menuItem: true } } },
      },
      bookings: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!customer) redirect("/");

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Profile header */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          {customer.image ? (
            <Image
              src={customer.image}
              alt={customer.firstName}
              width={64}
              height={64}
              className="rounded-full"
            />
          ) : (
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold"
              style={{ background: "var(--accent-strong)", color: "var(--foreground)" }}
            >
              {customer.firstName[0]}
            </div>
          )}
          <div>
            <h1 className="font-serif text-3xl text-stone-50">
              {customer.firstName}{customer.lastName ? ` ${customer.lastName}` : ""}
            </h1>
            <p className="text-sm" style={{ color: "var(--muted)" }}>{customer.email}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-4 text-center">
          <div className="rounded-2xl p-3" style={{ background: "oklch(15% 0.02 36)", border: "1px solid var(--border)" }}>
            <p className="text-2xl font-semibold text-stone-50">{customer.totalOrders}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Total orders</p>
          </div>
          <div className="rounded-2xl p-3" style={{ background: "oklch(15% 0.02 36)", border: "1px solid var(--border)" }}>
            <p className="text-2xl font-semibold text-stone-50">{formatCurrency(customer.totalSpendInPaise)}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Total spent</p>
          </div>
          <div className="rounded-2xl p-3" style={{ background: "oklch(15% 0.02 36)", border: "1px solid var(--border)" }}>
            <p className="text-2xl font-semibold text-stone-50">{customer.bookings.length}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Bookings</p>
          </div>
        </div>
      </Card>

      {/* Recent orders */}
      {customer.orders.length > 0 && (
        <Card className="p-6">
          <h2 className="mb-4 font-serif text-2xl text-stone-50">Recent Orders</h2>
          <div className="space-y-3">
            {customer.orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl p-4"
                style={{ background: "oklch(13% 0.02 36)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm font-semibold text-stone-50">#{order.orderNumber}</p>
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{
                      background: order.status === "COMPLETED" ? "oklch(52% 0.19 145 / 0.15)" : "oklch(52% 0.19 230 / 0.15)",
                      color: order.status === "COMPLETED" ? "oklch(72% 0.19 145)" : "oklch(72% 0.19 230)",
                    }}
                  >
                    {order.status.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                  {formatDateTime(order.createdAt)} · {formatCurrency(order.totalInPaise)}
                </p>
                <p className="mt-1.5 text-xs" style={{ color: "var(--muted)" }}>
                  {order.items.map((i) => `${i.quantity}× ${i.menuItem?.name ?? "Item"}`).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Upcoming bookings */}
      {customer.bookings.length > 0 && (
        <Card className="p-6">
          <h2 className="mb-4 font-serif text-2xl text-stone-50">Bookings</h2>
          <div className="space-y-3">
            {customer.bookings.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl p-4"
                style={{ background: "oklch(13% 0.02 36)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm font-semibold text-stone-50">{b.bookingReference}</p>
                  <span className="text-xs" style={{ color: "var(--muted)" }}>{b.status}</span>
                </div>
                <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                  {formatDateTime(b.bookingDateTime)} · {b.guestCount} guest{b.guestCount !== 1 ? "s" : ""}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
