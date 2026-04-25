import type { Metadata } from "next";
import Link from "next/link";

import { CategoryTabs } from "@/components/ui/category-tabs";
import { menuByCategory, allMenuItems } from "@/data/menu-data";

export const metadata: Metadata = {
  title: "Menu — Mirch Masala",
  description:
    "Explore the full Mirch Masala menu — signature starters, tandoor & grill, royal curries, biryani atelier, breads & sides, and desserts.",
};

const stats = [
  { value: String(allMenuItems.length), label: "Dishes" },
  { value: String(menuByCategory.length), label: "Categories" },
  { value: String(allMenuItems.filter((i) => i.tags.includes("vegetarian")).length), label: "Vegetarian" },
  { value: "Daily", label: "12:00 – 22:30" },
];

export default function MenuPage() {
  return (
    <div>
      {/* ── Hero header ── */}
      <section className="relative overflow-hidden py-16 pb-14">
        {/* Ambient orbs */}
        <div
          aria-hidden
          className="floating-orb animate-float pointer-events-none absolute -left-24 -top-10 h-80 w-80"
          style={{ background: "var(--accent)", opacity: 0.08 }}
        />
        <div
          aria-hidden
          className="floating-orb animate-float-slow pointer-events-none absolute -right-16 top-1/2 h-96 w-96"
          style={{ background: "oklch(52% 0.19 26)", opacity: 0.07, animationDelay: "2s" }}
        />
        <div
          aria-hidden
          className="floating-orb animate-float pointer-events-none absolute bottom-0 left-1/2 h-56 w-56"
          style={{ background: "var(--accent)", opacity: 0.06, animationDelay: "4s" }}
        />

        {/* Floating spice accents */}
        {(
          [
            { ch: "🌶️", top: "12%", left: "72%", size: 20, del: "0s" },
            { ch: "🧄", top: "60%", left: "80%", size: 15, del: "1.5s" },
            { ch: "✨", top: "80%", left: "68%", size: 13, del: "3s" },
            { ch: "🌿", top: "30%", left: "76%", size: 14, del: "2.5s" },
          ] as const
        ).map((s, i) => (
          <div
            key={i}
            aria-hidden
            className="animate-float pointer-events-none absolute select-none opacity-20"
            style={{ top: s.top, left: s.left, fontSize: s.size, animationDelay: s.del }}
          >
            {s.ch}
          </div>
        ))}

        <div className="relative z-10 max-w-3xl">
          {/* Eyebrow pill */}
          <div className="animate-fade-up mb-6 w-fit rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.36em]"
            style={{ borderColor: "oklch(74% 0.13 82 / 0.3)", background: "oklch(74% 0.13 82 / 0.08)", color: "var(--accent)" }}>
            Our Menu
          </div>

          {/* Title */}
          <h1
            className="animate-fade-up reveal-delay-1 font-serif text-5xl leading-[1.1] sm:text-6xl lg:text-7xl"
            style={{ color: "var(--foreground)" }}
          >
            A menu built for
            <br />
            <span style={{ color: "var(--accent)" }}>memorable meals</span>
          </h1>

          {/* Description */}
          <p
            className="animate-fade-up reveal-delay-2 mt-5 max-w-2xl text-base leading-7"
            style={{ color: "var(--muted)" }}
          >
            Every dish is crafted to order using seasonal ingredients, house spice blends, and techniques
            refined over generations. {allMenuItems.length} dishes across {menuByCategory.length} categories —{" "}
            {allMenuItems.filter((i) => i.tags.includes("vegetarian")).length} vegetarian options.
          </p>

          {/* Stats row */}
          <div className="animate-fade-up reveal-delay-3 mt-8 flex flex-wrap gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl px-5 py-3 transition hover:border-[oklch(74%_0.13_82_/_0.3)]"
                style={{
                  border: "1px solid var(--border)",
                  background: "oklch(15% 0.022 36 / 0.5)",
                }}
              >
                <p className="font-serif text-xl" style={{ color: "var(--foreground)" }}>{s.value}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div className="animate-fade-up reveal-delay-3 mt-6 flex flex-wrap gap-3">
            <Link
              href="/book-table"
              className="rounded-full px-6 py-2.5 text-sm font-semibold transition hover:brightness-110"
              style={{ background: "var(--accent-strong)", color: "var(--foreground)" }}
            >
              Book a Table
            </Link>
            <Link
              href="/whatsapp-order"
              className="rounded-full border px-6 py-2.5 text-sm font-medium transition hover:border-[var(--accent)] hover:text-[var(--foreground)]"
              style={{ borderColor: "var(--border)", color: "var(--muted)" }}
            >
              Order via WhatsApp
            </Link>
          </div>
        </div>
      </section>

      {/* Gradient divider */}
      <div className="gradient-divider mb-10" />

      {/* Category tabs + cards */}
      <CategoryTabs categories={menuByCategory} />
    </div>
  );
}
