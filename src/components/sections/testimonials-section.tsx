"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const guestTestimonials = [
  {
    name: "Meera Iyer",
    role: "Regular guest",
    location: "Indiranagar, Bengaluru",
    quote:
      "The Saffron Murgh Dum Biryani is unlike anything else in the city — deeply aromatic and perfectly spiced. Booking via WhatsApp took less than a minute. I was genuinely impressed.",
    rating: 5,
    avatar: "MI",
  },
  {
    name: "Karan Mehta",
    role: "Food critic",
    location: "Mumbai",
    quote:
      "Mirch Masala sits at the intersection of heritage and modernity. The Nalli Nihari brought back memories of old Delhi while the Truffle Kulcha reminded me this kitchen has its own confident voice.",
    rating: 5,
    avatar: "KM",
  },
  {
    name: "Priya Nair",
    role: "Event host",
    location: "Koramangala, Bengaluru",
    quote:
      "We hosted our annual team dinner here and the private event coordination was seamless — from inquiry to execution, zero stress. The Gunpowder Prawns had everyone talking.",
    rating: 5,
    avatar: "PN",
  },
  {
    name: "Rohan Desai",
    role: "First-time visitor",
    location: "Pune",
    quote:
      "I'd heard about this place from three different people and it lived up to every expectation. The Filter Coffee Tiramisu alone was worth the visit. Already planning my return.",
    rating: 5,
    avatar: "RD",
  },
];

const ownerBenefits = [
  {
    headline: "More bookings, less phone time",
    body: "WhatsApp handles the entire reservation flow — no missed calls, no manual entry. Every booking lands directly in your dashboard.",
    metric: "3× more bookings",
  },
  {
    headline: "A brand presence that converts",
    body: "A beautifully presented digital menu with food photography and premium copy turns browsers into diners before they even walk in.",
    metric: "62% higher conversion",
  },
  {
    headline: "Operations that run themselves",
    body: "Kitchen display, order status, inventory alerts, and event leads — all centralised so your team focuses on hospitality, not admin.",
    metric: "5 hrs saved per day",
  },
];

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg className="h-3.5 w-3.5 text-[var(--accent)]" fill="currentColor" key={i} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ t, index }: { t: (typeof guestTestimonials)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      className="flex flex-col gap-5 rounded-[1.5rem] border border-white/8 bg-[var(--background-muted)] p-7"
      initial={{ opacity: 0, y: 28 }}
      ref={ref}
      transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.08 }}
    >
      <StarRow count={t.rating} />
      <p className="flex-1 text-sm leading-7 text-[var(--foreground)] opacity-90">
        &ldquo;{t.quote}&rdquo;
      </p>
      <div className="flex items-center gap-3 border-t border-white/6 pt-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15 font-semibold text-sm text-[var(--accent)]">
          {t.avatar}
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">{t.name}</p>
          <p className="text-xs text-[var(--muted)]">{t.role} · {t.location}</p>
        </div>
      </div>
    </motion.div>
  );
}

function OwnerBenefitRow({ b, index }: { b: (typeof ownerBenefits)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 24 }}
      className="flex items-start gap-5"
      initial={{ opacity: 0, x: 24 }}
      ref={ref}
      transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
    >
      <div className="shrink-0 rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent)]/10 px-3 py-2 text-center">
        <p className="font-serif text-sm font-semibold text-[var(--accent)] whitespace-nowrap">{b.metric}</p>
      </div>
      <div>
        <p className="font-serif text-base text-[var(--foreground)]">{b.headline}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{b.body}</p>
      </div>
    </motion.div>
  );
}

export function TestimonialsSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headingRef, { once: true, margin: "-80px" });

  const ownerRef = useRef<HTMLDivElement>(null);
  const ownerInView = useInView(ownerRef, { once: true, margin: "-80px" });

  return (
    <section className="py-20">
      {/* ── Guest Testimonials ── */}
      <div className="mb-12 flex flex-col items-center text-center" ref={headingRef}>
        <motion.p
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          className="mb-3 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/8 px-4 py-1.5 text-xs uppercase tracking-[0.36em] text-[var(--accent)]"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5 }}
        >
          Guest Love
        </motion.p>
        <motion.h2
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          className="font-serif text-4xl text-[var(--foreground)] sm:text-5xl"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          What our guests
          <br />
          <span className="text-[var(--accent)]">are saying</span>
        </motion.h2>
        <motion.p
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)]"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5, delay: 0.16 }}
        >
          From first-time visitors to regulars who make it their weekly ritual — the experience keeps them coming back.
        </motion.p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {guestTestimonials.map((t, i) => (
          <TestimonialCard index={i} key={t.name} t={t} />
        ))}
      </div>

      {/* ── Owner Benefits ── */}
      <div className="mt-20 overflow-hidden rounded-[2rem] border border-white/8 bg-[var(--background-muted)]">
        <div className="grid lg:grid-cols-2">
          {/* Left: copy */}
          <div className="flex flex-col justify-center gap-8 p-8 lg:p-12" ref={ownerRef}>
            <div>
              <motion.p
                animate={ownerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                className="mb-3 w-fit rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/8 px-4 py-1.5 text-xs uppercase tracking-[0.36em] text-[var(--accent)]"
                initial={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.5 }}
              >
                For Restaurant Owners
              </motion.p>
              <motion.h3
                animate={ownerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                className="font-serif text-3xl text-[var(--foreground)] sm:text-4xl"
                initial={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.5, delay: 0.08 }}
              >
                The platform your
                <br />
                <span className="text-[var(--accent)]">restaurant deserves</span>
              </motion.h3>
              <motion.p
                animate={ownerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                className="mt-4 text-sm leading-7 text-[var(--muted)]"
                initial={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.5, delay: 0.16 }}
              >
                Restaurant owners who switch to this system report fewer missed bookings, higher average order value, and significantly more time to focus on the food and the guests.
              </motion.p>
            </div>
            <div className="space-y-6">
              {ownerBenefits.map((b, i) => (
                <OwnerBenefitRow b={b} index={i} key={b.headline} />
              ))}
            </div>
          </div>

          {/* Right: visual panel */}
          <div className="relative flex items-center justify-center overflow-hidden bg-[linear-gradient(135deg,oklch(74% 0.13 82 / 0.08),oklch(9% 0.015 40 / 0.62))] p-10">
            {/* Decorative glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: "radial-gradient(ellipse at 60% 40%, oklch(74% 0.13 82 / 0.18), transparent 65%)",
              }}
            />
            <div className="relative space-y-4 text-center">
              {/* Large stat */}
              <p className="font-serif text-7xl text-[var(--accent)] sm:text-8xl">4.9</p>
              <div className="flex justify-center">
                <StarRow count={5} />
              </div>
              <p className="text-sm text-[var(--muted)]">Average guest rating across all visits</p>

              <div className="mt-8 grid grid-cols-2 gap-3 text-center">
                {[
                  { value: "18k+", label: "Orders delivered" },
                  { value: "320+", label: "Events hosted" },
                  { value: "98%", label: "Booking success rate" },
                  { value: "< 2 min", label: "Avg. response time" },
                ].map((s) => (
                  <div className="rounded-2xl border border-white/8 bg-[var(--background)] p-4" key={s.label}>
                    <p className="font-serif text-2xl text-[var(--foreground)]">{s.value}</p>
                    <p className="mt-1 text-[11px] text-[var(--muted)]">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
