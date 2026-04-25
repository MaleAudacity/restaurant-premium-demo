import { CheckoutForm } from "@/components/checkout/checkout-form";

export default function CheckoutPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <CheckoutForm />
    </div>
  );
}
