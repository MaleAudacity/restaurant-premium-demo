"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

import { FoodImage } from "@/components/ui/food-image";
import { menuByCategory } from "@/data/menu-data";
import type { MenuItem } from "@/data/menu-data";

// Pick the categories to show in this section and how many items each
const SHOWCASE_CATEGORIES = [
  { slug: "signature-starters", label: "🌶️ Starters", hindi: "स्टार्टर" },
  { slug: "tandoor-grill",      label: "🔥 Grill",    hindi: "ग्रिल"    },
  { slug: "royal-curries",      label: "🫕 Curries",  hindi: "करी"      },
  { slug: "biryani-atelier",    label: "🍚 Biryani",  hindi: "बिरयानी"  },
  { slug: "desserts-pour",      label: "🍮 Desserts", hindi: "मिठाई"    },
];

const ITEMS_PER_TAB = 4;

function formatPrice(paise: number) {
  return `₹${(paise / 100).toFixed(0)}`;
}

function MenuRow({ item, index }: { item: MenuItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.div
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      className="group flex items-center gap-4 rounded-2xl border border-transparent px-4 py-3.5 transition-colors hover:border-white/8 hover:bg-white/3"
      initial={{ opacity: 0, y: 16 }}
      ref={ref}
      transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.06 }}
    >
      {/* Dish image thumbnail */}
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/8 bg-[var(--background-muted)]">
        <FoodImage
          alt={item.name}
          className="object-cover"
          fallbackSrc={item.fallbackImage}
          fill
          sizes="56px"
          src={item.imagePath}
        />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-serif text-base text-[var(--foreground)]">{item.name}</p>
          {item.tags.includes("bestseller") && (
            <span className="shrink-0 rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--accent)]">
              Best
            </span>
          )}
          {item.tags.includes("new") && (
            <span className="shrink-0 rounded-full bg-blue-500/12 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-blue-300">
              New
            </span>
          )}
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-[var(--muted)]">{item.description}</p>
      </div>

      {/* Price + CTA */}
      <div className="flex shrink-0 items-center gap-3">
        <span className="font-semibold text-[var(--accent)]">{formatPrice(item.priceInPaise)}</span>
        <Link
          className="hidden rounded-full border border-[var(--accent)]/25 px-3 py-1 text-xs text-[var(--accent)] transition hover:bg-[var(--accent-strong)] hover:text-[var(--foreground)] sm:inline-block"
          href="/menu"
        >
          Order
        </Link>
      </div>
    </motion.div>
  );
}

export function ChefSpecialsSection() {
  const [activeTab, setActiveTab] = useState(SHOWCASE_CATEGORIES[0].slug);
  const headingRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headingRef, { once: true, margin: "-80px" });

  const activeCategory = menuByCategory.find((c) => c.slug === activeTab);
  const displayItems = activeCategory?.items.slice(0, ITEMS_PER_TAB) ?? [];
  const activeMeta = SHOWCASE_CATEGORIES.find((c) => c.slug === activeTab);

  return (
    <section className="py-20">
      {/* Header */}
      <div className="mb-12 flex flex-col items-center text-center" ref={headingRef}>
        <motion.p
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          className="mb-3 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/8 px-4 py-1.5 text-xs uppercase tracking-[0.36em] text-[var(--accent)]"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5 }}
        >
          The Menu
        </motion.p>
        <motion.h2
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          className="font-serif text-4xl text-[var(--foreground)] sm:text-5xl"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          Popular picks &amp;
          <br />
          <span className="text-[var(--accent)]">chef specials</span>
        </motion.h2>
        <motion.p
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)]"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5, delay: 0.16 }}
        >
          Explore our most-loved dishes across every section of the menu. Each plate is crafted to order and presented with care.
        </motion.p>
      </div>

      {/* Category tabs */}
      <motion.div
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        className="mb-8 flex flex-wrap justify-center gap-2"
        initial={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.5, delay: 0.22 }}
      >
        {SHOWCASE_CATEGORIES.map((cat) => (
          <button
            className={[
              "rounded-full border px-5 py-2 text-sm transition flex flex-col items-center leading-tight",
              activeTab === cat.slug
                ? "border-[var(--accent)] bg-[var(--accent)] font-semibold text-[var(--foreground)]"
                : "border-white/10 bg-white/4 text-[var(--muted)] hover:border-white/20 hover:text-[var(--foreground)]",
            ].join(" ")}
            key={cat.slug}
            onClick={() => setActiveTab(cat.slug)}
          >
            <span>{cat.label}</span>
            <span className={["text-[10px] font-normal mt-0.5", activeTab === cat.slug ? "text-[var(--muted)]" : "text-[var(--muted)]/60"].join(" ")}>
              {cat.hindi}
            </span>
          </button>
        ))}
      </motion.div>

      {/* List panel */}
      <div className="overflow-hidden rounded-[1.75rem] border border-white/8 bg-[var(--background-muted)]">
        {/* Panel header */}
        <div className="flex items-center justify-between border-b border-white/6 px-6 py-4">
          <div>
            <p className="font-serif text-lg text-[var(--foreground)]">{activeCategory?.name}</p>
            <p className="text-xs text-[var(--muted)]">{activeCategory?.description}</p>
          </div>
          <Link
            className="rounded-full border border-white/10 px-4 py-1.5 text-xs text-[var(--muted)] transition hover:border-[var(--accent)]/30 hover:text-[var(--foreground)]"
            href="/menu"
          >
            See all →
          </Link>
        </div>

        {/* Animated items */}
        <AnimatePresence mode="wait">
          <motion.div
            animate={{ opacity: 1 }}
            className="divide-y divide-white/4 px-2 py-2"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            key={activeTab}
            transition={{ duration: 0.22 }}
          >
            {displayItems.map((item, i) => (
              <MenuRow index={i} item={item} key={item.id} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Full menu CTA */}
      <motion.div
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        initial={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Link
          className="rounded-full bg-[var(--accent)] px-8 py-3.5 text-sm font-semibold text-[var(--foreground)] shadow-[0_0_20px_oklch(74% 0.13 82 / 0.30)] transition hover:brightness-110"
          href="/menu"
        >
          Browse the Full Menu
        </Link>
        <Link
          className="rounded-full border border-white/12 bg-white/4 px-8 py-3.5 text-sm text-[var(--muted)] transition hover:bg-white/8 hover:text-[var(--foreground)]"
          href="/book-table"
        >
          Reserve Your Table
        </Link>
      </motion.div>
    </section>
  );
}
