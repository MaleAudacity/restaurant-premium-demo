import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Mirch Masala",
  description:
    "The story behind Mirch Masala — progressive Indian dining with roots in tradition and a commitment to exceptional hospitality.",
};

const values = [
  {
    title: "Sourced with intention",
    body: "Every ingredient is chosen for its quality and provenance — from saffron sourced from Kashmir to black cardamom slow-smoked over charcoal.",
  },
  {
    title: "Cooked with conviction",
    body: "Our kitchen follows no shortcuts. Gravies are reduced for hours, breads are fired to order, and every kebab is touched by hand before it reaches the tandoor.",
  },
  {
    title: "Served with warmth",
    body: "Hospitality at Mirch Masala begins the moment a guest messages us on WhatsApp and ends long after the last course has been cleared.",
  },
  {
    title: "Rooted in India",
    body: "Our menu draws from Mughal courts, coastal kitchens, and Punjabi dhabas — celebrating the breadth and depth of Indian culinary heritage.",
  },
];

const team = [
  {
    name: "Aarav Malhotra",
    role: "Founder & Owner",
    bio: "Aarav spent eight years working in premium hospitality across Mumbai and London before returning to Bengaluru with a clear vision: an Indian restaurant that takes both the food and the guest experience seriously.",
    initials: "AM",
  },
  {
    name: "Chef Rohan Kapoor",
    role: "Executive Chef",
    bio: "Trained in the classical traditions of Lucknowi and Mughlai cuisine, Chef Rohan has spent fifteen years refining a personal style that marries precision with soul. His Nalli Nihari alone has earned a loyal following.",
    initials: "RK",
  },
  {
    name: "Sana Qureshi",
    role: "Head of Hospitality",
    bio: "Sana oversees every guest touchpoint — from the first WhatsApp message to the final farewell. Her philosophy is simple: every guest should leave feeling like a regular.",
    initials: "SQ",
  },
];

const milestones = [
  { year: "2019", event: "Mirch Masala opens in Ashok Nagar, Bengaluru" },
  { year: "2020", event: "Launches WhatsApp-first ordering during the pandemic; grows delivery 4×" },
  { year: "2021", event: "Expands to a 70-cover dining room; private events programme begins" },
  { year: "2022", event: "Chef's table introduced; Dal Bukhara named best in city by a leading food publication" },
  { year: "2023", event: "18,000+ orders fulfilled; rated 4.9★ across platforms" },
  { year: "2024", event: "Full digital platform launched — live orders, kitchen display, and WhatsApp bookings unified" },
];

export default function AboutPage() {
  return (
    <div className="space-y-24 py-10">

      {/* Hero */}
      <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-7">
          <p className="w-fit rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/8 px-4 py-1.5 text-xs uppercase tracking-[0.36em] text-[var(--accent)]">
            Our Story
          </p>
          <h1 className="font-serif text-5xl leading-[1.1] text-[var(--foreground)] sm:text-6xl">
            Cooking with roots.
            <br />
            <span className="text-[var(--accent)]">Serving with soul.</span>
          </h1>
          <p className="max-w-lg text-base leading-8 text-[var(--muted)]">
            Mirch Masala was born from a straightforward belief: that Indian cuisine at its finest deserves presentation, service, and a digital experience equal to its depth.
          </p>
          <p className="max-w-lg text-base leading-8 text-[var(--muted)]">
            We opened in Bengaluru in 2019 with thirty covers and one tandoor. Today we host private events for hundreds, fulfil thousands of orders each month, and welcome guests who drive across the city just for our Dal Bukhara.
          </p>
          <div className="flex gap-4 pt-2">
            <Link
              className="rounded-full bg-[var(--accent-strong)] px-7 py-3 text-sm font-semibold text-[var(--foreground)] shadow-[0_0_20px_rgba(232,160,32,0.35)] transition hover:brightness-110"
              href="/book-table"
            >
              Reserve a Table
            </Link>
            <Link
              className="rounded-full border border-white/12 bg-white/4 px-7 py-3 text-sm text-[var(--muted)] transition hover:bg-white/8 hover:text-[var(--foreground)]"
              href="/menu"
            >
              Explore the Menu
            </Link>
          </div>
        </div>

        {/* Visual panel */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[var(--background-muted)] p-10 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at 60% 30%, rgba(232,160,32,0.14), transparent 65%)",
            }}
          />
          <p className="relative font-serif text-8xl text-[var(--accent)]">2019</p>
          <p className="relative mt-2 text-sm text-[var(--muted)]">Founded in Bengaluru</p>
          <div className="relative mt-8 grid grid-cols-2 gap-3">
            {[
              { v: "18k+", l: "Orders served" },
              { v: "4.9★", l: "Avg. rating" },
              { v: "320+", l: "Private events" },
              { v: "70", l: "Covers" },
            ].map((s) => (
              <div className="rounded-2xl border border-white/8 bg-[var(--background)] py-5" key={s.l}>
                <p className="font-serif text-2xl text-[var(--foreground)]">{s.v}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      <div>
        <div className="mb-10">
          <p className="mb-3 w-fit rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/8 px-4 py-1.5 text-xs uppercase tracking-[0.36em] text-[var(--accent)]">
            What We Stand For
          </p>
          <h2 className="font-serif text-4xl text-[var(--foreground)]">
            Our commitments
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {values.map((v) => (
            <div
              className="rounded-[1.5rem] border border-white/8 bg-[var(--background-muted)] p-7 transition hover:border-[var(--accent)]/20"
              key={v.title}
            >
              <h3 className="font-serif text-xl text-[var(--foreground)]">{v.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{v.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div>
        <div className="mb-10">
          <p className="mb-3 w-fit rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/8 px-4 py-1.5 text-xs uppercase tracking-[0.36em] text-[var(--accent)]">
            The People
          </p>
          <h2 className="font-serif text-4xl text-[var(--foreground)]">
            Behind every great meal
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {team.map((person) => (
            <div
              className="flex flex-col gap-5 rounded-[1.5rem] border border-white/8 bg-[var(--background-muted)] p-7"
              key={person.name}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)]/15 font-serif text-xl font-semibold text-[var(--accent)]">
                {person.initials}
              </div>
              <div>
                <p className="font-serif text-xl text-[var(--foreground)]">{person.name}</p>
                <p className="mt-0.5 text-xs uppercase tracking-wide text-[var(--accent)] opacity-80">{person.role}</p>
              </div>
              <p className="text-sm leading-7 text-[var(--muted)]">{person.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div>
        <div className="mb-10">
          <p className="mb-3 w-fit rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/8 px-4 py-1.5 text-xs uppercase tracking-[0.36em] text-[var(--accent)]">
            Our Journey
          </p>
          <h2 className="font-serif text-4xl text-[var(--foreground)]">
            Five years, one direction
          </h2>
        </div>
        <div className="space-y-0">
          {milestones.map((m, i) => (
            <div className="flex gap-6" key={m.year}>
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10">
                  <div className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                </div>
                {i < milestones.length - 1 && (
                  <div className="w-px flex-1 bg-gradient-to-b from-[var(--accent)]/20 to-transparent" style={{ minHeight: 28 }} />
                )}
              </div>
              <div className="pb-8">
                <p className="font-mono text-sm font-bold text-[var(--accent)]">{m.year}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{m.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-[var(--background-muted)]">
        <div className="grid lg:grid-cols-2">
          <div className="flex flex-col justify-center gap-6 p-10 lg:p-12">
            <div>
              <p className="mb-3 w-fit rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/8 px-4 py-1.5 text-xs uppercase tracking-[0.36em] text-[var(--accent)]">
                Find Us
              </p>
              <h2 className="font-serif text-3xl text-[var(--foreground)]">Visit us in Bengaluru</h2>
            </div>
            <div className="space-y-3 text-sm text-[var(--muted)]">
              <p className="text-base text-[var(--foreground)]">12 Residency Road</p>
              <p>Ashok Nagar, Bengaluru</p>
              <p>Karnataka 560025, India</p>
            </div>
            <div className="space-y-2 text-sm text-[var(--muted)]">
              <p><span className="text-[var(--foreground)]">Mon – Thu</span> &nbsp; 12:00 – 22:30</p>
              <p><span className="text-[var(--foreground)]">Friday</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 12:00 – 23:00</p>
              <p><span className="text-[var(--foreground)]">Sat – Sun</span> &nbsp; 12:00 – 23:30</p>
            </div>
            <div className="flex gap-3 pt-2">
              <Link
                className="rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:brightness-110"
                href="/book-table"
              >
                Book a Table
              </Link>
              <Link
                className="rounded-full border border-white/12 bg-white/4 px-6 py-3 text-sm text-[var(--muted)] transition hover:bg-white/8 hover:text-[var(--foreground)]"
                href="/contact"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="flex min-h-64 items-center justify-center bg-[linear-gradient(135deg,rgba(232,160,32,0.06),oklch(9% 0.015 40 / 0.82))] p-10 lg:min-h-auto">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10">
                <svg className="h-7 w-7 text-[var(--accent)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
              <p className="font-serif text-lg text-[var(--foreground)]">Ashok Nagar</p>
              <p className="mt-1 text-sm text-[var(--muted)]">12 Residency Road, Bengaluru</p>
              <a
                className="mt-4 inline-block rounded-full border border-white/12 px-5 py-2 text-xs text-[var(--muted)] transition hover:text-[var(--foreground)]"
                href="https://maps.google.com?q=12+Residency+Road+Bengaluru"
                rel="noopener noreferrer"
                target="_blank"
              >
                Open in Google Maps →
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
