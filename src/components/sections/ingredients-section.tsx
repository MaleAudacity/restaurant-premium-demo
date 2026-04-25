"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const tiles = [
  {
    src: "/images/menu/starters/gunpowder-prawns.jpg",
    alt: "Gunpowder prawns — fresh catch",
    top: 0, left: 0, width: 176, height: 224, rotate: -4, z: 2,
    delay: 0.08,
  },
  {
    src: "/images/menu/biryani/saffron-murgh-dum-biryani.jpg",
    alt: "Saffron dum biryani",
    top: 28, left: 156, width: 196, height: 208, rotate: 3, z: 3,
    delay: 0.18,
  },
  {
    src: "/images/menu/starters/lotus-stem-chaat.jpg",
    alt: "Lotus stem chaat — vibrant colours",
    top: 210, left: 12, width: 164, height: 176, rotate: -2, z: 2,
    delay: 0.28,
  },
  {
    src: "/images/menu/grill/lamb-gilafi-kebab.jpg",
    alt: "Lamb gilafi kebab — open flame",
    top: 238, left: 196, width: 152, height: 160, rotate: 5, z: 1,
    delay: 0.38,
  },
];

const badges = ["Whole Spices", "Open Flame", "Zero Shortcuts", "Daily Fresh"];

export function IngredientsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative overflow-hidden py-24" ref={ref}>
      {/* Gold dotted grid — inspired by reference, adapted to dark theme */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(oklch(74% 0.13 82 / 0.14) 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Warm accent glow — right side */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/2 h-[500px] w-[420px] -translate-y-1/2 opacity-20"
        style={{
          background: "radial-gradient(ellipse, oklch(52% 0.19 26 / 0.40), transparent 70%)",
          filter: "blur(90px)",
        }}
      />

      <div className="relative z-10 grid items-center gap-16 lg:grid-cols-2">

        {/* ── Staggered collage ── */}
        <div className="relative mx-auto h-[420px] w-full max-w-[380px] shrink-0 lg:mx-0">
          {tiles.map((tile, i) => (
            <motion.div
              key={i}
              animate={inView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 28 }}
              className="absolute overflow-hidden rounded-[1.25rem] border border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
              initial={{ opacity: 0, scale: 0.9, y: 28 }}
              style={{
                top: tile.top,
                left: tile.left,
                width: tile.width,
                height: tile.height,
                rotate: tile.rotate,
                zIndex: tile.z,
              }}
              transition={{ duration: 0.6, ease: "easeOut", delay: tile.delay }}
            >
              <Image
                alt={tile.alt}
                className="object-cover"
                fill
                sizes="200px"
                src={tile.src}
                unoptimized
              />
              {/* Inner vignette for depth */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{ background: "linear-gradient(140deg, rgba(0,0,0,0.22), transparent 55%)" }}
              />
            </motion.div>
          ))}
        </div>

        {/* ── Text column ── */}
        <div className="flex flex-col gap-7">
          <motion.p
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            className="w-fit rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-1.5 text-xs uppercase tracking-[0.36em] text-[var(--accent)]"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.5 }}
          >
            The Craft
          </motion.p>

          <motion.h2
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            className="font-serif text-4xl leading-[1.15] text-[var(--foreground)] sm:text-5xl"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Sourced Fresh.
            <br />
            <span className="text-[var(--accent)]">Cooked Bold.</span>
          </motion.h2>

          <motion.p
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            className="max-w-md text-base leading-7 text-[var(--muted)]"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.5, delay: 0.18 }}
          >
            Every dish at Mirch Masala begins with hand-picked produce, whole spices, and the kind of patience that can&apos;t be rushed. From morning prep to the last plate of the night — the kitchen runs on craft.
          </motion.p>

          {/* Ingredient badges */}
          <motion.div
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.5, delay: 0.28 }}
          >
            {badges.map((label) => (
              <span
                key={label}
                className="rounded-full border border-white/12 bg-white/5 px-4 py-1.5 text-xs text-[var(--muted)] backdrop-blur-sm"
              >
                {label}
              </span>
            ))}
          </motion.div>

          {/* Subtle divider stat row */}
          <motion.div
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            className="mt-2 flex gap-8 border-t border-white/8 pt-6"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.5, delay: 0.36 }}
          >
            {[
              { value: "12+", label: "Spice blends" },
              { value: "Daily", label: "Fresh sourcing" },
              { value: "0", label: "Shortcuts taken" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-serif text-2xl font-light text-[var(--foreground)]">{s.value}</p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
