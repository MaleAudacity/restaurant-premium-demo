"use client";

import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { FoodImage } from "@/components/ui/food-image";
import type { MenuCategory, MenuItem, MenuTag } from "@/data/menu-data";
import Link from "next/link";

const TAG_LABELS: Record<MenuTag, string> = {
  bestseller: "Bestseller",
  "chef-special": "Chef's Pick",
  vegetarian: "Veg",
  spicy: "Spicy",
  new: "New",
  signature: "Signature",
};

const TAG_STYLES: Record<MenuTag, string> = {
  bestseller: "bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/25",
  "chef-special": "bg-orange-500/12 text-orange-300 border-orange-400/25",
  vegetarian: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25",
  spicy: "bg-red-500/12 text-red-400 border-red-500/25",
  new: "bg-blue-500/12 text-blue-300 border-blue-400/25",
  signature: "bg-purple-500/10 text-purple-300 border-purple-400/20",
};

function formatPrice(paise: number) {
  return `₹${(paise / 100).toFixed(0)}`;
}

function MenuCard({ item }: { item: MenuItem }) {
  const priorityTags: MenuTag[] = ["signature", "bestseller", "chef-special", "vegetarian", "spicy", "new"];
  const displayTags = item.tags
    .sort((a, b) => priorityTags.indexOf(a) - priorityTags.indexOf(b))
    .slice(0, 3);

  return (
    <motion.div
      className="group flex flex-col overflow-hidden rounded-[1.5rem] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
      style={{ border: "1px solid var(--border)", background: "var(--background)" }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
      layout
      whileHover={{ y: -4, transition: { duration: 0.22 } }}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--background-muted)]">
        <FoodImage
          alt={item.name}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          fallbackSrc={item.fallbackImage}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          src={item.imagePath}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-16"
          style={{ background: "linear-gradient(to top, oklch(9% 0.015 40 / 0.75), transparent)" }}
        />
        <span className="absolute right-3 top-3 rounded-full px-3 py-1 text-sm font-semibold backdrop-blur-sm" style={{ border: "1px solid var(--border)", background: "oklch(9% 0.015 40 / 0.88)", color: "var(--accent)" }}>
          {formatPrice(item.priceInPaise)}
        </span>
        {item.tags.includes("bestseller") && (
          <span className="absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: "var(--accent-strong)", color: "var(--foreground)" }}>
            Bestseller
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {displayTags.filter((t) => t !== "bestseller").length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {displayTags.filter((t) => t !== "bestseller").map((tag) => (
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${TAG_STYLES[tag]}`}
                key={tag}
              >
                {TAG_LABELS[tag]}
              </span>
            ))}
          </div>
        )}
        <h3 className="font-serif text-lg leading-snug text-[var(--foreground)]">{item.name}</h3>
        <p className="line-clamp-2 flex-1 text-sm leading-6 text-[var(--muted)]">{item.description}</p>
        <div className="mt-auto flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border)" }}>
          <span className="text-xs opacity-60" style={{ color: "var(--muted)" }}>{item.category}</span>
          <Link
            className="rounded-full px-4 py-1.5 text-xs font-medium transition"
            href={`/menu/${item.slug}`}
            style={{ border: "1px solid oklch(52% 0.19 26 / 0.4)", color: "var(--accent)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-strong)"; e.currentTarget.style.color = "var(--foreground)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--accent)"; }}
          >
            Order
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function CategoryTabs({ categories }: { categories: MenuCategory[] }) {
  const [active, setActive] = useState(categories[0]?.slug ?? "");
  const layoutId = useId();

  const activeCategory = categories.find((c) => c.slug === active);

  return (
    <div>
      {/* Sticky tab bar */}
      <div className="sticky top-20 z-20 -mx-4 mb-8 overflow-x-auto px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8" style={{ background: "oklch(9% 0.015 40 / 0.92)" }}>
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              className="relative shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-colors"
              key={cat.slug}
              onClick={() => setActive(cat.slug)}
              style={{ color: active === cat.slug ? "var(--foreground)" : "var(--muted)" }}
            >
              {active === cat.slug && (
                <motion.span
                  className="absolute inset-0 rounded-full"
                  style={{ background: "var(--accent-strong)" }}
                  layoutId={layoutId}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category heading */}
      <AnimatePresence mode="wait">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          initial={{ opacity: 0, y: 8 }}
          key={active}
          transition={{ duration: 0.25 }}
        >
          <div className="mb-8">
            <h2 className="font-serif text-3xl text-[var(--foreground)]">{activeCategory?.name}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{activeCategory?.description}</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {activeCategory?.items.map((item) => (
              <MenuCard item={item} key={item.id} />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
