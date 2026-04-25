"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// WhatsApp conversation steps shown in the phone mockup
const chatFlow = [
  {
    from: "guest",
    message: "Hi! I'd like to book a table for 2 this Saturday at 8pm.",
    time: "7:42 PM",
  },
  {
    from: "mirch",
    message: "Hi! Welcome to Mirch Masala 🌿\n\nI'd love to help you reserve a table. Could I get your name for the booking?",
    time: "7:42 PM",
  },
  {
    from: "guest",
    message: "Priya Sharma",
    time: "7:43 PM",
  },
  {
    from: "mirch",
    message: "Perfect, Priya! 🎉\n\nYour table for 2 on Saturday, 19 April at 8:00 PM is confirmed.\n\nBooking ID: #MM-2847\n📍 12 Residency Road, Bengaluru\n\nSee you then!",
    time: "7:43 PM",
  },
];

const steps = [
  {
    number: "01",
    title: "Guest starts on WhatsApp",
    description: "No app download required. Guests simply message your restaurant's WhatsApp number — just like texting a friend.",
  },
  {
    number: "02",
    title: "Smart guided conversation",
    description: "Our AI-powered flow collects date, time, party size, and name in a natural back-and-forth — no forms, no dropdowns.",
  },
  {
    number: "03",
    title: "Instant confirmation",
    description: "A booking summary with ID lands in the guest's chat. Your dashboard updates in real time. Zero manual work.",
  },
];

function StepCard({
  step,
  index,
  totalSteps,
}: {
  step: (typeof steps)[number];
  index: number;
  totalSteps: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 24 }}
      className="flex gap-5"
      initial={{ opacity: 0, x: 24 }}
      ref={ref}
      transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
    >
      <div className="flex flex-col items-center gap-2 pt-1">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#25D366]/30 bg-[#25D366]/10 font-mono text-sm font-bold text-[#25D366]">
          {step.number}
        </div>
        {index < totalSteps - 1 && (
          <div className="w-px flex-1 bg-gradient-to-b from-[#25D366]/20 to-transparent" style={{ minHeight: 32 }} />
        )}
      </div>
      <div className="pb-6">
        <h3 className="font-serif text-xl text-[var(--foreground)]">{step.title}</h3>
        <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{step.description}</p>
      </div>
    </motion.div>
  );
}

function PhoneCallIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
  );
}

function IncomingCallMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
      className="relative mx-auto max-w-[280px]"
      initial={{ opacity: 0, x: -30 }}
      ref={ref}
      transition={{ duration: 0.65, ease: "easeOut" }}
    >
      {/* Green ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[2.5rem] opacity-50"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(37,211,102,0.22), transparent 70%)",
          filter: "blur(32px)",
          transform: "scale(1.2)",
        }}
      />

      {/* Phone frame */}
      <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-white/12 bg-[#0c0c0c] shadow-[0_40px_80px_rgba(0,0,0,0.75)]">

        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-1">
          <span className="text-[13px] font-semibold text-white">9:00 PM</span>
          <div className="flex items-center gap-1.5">
            {/* Signal */}
            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 0 0-6 0zm-4-4 2 2a7.074 7.074 0 0 1 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" /></svg>
            {/* Battery */}
            <div className="flex items-center gap-0.5 rounded-sm border border-white/50 px-0.5 py-0.5">
              <div className="h-2 w-5 rounded-[1px] bg-white" />
            </div>
            <span className="text-[11px] text-white">100</span>
          </div>
        </div>

        {/* Restaurant logo pill */}
        <div className="mt-3 flex justify-center">
          <div className="flex items-center gap-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/12 px-3 py-1">
            <div className="h-4 w-4 rounded-full bg-[var(--accent-strong)] text-[8px] font-black text-[var(--foreground)] flex items-center justify-center">M</div>
            <span className="text-[10px] font-medium text-[var(--accent)]">Mirch Masala</span>
          </div>
        </div>

        {/* Call text */}
        <div className="mt-5 flex flex-col items-center px-4 text-center">
          <h3 className="text-[2.6rem] font-black leading-none tracking-tight text-white">YOUR FOOD</h3>
          <p className="mt-1.5 text-[15px] font-light text-white/55">Incoming Call</p>
        </div>

        {/* Ring + food image */}
        <div className="relative mx-auto my-8 h-52 w-52">
          {/* Outer pulse rings */}
          <div
            aria-hidden
            className="call-ring-pulse absolute inset-0 rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, rgba(37,211,102,0.4), transparent 70%)" }}
          />

          {/* Rotating gradient ring */}
          <div
            aria-hidden
            className="call-ring-rotate absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, #ff5e5e, #cc44aa, #7744dd, #4488ee, #44cc88, #aacc00, #ffcc00, #ff8800, #ff5e5e)",
              WebkitMask: "radial-gradient(transparent 74%, black 74%)",
              mask: "radial-gradient(transparent 74%, black 74%)",
            }}
          />

          {/* Food image in center */}
          <div className="absolute inset-3 overflow-hidden rounded-full border border-white/10">
            <Image
              alt="Mirch Masala — signature grilled dish"
              className="object-cover"
              fill
              priority
              unoptimized
              src="/images/menu/grill/bhatti-ka-jheenga.jpg"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/hero/hero.jpg"; }}
            />
          </div>
        </div>

        {/* Accept / Decline row */}
        <div className="flex items-center justify-center gap-10 px-8 pb-10">
          {/* Decline */}
          <div className="flex flex-col items-center gap-2">
            <button
              aria-label="Decline"
              className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[#e53935] shadow-[0_0_20px_rgba(229,57,53,0.5)] transition hover:brightness-110"
            >
              <PhoneCallIcon className="h-6 w-6 rotate-[135deg] text-white" />
            </button>
            <span className="text-[13px] text-white/60">Decline</span>
          </div>

          {/* Dots */}
          <div className="flex flex-col gap-2 pb-7">
            <div className="h-2 w-2 rounded-full bg-white/30" />
            <div className="h-2 w-2 rounded-full bg-white/30" />
          </div>

          {/* Accept */}
          <div className="flex flex-col items-center gap-2">
            <button
              aria-label="Accept"
              className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[#25D366] shadow-[0_0_20px_rgba(37,211,102,0.5)] transition hover:brightness-110"
            >
              <PhoneCallIcon className="h-6 w-6 text-white" />
            </button>
            <span className="text-[13px] text-white/60">Accept</span>
          </div>
        </div>

        {/* Bottom URL hint */}
        <p className="pb-5 text-center text-[10px] text-white/20">mirchmasala.in</p>
      </div>
    </motion.div>
  );
}

export function WhatsAppSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headingRef, { once: true, margin: "-80px" });

  return (
    <section className="py-20">
      {/* Background accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 h-[600px] w-[400px] opacity-20"
        style={{
          background: "radial-gradient(ellipse, rgba(37,211,102,0.3) 0%, transparent 70%)",
          filter: "blur(80px)",
          transform: "translateY(-50%)",
        }}
      />

      <div ref={headingRef} className="mb-16 flex flex-col items-center text-center">
        <motion.p
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          className="mb-3 rounded-full border border-[#25D366]/30 bg-[#25D366]/8 px-4 py-1.5 text-xs uppercase tracking-[0.36em] text-[#25D366]"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5 }}
        >
          WhatsApp Booking
        </motion.p>
        <motion.h2
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          className="font-serif text-4xl text-[var(--foreground)] sm:text-5xl"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          Reserve a table in
          <br />
          <span className="text-[#25D366]">under 60 seconds</span>
        </motion.h2>
        <motion.p
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)]"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5, delay: 0.16 }}
        >
          No app. No form. No phone call. Guests book the way they already communicate — on WhatsApp — and your kitchen knows instantly.
        </motion.p>
      </div>

      {/* Main layout */}
      <div className="grid items-center gap-14 lg:grid-cols-2">
        {/* Incoming call mockup */}
        <IncomingCallMockup />

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, i) => (
            <StepCard index={i} key={step.number} step={step} totalSteps={steps.length} />
          ))}

          {/* CTA */}
          <motion.div
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            className="pt-2"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link
              className="inline-flex items-center gap-2.5 rounded-full bg-[#25D366] px-7 py-3.5 text-sm font-semibold text-[#0a1a0b] shadow-[0_0_24px_rgba(37,211,102,0.35)] transition hover:brightness-110"
              href="/whatsapp-order"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
              Try the WhatsApp Flow
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
