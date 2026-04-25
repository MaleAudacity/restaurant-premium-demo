"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-20" ref={ref}>
      <div className="relative overflow-hidden rounded-[2.5rem] border border-[var(--accent)]/20 bg-[var(--background-muted)]">
        {/* Background decoration */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 50%, oklch(74% 0.13 82 / 0.12) 0%, transparent 60%),
              radial-gradient(ellipse 60% 70% at 80% 30%, oklch(52% 0.19 26 / 0.08) 0%, transparent 55%)
            `,
          }}
        />
        {/* Subtle grid overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(oklch(74% 0.13 82 / 0.06) 1px, transparent 1px), linear-gradient(90deg, oklch(74% 0.13 82 / 0.06) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />

        <div className="relative flex flex-col items-center gap-10 px-6 py-20 text-center sm:px-12">
          {/* Eyebrow */}
          <motion.p
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-1.5 text-xs uppercase tracking-[0.36em] text-[var(--accent)]"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.5 }}
          >
            🍽️ &nbsp;Aaj ka Special — Abhi Book Karo
          </motion.p>

          {/* Headline */}
          <motion.h2
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            className="max-w-3xl font-serif text-4xl leading-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            आइए, साथ खाना खाएं —
            <br />
            <span className="text-[var(--accent)]">Table ready in seconds.</span>
          </motion.h2>

          {/* Sub-copy */}
          <motion.p
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            className="max-w-xl text-base leading-7 text-[var(--muted)]"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.5, delay: 0.18 }}
          >
            Bengaluru ka favourite dining experience — WhatsApp pe message karo ya online book karo.
            Khana ready, table ready, bas aap aao! 🌶️
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.5, delay: 0.28 }}
          >
            <Link
              className="rounded-full bg-[var(--accent-strong)] px-9 py-4 text-sm font-semibold text-[var(--foreground)] shadow-[0_0_32px_oklch(74% 0.13 82 / 0.40)] transition hover:brightness-110"
              href="/book-table"
            >
              Reserve a Table
            </Link>
            <Link
              className="flex items-center gap-2.5 rounded-full border border-[#25D366]/35 bg-[#25D366]/10 px-8 py-4 text-sm font-semibold text-[#25D366] transition hover:bg-[#25D366]/18"
              href="/whatsapp-order"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
              Book on WhatsApp
            </Link>
            <Link
              className="rounded-full border border-white/12 bg-white/4 px-8 py-4 text-sm text-[var(--muted)] transition hover:bg-white/8 hover:text-[var(--foreground)]"
              href="/menu"
            >
              Browse the Menu
            </Link>
          </motion.div>

          {/* Trust strip */}
          <motion.div
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            className="flex flex-wrap items-center justify-center gap-6 border-t border-white/6 pt-8 text-xs text-[var(--muted)]"
            initial={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {[
              "💚 Free Booking — कोई charge नहीं",
              "⚡ Instant Confirmation",
              "📱 WhatsApp & Online",
              "🕐 Khula hai 12:00 – 22:30",
            ].map((item) => (
              <span className="flex items-center gap-1.5" key={item}>
                <svg className="h-3.5 w-3.5 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
                  <path clipRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" fillRule="evenodd" />
                </svg>
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
