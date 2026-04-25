import { DatabaseZap, MessageCircleMore, ScrollText } from "lucide-react";

import { DemoChatPage } from "@/components/demo/demo-chat-page";
import { PublicDemoDetailShell } from "@/components/demo/public-demo-detail-shell";

export default function PublicDemoChatRoute() {
  return (
    <PublicDemoDetailShell
      description="Walk through the WhatsApp-style customer journey for ordering, bookings, and inquiries without leaving the public website experience."
      eyebrow="Customer Chat Demo"
      highlights={[
        {
          icon: MessageCircleMore,
          label: "Guest Flow",
          value: "Ordering, booking, event inquiry, and support prompts all run in one guided chat simulator.",
        },
        {
          icon: DatabaseZap,
          label: "Shared State",
          value: "The demo uses the same backend records and message log story as the control panel experience.",
        },
        {
          icon: ScrollText,
          label: "Showcase Fit",
          value: "Useful for client presentations, QA walkthroughs, and stakeholder sign-off before real WhatsApp goes live.",
        },
      ]}
      primaryCta={{
        href: "/demo/control",
        label: "View Control Panel Demo",
      }}
      title="Present the guest conversation exactly where your website visitors expect it."
    >
      <DemoChatPage />
    </PublicDemoDetailShell>
  );
}
