"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { createOrder } from "@/server/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

function formatPrice(paise: number) {
  return `₹${(paise / 100).toFixed(0)}`;
}

type OrderType = "DELIVERY" | "PICKUP" | "DINE_IN";

export function CheckoutForm() {
  const { items, subtotalInPaise, clearCart } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("DELIVERY");
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<{ orderNumber: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const deliveryFee = orderType === "DELIVERY" ? 99 : 0;
  const tax = Math.round((subtotalInPaise / 100) * 0.05);
  const total = subtotalInPaise / 100 + deliveryFee + tax;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (orderType === "DELIVERY" && !address.trim()) {
      setError("Please enter a delivery address.");
      return;
    }

    startTransition(async () => {
      const result = await createOrder({
        customerName: name,
        customerPhone: phone,
        orderType,
        deliveryAddress: address,
        notes,
        items: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
      });

      if (result.success) {
        clearCart();
        setPlaced({ orderNumber: result.orderNumber });
      } else {
        setError(result.error);
      }
    });
  }

  if (placed) {
    return (
      <div className="col-span-2 flex flex-col items-center gap-6 py-16 text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full text-4xl"
          style={{ background: "oklch(52% 0.19 26 / 0.15)", border: "2px solid var(--accent)" }}
        >
          ✓
        </div>
        <h2 className="font-serif text-4xl" style={{ color: "var(--foreground)" }}>
          Order placed!
        </h2>
        <p className="text-lg" style={{ color: "var(--muted)" }}>
          Your order number is{" "}
          <span className="font-semibold" style={{ color: "var(--accent)" }}>
            {placed.orderNumber}
          </span>
        </p>
        <p className="max-w-md text-sm" style={{ color: "var(--muted)" }}>
          The restaurant has been notified. You can track your order status
          using your order number and phone number.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/track-order">Track Order</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/menu">Order More</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Left: form */}
      <Card className="space-y-5 p-8">
        <h1 className="font-serif text-4xl" style={{ color: "var(--foreground)" }}>
          Checkout
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Order type */}
          <div className="flex gap-2">
            {(["DELIVERY", "PICKUP", "DINE_IN"] as OrderType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setOrderType(t)}
                className="rounded-full px-4 py-1.5 text-xs font-medium transition"
                style={{
                  background:
                    orderType === t ? "var(--accent-strong)" : "transparent",
                  border: "1px solid var(--border)",
                  color:
                    orderType === t ? "var(--foreground)" : "var(--muted)",
                }}
              >
                {t === "DINE_IN" ? "Dine In" : t === "PICKUP" ? "Pickup" : "Delivery"}
              </button>
            ))}
          </div>

          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            required
          />
          {orderType === "DELIVERY" && (
            <Input
              placeholder="Delivery address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          )}
          <Input
            placeholder="Special instructions (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {error && (
            <p className="rounded-xl px-4 py-3 text-sm" style={{ background: "oklch(45% 0.2 25 / 0.15)", color: "oklch(70% 0.2 25)" }}>
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPending || items.length === 0}
          >
            {isPending ? "Placing order…" : `Place Order — ₹${total.toFixed(0)}`}
          </Button>
        </form>
      </Card>

      {/* Right: order summary */}
      <Card className="p-8">
        <h2 className="font-serif text-3xl" style={{ color: "var(--foreground)" }}>
          Order Summary
        </h2>

        {items.length === 0 ? (
          <p className="mt-6 text-sm" style={{ color: "var(--muted)" }}>
            Your cart is empty.{" "}
            <Link href="/menu" style={{ color: "var(--accent)" }}>
              Browse the menu →
            </Link>
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            {items.map((item) => (
              <div
                key={item.slug}
                className="flex justify-between text-sm"
                style={{ color: "var(--muted)" }}
              >
                <span>
                  {item.name}{" "}
                  <span className="opacity-60">× {item.quantity}</span>
                </span>
                <span>{formatPrice(item.priceInPaise * item.quantity)}</span>
              </div>
            ))}

            <div
              className="my-2"
              style={{ borderTop: "1px solid var(--border)" }}
            />
            <div className="flex justify-between text-sm" style={{ color: "var(--muted)" }}>
              <span>Subtotal</span>
              <span>{formatPrice(subtotalInPaise)}</span>
            </div>
            {orderType === "DELIVERY" && (
              <div className="flex justify-between text-sm" style={{ color: "var(--muted)" }}>
                <span>Delivery fee</span>
                <span>₹99</span>
              </div>
            )}
            <div className="flex justify-between text-sm" style={{ color: "var(--muted)" }}>
              <span>Tax (5%)</span>
              <span>₹{tax}</span>
            </div>
            <div
              className="my-2"
              style={{ borderTop: "1px solid var(--border)" }}
            />
            <div
              className="flex justify-between font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              <span>Total</span>
              <span>₹{total.toFixed(0)}</span>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
