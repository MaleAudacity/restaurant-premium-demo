"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const benefits = [
  {
    emoji: "📱",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "WhatsApp pe Table Book Karo",
    hindi: "सिर्फ 60 सेकंड में बुकिंग",
    description: "No app, no form — bas WhatsApp pe message karo aur table confirm. Ekdum aasaan!",
  },
  {
    emoji: "📍",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Apna Order Track Karo",
    hindi: "Live order tracking",
    description: "Khana order karte hi track karo — kitchen se aapke table tak, real time mein.",
  },
  {
    emoji: "⭐",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Behtareen Experience Har Baar",
    hindi: "Premium dining, har visit pe",
    description: "Digital menu, photo ke saath — dekho, choose karo, order karo. Simple aur stylish.",
  },
  {
    emoji: "📊",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Business Insights Ek Click Pe",
    hindi: "कमाई बढ़ाओ, time bachao",
    description: "Kitna order aaya, kab zyada aaya, kya best chala — sab kuch dashboard mein.",
  },
  {
    emoji: "🎉",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Shaadi · Party · Corporate Events",
    hindi: "Private events ke liye perfect",
    description: "Wedding dinners, birthday parties, corporate events — inquiry se booking tak sab automatic.",
  },
  {
    emoji: "⚡",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 9 1.5 1.5 3-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Kitchen Management Aasaan Karo",
    hindi: "झंझट कम, khana zyada",
    description: "Orders, kitchen display, inventory — sab ek jagah. Team ka time bachta hai, khana behtar hota hai.",
  },
];

function BenefitCard({ benefit, index }: { benefit: (typeof benefits)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      className="group flex flex-col gap-5 rounded-[1.5rem] border border-white/8 bg-[var(--background-muted)] p-7 transition-colors duration-300 hover:border-[var(--accent)]/20 hover:bg-[rgba(232,160,32,0.04)]"
      initial={{ opacity: 0, y: 24 }}
      ref={ref}
      transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.07 }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent)]/10 text-[var(--accent)] transition-colors group-hover:bg-[var(--accent)]/18">
          {benefit.icon}
        </div>
        <span className="text-3xl leading-none">{benefit.emoji}</span>
      </div>
      <div className="space-y-1.5">
        <h3 className="font-serif text-xl text-[var(--foreground)]">{benefit.title}</h3>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]/70">{benefit.hindi}</p>
        <p className="text-sm leading-7 text-[var(--muted)]">{benefit.description}</p>
      </div>
    </motion.div>
  );
}

export function BenefitsSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headingRef, { once: true, margin: "-80px" });

  return (
    <section className="py-20">
      {/* Header */}
      <div className="mb-14 flex flex-col items-center text-center" ref={headingRef}>
        <motion.p
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          className="mb-3 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/8 px-4 py-1.5 text-xs uppercase tracking-[0.36em] text-[var(--accent)]"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5 }}
        >
          🌶️ Kyun Mirch Masala?
        </motion.p>
        <motion.h2
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          className="font-serif text-4xl text-[var(--foreground)] sm:text-5xl"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          Sab Kuch Ek Jagah —
          <br />
          <span className="text-[var(--accent)]">Aasaan & Smart</span>
        </motion.h2>
        <motion.p
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5, delay: 0.16 }}
        >
          From the first WhatsApp message to the final review, every part of the guest journey is crafted to delight — and every part of the operator experience is built to save time.
        </motion.p>
      </div>

      {/* Cards grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((benefit, i) => (
          <BenefitCard benefit={benefit} index={i} key={benefit.title} />
        ))}
      </div>

      {/* Bottom stat strip */}
      <motion.div
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/6 sm:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {[
          { value: "< 60s", label: "Average booking time" },
          { value: "4.9 ★", label: "Guest satisfaction" },
          { value: "18k+", label: "Orders fulfilled" },
          { value: "320+", label: "Private events hosted" },
        ].map((stat) => (
          <div className="flex flex-col items-center gap-1 bg-[var(--background)] px-6 py-7 text-center" key={stat.label}>
            <p className="font-serif text-3xl text-[var(--accent)]">{stat.value}</p>
            <p className="text-xs text-[var(--muted)]">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
