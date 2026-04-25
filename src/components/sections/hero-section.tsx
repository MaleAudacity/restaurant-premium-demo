"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

interface HeroStat {
  label: string;
  value: string;
}

interface HeroSectionProps {
  tagline: string;
  stats: HeroStat[];
}

const ease = "easeOut" as const;

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.62, ease, delay },
  } as const;
}

export function HeroSection({ tagline, stats }: HeroSectionProps) {
  return (
    <section className="relative flex min-h-[88vh] items-center py-16">
      {/* Floating orbs */}
      <div aria-hidden className="floating-orb animate-float pointer-events-none absolute -left-20 top-10 h-72 w-72 bg-[var(--accent)]/10" />
      <div aria-hidden className="floating-orb animate-float-slow pointer-events-none absolute right-10 top-1/3 h-96 w-96 bg-emerald-500/8" />
      <div aria-hidden className="floating-orb animate-float pointer-events-none absolute bottom-10 left-1/3 h-48 w-48 bg-[var(--accent)]/8" style={{ animationDelay: "3s" }} />

      {/* Floating spice emojis — desi kitchen energy */}
      {(
        [
          { ch: "🌶️", top: "10%",  left: "52%", size: 22, cls: "animate-float",      del: "0s"   },
          { ch: "🌿", top: "38%",  left: "58%", size: 16, cls: "animate-float-slow", del: "2s"   },
          { ch: "✨", top: "72%",  left: "54%", size: 14, cls: "animate-float",      del: "4.5s" },
          { ch: "🧄", top: "82%",  left: "65%", size: 15, cls: "animate-float-slow", del: "1.2s" },
          { ch: "⭐", top: "20%",  left: "64%", size: 13, cls: "animate-float",      del: "3.2s" },
        ] as const
      ).map((s, i) => (
        <div
          key={i}
          aria-hidden
          className={`pointer-events-none absolute select-none opacity-25 ${s.cls}`}
          style={{ top: s.top, left: s.left, fontSize: s.size, animationDelay: s.del, zIndex: 1 }}
        >
          {s.ch}
        </div>
      ))}

      <div className="relative z-10 grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* ── Text Column ── */}
        <div className="flex flex-col gap-8">
          {/* Eyebrow */}
          <motion.p
            className="w-fit rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-1.5 text-xs uppercase tracking-[0.36em] text-[var(--accent)]"
            {...fadeUp(0)}
          >
            🌶️ &nbsp;बेहतरीन भारतीय खाना &nbsp;·&nbsp; Premium Indian Dining
          </motion.p>

          {/* Headline */}
          <motion.h1
            className="font-serif text-5xl leading-[1.12] text-[var(--foreground)] sm:text-6xl lg:text-7xl"
            {...fadeUp(0.1)}
          >
            Bold flavours,
            <br />
            <span className="text-[var(--accent)]">seamless</span>
            <br />
            experiences.
          </motion.h1>

          {/* Hindi sub-tagline */}
          <motion.p
            className="w-fit rounded-xl border border-white/8 bg-white/4 px-4 py-2 font-serif text-sm italic text-[var(--accent)]/80"
            {...fadeUp(0.18)}
          >
            दिल से बना, शान से परोसा — Crafted with heart, served with pride
          </motion.p>

          {/* Tagline */}
          <motion.p
            className="max-w-md text-base leading-7 text-[var(--muted)] sm:text-lg"
            {...fadeUp(0.28)}
          >
            {tagline}
          </motion.p>

          {/* CTA row */}
          <motion.div className="flex flex-wrap gap-3" {...fadeUp(0.34)}>
            <Link
              className="rounded-full bg-[var(--accent-strong)] px-7 py-3 text-sm font-semibold text-[var(--foreground)] shadow-[0_0_24px_rgba(232,160,32,0.4)] transition hover:brightness-110"
              href="/book-table"
            >
              Reserve a Table
            </Link>
            <Link
              className="rounded-full border border-white/15 bg-white/6 px-7 py-3 text-sm text-[var(--foreground)] backdrop-blur-sm transition hover:bg-white/10"
              href="/menu"
            >
              Explore the Menu
            </Link>
            <Link
              className="flex items-center gap-2 rounded-full border border-[#25D366]/30 bg-[#25D366]/8 px-6 py-3 text-sm text-[#25D366] transition hover:bg-[#25D366]/15"
              href="/whatsapp-order"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
              WhatsApp
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div className="flex flex-wrap gap-3" {...fadeUp(0.46)}>
            {stats.map((stat) => (
              <div
                className="rounded-2xl border border-white/10 bg-white/4 px-5 py-3 backdrop-blur-sm"
                key={stat.label}
              >
                <p className="font-serif text-2xl font-light text-[var(--foreground)]">{stat.value}</p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Media Column ── */}
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
          initial={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.8, ease, delay: 0.15 }}
        >
          {/* Float wrapper — separate from Framer Motion so transforms don't conflict */}
          <div className="animate-float-slow">
          {/* Glow ring */}
          <div
            aria-hidden
            className="absolute -inset-4 rounded-[2.5rem] opacity-40"
            style={{
              background: "radial-gradient(circle at 50% 50%, oklch(74% 0.13 82 / 0.25), transparent 70%)",
              filter: "blur(20px)",
            }}
          />

          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--background-muted)] shadow-[0_32px_80px_rgba(0,0,0,0.6)] lg:aspect-[3/4]">
            <HeroMedia />

            {/* Overlay gradient — keeps text readable, adds cinematic depth */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, oklch(9% 0.015 40 / 0.78) 0%, oklch(9% 0.015 40 / 0.15) 45%, transparent 100%)",
              }}
            />

            {/* Subtle steam / heat shimmer overlay */}
            <div
              aria-hidden
              className="hero-steam absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(to top, transparent 55%, rgba(245,245,245,0.028) 78%, transparent 100%)",
              }}
            />

            {/* Slogan badge — top of card */}
            <div className="absolute top-5 left-0 right-0 flex justify-center">
              <div className="flex items-center gap-2 rounded-full border border-[var(--accent)]/35 bg-[oklch(9% 0.015 40 / 0.75)] px-5 py-2 backdrop-blur-md">
                <span aria-hidden className="h-1 w-1 rounded-full bg-[var(--accent)] opacity-80" />
                <p className="font-serif text-xs italic tracking-[0.18em] text-[var(--accent)]">
                  From Flame to Flavour
                </p>
                <span aria-hidden className="h-1 w-1 rounded-full bg-[var(--accent)] opacity-80" />
              </div>
            </div>

            {/* Floating location badge */}
            <div className="absolute bottom-5 left-5 right-5">
              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-[oklch(9% 0.015 40 / 0.88)] p-4 backdrop-blur-md">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/20">
                  <svg className="h-4 w-4 text-[var(--accent)]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--foreground)]">12 Residency Road</p>
                  <p className="text-[11px] text-[var(--muted)]">Ashok Nagar, Bengaluru · Open today 12–22:30</p>
                </div>
              </div>
            </div>
          </div>
          </div>{/* end float wrapper */}
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Renders a cooking video in the hero card.
 * Drop your video at /public/videos/hero-cooking.mp4 to activate it.
 * Falls back to the static hero image if the video fails to load.
 */
function HeroMedia() {
  const [videoFailed, setVideoFailed] = useState(false);
  const [imgSrc, setImgSrc] = useState(`/images/hero/hero.jpg?t=${Date.now()}`);

  if (!videoFailed) {
    return (
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster={imgSrc}
        className="hero-video-zoom absolute inset-0 h-full w-full object-cover"
        onError={() => setVideoFailed(true)}
      >
        <source src="/videos/hero-cooking.mp4" type="video/mp4" />
        <source src="/videos/hero-cooking.webm" type="video/webm" />
      </video>
    );
  }

  return (
    <Image
      alt="Mirch Masala signature dish — premium Indian cuisine"
      className="object-cover"
      fill
      priority
      src={imgSrc}
      unoptimized
      sizes="(max-width: 768px) 100vw, 45vw"
      onError={() => setImgSrc("/images/hero/hero.svg")}
    />
  );
}
