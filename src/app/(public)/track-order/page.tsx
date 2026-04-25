import { TrackOrderForm } from "@/components/track-order/track-order-form";

export default function TrackOrderPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-xs uppercase tracking-[0.32em]" style={{ color: "var(--accent)" }}>
        Track Order
      </p>
      <h1 className="mt-4 font-serif text-5xl" style={{ color: "var(--foreground)" }}>
        Where&apos;s my order?
      </h1>
      <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
        Enter your order number and phone number to get live status.
      </p>

      <TrackOrderForm />
    </div>
  );
}
