"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    // Simulate async send — wire to real backend/email when ready
    setTimeout(() => setStatus("sent"), 1200);
  }

  if (status === "sent") {
    return (
      <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 px-6 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15">
          <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="font-serif text-xl text-[var(--foreground)]">Message sent!</p>
        <p className="text-sm text-[var(--muted)]">We&rsquo;ll get back to you within 2 hours.</p>
        <button
          className="mt-2 rounded-full border border-[var(--border)] px-5 py-2 text-xs text-[var(--muted)] transition hover:text-[var(--foreground)]"
          onClick={() => setStatus("idle")}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-wide text-[var(--muted)]" htmlFor="contact-name">
            Your name
          </label>
          <input
            className="rounded-xl border bg-[oklch(15%_0.022_36_/_0.4)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 outline-none transition focus:border-[var(--accent)]/50 focus:bg-[oklch(18%_0.024_36_/_0.5)]"
            id="contact-name"
            name="name"
            placeholder="Priya Sharma"
            required
            type="text"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-wide text-[var(--muted)]" htmlFor="contact-email">
            Email address
          </label>
          <input
            className="rounded-xl border bg-[oklch(15%_0.022_36_/_0.4)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 outline-none transition focus:border-[var(--accent)]/50 focus:bg-[oklch(18%_0.024_36_/_0.5)]"
            id="contact-email"
            name="email"
            placeholder="priya@example.com"
            required
            type="email"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs uppercase tracking-wide text-[var(--muted)]" htmlFor="contact-subject">
          Subject
        </label>
        <select
          className="rounded-xl border border-white/10 bg-[var(--background-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]/40"
          defaultValue=""
          id="contact-subject"
          name="subject"
          required
        >
          <option disabled value="">Select a topic…</option>
          <option value="reservation">Table Reservation</option>
          <option value="private-event">Private Event / Catering</option>
          <option value="feedback">Feedback</option>
          <option value="demo">Platform Demo Request</option>
          <option value="other">Other Enquiry</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs uppercase tracking-wide text-[var(--muted)]" htmlFor="contact-message">
          Message
        </label>
        <textarea
          className="min-h-32 rounded-xl border bg-[oklch(15%_0.022_36_/_0.4)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]/50 outline-none transition focus:border-[var(--accent)]/50 focus:bg-[oklch(18%_0.024_36_/_0.5)] resize-none"
          id="contact-message"
          name="message"
          placeholder="Tell us how we can help…"
          required
        />
      </div>

      <button
        className="w-full rounded-xl bg-[var(--accent-strong)] py-3.5 text-sm font-semibold text-[var(--foreground)] shadow-[0_0_20px_rgba(232,160,32,0.25)] transition hover:brightness-110 disabled:opacity-60"
        disabled={status === "sending"}
        type="submit"
      >
        {status === "sending" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
