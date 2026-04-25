import { MessageCircleMore, PhoneCall } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getRestaurantSnapshot } from "@/server/queries";

export default async function WhatsappOrderPage() {
  const restaurant = await getRestaurantSnapshot();

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <Card className="p-8">
        <div className="flex items-center gap-3" style={{ color: "var(--accent)" }}>
          <MessageCircleMore className="h-5 w-5" />
          <p className="text-xs uppercase tracking-[0.3em]">WhatsApp Ordering</p>
        </div>
        <h1 className="mt-4 font-serif text-5xl" style={{ color: "var(--foreground)" }}>Guided ordering that feels familiar to guests</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8" style={{ color: "var(--muted)" }}>
          Use guided quick replies to start food orders, table bookings, party requests, wedding inquiries, menu browsing, or contact discovery.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg">Start Chat Demo</Button>
          <Button size="lg" variant="secondary">
            Open demo/chat
          </Button>
        </div>
      </Card>
      <Card className="p-8">
        <div className="flex items-center gap-3" style={{ color: "var(--accent)" }}>
          <PhoneCall className="h-5 w-5" />
          <p className="text-xs uppercase tracking-[0.3em]">Direct Contact</p>
        </div>
        <div className="mt-6 space-y-4 text-sm" style={{ color: "var(--muted)" }}>
          <p>WhatsApp: {restaurant.whatsappNumber ?? restaurant.phone}</p>
          <p>Phone: {restaurant.phone}</p>
          <p>Email: {restaurant.email}</p>
        </div>
      </Card>
    </div>
  );
}
