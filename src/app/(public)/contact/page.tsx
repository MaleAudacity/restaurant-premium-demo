import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "@/components/sections/contact-form";

export const metadata: Metadata = {
  title: "Contact — Mirch Masala",
  description:
    "Get in touch with Mirch Masala — for reservations, private events, general enquiries, or to book a platform demo.",
};

const contactCards = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "Phone",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
    note: "Mon – Sun, 11:00 – 23:00",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "Email",
    value: "hello@mirchmasala.demo",
    href: "mailto:hello@mirchmasala.demo",
    note: "We reply within 2 hours",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
      </svg>
    ),
    label: "WhatsApp",
    value: "+91 98765 43210",
    href: "/whatsapp-order",
    note: "Instant booking & ordering",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: "Address",
    value: "12 Residency Road",
    href: "https://maps.google.com?q=12+Residency+Road+Bengaluru",
    note: "Ashok Nagar, Bengaluru 560025",
  },
];

export default function ContactPage() {
  return (
    <div className="space-y-16 py-10">

      {/* Page header */}
      <div className="max-w-2xl space-y-5">
        <p className="w-fit rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/8 px-4 py-1.5 text-xs uppercase tracking-[0.36em] text-[var(--accent)]">
          Get In Touch
        </p>
        <h1 className="font-serif text-5xl leading-tight text-[var(--foreground)] sm:text-6xl">
          We&rsquo;d love to
          <br />
          <span className="text-[var(--accent)]">hear from you</span>
        </h1>
        <p className="text-base leading-7 text-[var(--muted)]">
          For reservations, private events, general enquiries, or to book a platform demo — we&rsquo;re quick to respond on all channels.
        </p>
      </div>

      {/* Contact cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {contactCards.map((card) => (
          <a
            className="group flex flex-col gap-4 rounded-[1.5rem] border border-white/8 bg-[var(--background-muted)] p-6 transition hover:border-[var(--accent)]/25 hover:bg-[rgba(232,160,32,0.04)]"
            href={card.href}
            key={card.label}
            rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
            target={card.href.startsWith("http") ? "_blank" : undefined}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent)]/10 text-[var(--accent)]">
              {card.icon}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--muted)] opacity-60">{card.label}</p>
              <p className="mt-1 font-serif text-lg text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">{card.value}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{card.note}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Contact form + Demo CTA grid */}
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
        {/* Form */}
        <div className="rounded-[2rem] border border-white/8 bg-[var(--background-muted)] p-8 lg:p-10">
          <h2 className="font-serif text-2xl text-[var(--foreground)]">Send us a message</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">For event enquiries, feedback, or anything else — we read every message.</p>
          <ContactForm />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Demo CTA */}
          <div className="relative overflow-hidden rounded-[2rem] border border-[var(--accent)]/20 bg-[var(--background-muted)] p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(232,160,32,0.12), transparent 65%)" }}
            />
            <p className="relative mb-3 w-fit rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/8 px-3 py-1 text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
              For Restaurant Owners
            </p>
            <h3 className="relative font-serif text-2xl text-[var(--foreground)]">Book a platform demo</h3>
            <p className="relative mt-3 text-sm leading-7 text-[var(--muted)]">
              See the full WhatsApp booking, kitchen display, and analytics platform live — tailored to your restaurant.
            </p>
            <Link
              className="relative mt-5 inline-flex rounded-full bg-[var(--accent-strong)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] shadow-[0_0_20px_rgba(232,160,32,0.3)] transition hover:brightness-110"
              href="/demo"
            >
              View Live Demo →
            </Link>
          </div>

          {/* Hours */}
          <div className="rounded-[2rem] border border-white/8 bg-[var(--background-muted)] p-8">
            <h3 className="font-serif text-xl text-[var(--foreground)]">Opening hours</h3>
            <div className="mt-4 space-y-2 text-sm text-[var(--muted)]">
              {[
                { days: "Monday – Thursday", hours: "12:00 – 22:30" },
                { days: "Friday", hours: "12:00 – 23:00" },
                { days: "Saturday – Sunday", hours: "12:00 – 23:30" },
              ].map((row) => (
                <div className="flex items-center justify-between gap-4" key={row.days}>
                  <span>{row.days}</span>
                  <span className="text-[var(--foreground)]">{row.hours}</span>
                </div>
              ))}
            </div>
            <Link
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-[var(--accent)]/25 py-3 text-sm text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
              href="/book-table"
            >
              Reserve a Table
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
