"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";

import { FoodImage } from "@/components/ui/food-image";
import type { MenuItem, MenuTag } from "@/data/menu-data";

interface FeaturedDishesSectionProps {
  dishes: MenuItem[];
}

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

function formatPrice(paise: number): string {
  return `₹${(paise / 100).toFixed(0)}`;
}

function DishCard({ dish, index }: { dish: MenuItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const priorityTags: MenuTag[] = ["signature", "bestseller", "chef-special", "vegetarian", "spicy", "new"];
  const displayTags = dish.tags
    .sort((a, b) => priorityTags.indexOf(a) - priorityTags.indexOf(b))
    .slice(0, 2);

  return (
    <motion.div
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      className="group flex flex-col overflow-hidden rounded-[1.5rem] border border-white/8 bg-[var(--background-muted)] shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
      initial={{ opacity: 0, y: 28 }}
      ref={ref}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.07 }}
      whileHover={{ y: -5, transition: { duration: 0.25 } }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <FoodImage
          alt={dish.name}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          fallbackSrc={dish.fallbackImage}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          src={dish.imagePath}
        />
        {/* Subtle bottom fade */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-16"
          style={{ background: "linear-gradient(to top, oklch(12% 0.018 38 / 0.82), transparent)" }}
        />
        {/* Price badge */}
        <div className="absolute right-3 top-3 rounded-full border border-white/15 bg-[oklch(9% 0.015 40 / 0.88)] px-3 py-1 text-sm font-semibold text-[var(--accent)] backdrop-blur-sm">
          {formatPrice(dish.priceInPaise)}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Tags */}
        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {displayTags.map((tag) => (
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${TAG_STYLES[tag]}`}
                key={tag}
              >
                {TAG_LABELS[tag]}
              </span>
            ))}
          </div>
        )}

        {/* Name */}
        <h3 className="font-serif text-xl leading-snug text-[var(--foreground)]">{dish.name}</h3>

        {/* Description */}
        <p className="line-clamp-2 flex-1 text-sm leading-6 text-[var(--muted)]">{dish.description}</p>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/6">
          <span className="text-xs uppercase tracking-wide text-[var(--muted)] opacity-60">{dish.category}</span>
          <Link
            className="rounded-full border border-[var(--accent)]/30 px-4 py-1.5 text-xs font-medium text-[var(--accent)] transition hover:bg-[var(--accent-strong)] hover:text-[var(--foreground)]"
            href={`/menu`}
          >
            Order Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturedDishesSection({ dishes }: FeaturedDishesSectionProps) {
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-80px" });

  return (
    <section className="py-16">
      {/* Section header */}
      <div className="mb-12 flex flex-col items-center text-center" ref={headingRef}>
        <motion.p
          animate={headingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          className="mb-3 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/8 px-4 py-1.5 text-xs uppercase tracking-[0.36em] text-[var(--accent)]"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5 }}
        >
          Chef's Selection
        </motion.p>
        <motion.h2
          animate={headingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          className="font-serif text-4xl text-[var(--foreground)] sm:text-5xl"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          Guest favourites &amp;
          <br />
          <span className="text-[var(--accent)]">signature plates</span>
        </motion.h2>
        <motion.p
          animate={headingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)]"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5, delay: 0.16 }}
        >
          Each dish crafted with seasonal ingredients, house spice blends, and a deep respect for Indian culinary tradition.
        </motion.p>
      </div>

      {/* Cards grid */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {dishes.map((dish, index) => (
          <DishCard dish={dish} index={index} key={dish.id} />
        ))}
      </div>

      {/* View full menu CTA */}
      <div className="mt-12 flex justify-center">
        <Link
          className="group flex items-center gap-2 rounded-full border border-white/12 bg-white/4 px-8 py-3.5 text-sm text-[var(--muted)] backdrop-blur-sm transition hover:border-[var(--accent)]/30 hover:bg-white/6 hover:text-[var(--foreground)]"
          href="/menu"
        >
          View Full Menu
          <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </section>
  );
}
