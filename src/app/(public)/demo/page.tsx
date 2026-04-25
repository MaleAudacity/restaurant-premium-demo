import Link from "next/link";
import {
  ArrowRight,
  ChefHat,
  MessageCircleMore,
  QrCode,
  ShieldCheck,
  Sparkles,
  Truck,
  Workflow,
} from "lucide-react";

import { DemoCard } from "@/components/demo/demo-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";

const workflowSteps = [
  {
    icon: QrCode,
    title: "QR Scan / Website Entry",
    description: "Guests can start from a table QR, a website CTA, or a showroom walkthrough.",
  },
  {
    icon: MessageCircleMore,
    title: "Chat Flow",
    description: "The WhatsApp-style simulator handles ordering, bookings, and guest inquiries.",
  },
  {
    icon: ShieldCheck,
    title: "Manager Approval",
    description: "Operators validate payment and approve the active order or request.",
  },
  {
    icon: ChefHat,
    title: "Kitchen Progress",
    description: "Order states move from approved to preparing and ready in the control panel.",
  },
  {
    icon: Truck,
    title: "Delivery / Completion",
    description: "The final status closes the loop for delivery, pickup, or completed service.",
  },
];

export default function DemoLandingPage() {
  return (
    <div className="space-y-10">
      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="overflow-hidden border-amber-300/12 bg-[linear-gradient(135deg,rgba(245,158,11,0.2),rgba(17,24,39,0.48))] p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.36em] text-amber-100/82">Interactive Demo Center</p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-tight text-stone-50 md:text-7xl">
            Showcase the full Mirch Masala guest journey in one premium demo flow.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-100/82">
            Use the website as a polished testing and client-showcase surface today, while keeping the same backend story ready for real WhatsApp later.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/demo/chat">
                Open Chat Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/demo/control">Open Control Panel</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-black/20 px-5 py-4">
              <p className="font-serif text-3xl text-stone-50">2</p>
              <p className="mt-1 text-sm text-stone-300/75">Live demo surfaces</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/20 px-5 py-4">
              <p className="font-serif text-3xl text-stone-50">5</p>
              <p className="mt-1 text-sm text-stone-300/75">Workflow milestones</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/20 px-5 py-4">
              <p className="font-serif text-3xl text-stone-50">1</p>
              <p className="mt-1 text-sm text-stone-300/75">Shared backend story</p>
            </div>
          </div>
        </Card>

        <div className="grid gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 text-amber-100">
              <Workflow className="h-5 w-5" />
              <p className="text-xs uppercase tracking-[0.3em]">Showcase Mode</p>
            </div>
            <p className="mt-5 text-sm leading-7 text-stone-300/82">
              This is a website-first demo center for testing, presentations, and operator walkthroughs. Real WhatsApp integration is intentionally not connected yet.
            </p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 text-amber-100">
              <Sparkles className="h-5 w-5" />
              <p className="text-xs uppercase tracking-[0.3em]">What Clients See</p>
            </div>
            <p className="mt-5 text-sm leading-7 text-stone-300/82">
              A premium branded entry point, a guest-facing conversation experience, and an operator-side control surface that clearly demonstrates the end-to-end service loop.
            </p>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Choose A Demo"
          title="Two focused entry points for guest and operator storytelling"
          description="Use the cards below during testing or live client walkthroughs to jump into the exact part of the flow you want to demonstrate."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          <DemoCard
            ctaLabel="Launch customer chat"
            description="WhatsApp-style customer ordering, booking, and inquiry flow"
            eyebrow="Guest Experience"
            highlights={[
              "Guided ordering conversation with quick replies and typed input.",
              "Booking, event inquiry, and support scenarios in one interface.",
              "Premium mobile-style presentation for easy showcase use.",
            ]}
            href="/demo/chat"
            icon={MessageCircleMore}
            title="Customer Chat Demo"
          />
          <DemoCard
            ctaLabel="Launch control panel"
            description="Operator actions for payment, approval, and order progression"
            eyebrow="Operations"
            highlights={[
              "Advance payment, approval, kitchen, and delivery states manually.",
              "Create sample booking and event records for presentation flows.",
              "Watch the same backend story connect to the guest journey.",
            ]}
            href="/demo/control"
            icon={ShieldCheck}
            title="Control Panel Demo"
          />
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Visual Workflow"
          title="A fast way to explain how the demo moves from guest touchpoint to completion"
          description="This section is designed for client walkthroughs, making the system feel operationally connected instead of a set of disconnected screens."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {workflowSteps.map(({ icon: Icon, title, description }, index) => (
            <Card className="relative overflow-hidden p-6" key={title}>
              <div className="absolute right-4 top-4 font-serif text-5xl text-white/6">
                0{index + 1}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(245,158,11,0.2),rgba(249,115,22,0.26))] text-amber-100">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-serif text-2xl text-stone-50">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-stone-300/78">{description}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
