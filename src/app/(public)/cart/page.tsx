"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function formatPrice(paise: number) {
  return `₹${(paise / 100).toFixed(0)}`;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotalInPaise } = useCart();

  const deliveryFee = 99;
  const tax = Math.round((subtotalInPaise / 100) * 0.05);
  const total = subtotalInPaise / 100 + deliveryFee + tax;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Cart items */}
      <Card className="p-8">
        <h1 className="font-serif text-5xl" style={{ color: "var(--foreground)" }}>
          Your Cart
        </h1>

        {items.length === 0 ? (
          <div className="mt-10 space-y-4 text-center">
            <p className="text-lg" style={{ color: "var(--muted)" }}>
              Your cart is empty.
            </p>
            <Button asChild>
              <Link href="/menu">Browse Menu</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.slug}
                className="flex items-center justify-between gap-4 rounded-2xl p-4"
                style={{ border: "1px solid var(--border)", background: "oklch(15% 0.022 36 / 0.4)" }}
              >
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: "var(--foreground)" }}>
                    {item.name}
                  </p>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    {formatPrice(item.priceInPaise)} each
                  </p>
                </div>

                {/* Quantity stepper */}
                <div className="flex items-center gap-2">
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm transition"
                    style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
                    onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm" style={{ color: "var(--foreground)" }}>
                    {item.quantity}
                  </span>
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm transition"
                    style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
                    onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <p className="w-16 text-right text-sm font-semibold" style={{ color: "var(--accent)" }}>
                  {formatPrice(item.priceInPaise * item.quantity)}
                </p>

                <button
                  className="text-xs transition"
                  style={{ color: "var(--muted)" }}
                  onClick={() => removeItem(item.slug)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Order summary */}
      <Card className="p-8">
        <h2 className="font-serif text-3xl" style={{ color: "var(--foreground)" }}>
          Order Summary
        </h2>

        <div className="mt-6 space-y-4 text-sm" style={{ color: "var(--muted)" }}>
          <div className="flex justify-between">
            <span>Subtotal ({items.length} item{items.length !== 1 ? "s" : ""})</span>
            <span>{formatPrice(subtotalInPaise)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery fee (est.)</span>
            <span>₹{deliveryFee}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (5%)</span>
            <span>₹{tax}</span>
          </div>
          <div
            className="border-t pt-4 font-semibold"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            <div className="flex justify-between">
              <span>Total</span>
              <span>₹{total.toFixed(0)}</span>
            </div>
          </div>
        </div>

        <Button
          asChild
          className="mt-6 w-full"
          size="lg"
        >
          <Link href="/checkout">Continue to Checkout</Link>
        </Button>

        <Button asChild variant="outline" className="mt-3 w-full">
          <Link href="/menu">Continue Shopping</Link>
        </Button>
      </Card>
    </div>
  );
}
