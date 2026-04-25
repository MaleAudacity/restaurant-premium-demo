import { ChefHat, CreditCard, ShieldCheck } from "lucide-react";

import { PublicDemoDetailShell } from "@/components/demo/public-demo-detail-shell";
import { DemoControlPage } from "@/components/demo/demo-control-page";
import { getDemoControlPageData } from "@/server/queries/demo-control";

export default async function PublicDemoControlRoute() {
  const data = await getDemoControlPageData();

  return (
    <PublicDemoDetailShell
      description="Operate payment checks, approvals, booking actions, and kitchen progress from a showcase-ready control surface that stays aligned with the public brand."
      eyebrow="Control Panel Demo"
      highlights={[
        {
          icon: CreditCard,
          label: "Operator Actions",
          value: "Simulate payment success or failure and advance the current order through operational states.",
        },
        {
          icon: ShieldCheck,
          label: "Approvals",
          value: "Demonstrate how management approvals support cleaner handoffs between guest communication and execution.",
        },
        {
          icon: ChefHat,
          label: "Service Loop",
          value: "Kitchen, booking, and event actions complete the same story that begins in the guest-facing chat flow.",
        },
      ]}
      primaryCta={{
        href: "/demo/chat",
        label: "View Customer Chat Demo",
      }}
      title="Show the operational side of the same demo journey with a polished control panel."
    >
      <DemoControlPage data={data} />
    </PublicDemoDetailShell>
  );
}
