"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { MobileMenu } from "@/components/layout/mobile-menu";
import { CartBadge } from "@/components/cart/cart-badge";
import { CustomerAuthButton } from "@/components/auth/customer-auth-button";
import { PushSubscribeButton } from "@/components/push/push-subscribe-button";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function Navbar({ restaurantName }: { restaurantName: string }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={[
        "sticky top-4 z-40 mx-auto max-w-7xl rounded-full px-4 py-3 transition-all duration-300",
        "border backdrop-blur-xl",
        scrolled
          ? "shadow-[0_8px_32px_rgba(0,0,0,0.55)]"
          : "shadow-[0_4px_16px_rgba(0,0,0,0.3)]",
      ].join(" ")}
      style={{
        borderColor: "var(--border)",
        background: scrolled
          ? "oklch(9% 0.015 40 / 0.95)"
          : "oklch(9% 0.015 40 / 0.75)",
      }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Logo */}
        <Link className="flex items-center gap-3 shrink-0" href="/">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-base font-bold shadow-[0_0_16px_oklch(74%_0.13_82_/_0.35)]"
            style={{
              background: "var(--accent-strong)",
              color: "var(--foreground)",
              fontFamily: "var(--font-serif)",
              fontSize: "18px",
            }}
          >
            M
          </div>
          <div className="leading-tight">
            <p className="font-serif text-lg tracking-wide" style={{ color: "var(--foreground)" }}>
              {restaurantName}
            </p>
            <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: "var(--muted)" }}>
              Premium Indian Dining
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden flex-1 items-center justify-center gap-7 md:flex">
          {navItems.map((item) => (
            <Link
              className="text-sm transition"
              href={item.href}
              key={item.href}
              style={{ color: "var(--muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <PushSubscribeButton />
          <CartBadge />
          <CustomerAuthButton />
          <Link
            className="rounded-full px-5 py-2 text-xs font-semibold transition hover:brightness-110"
            href="/book-table"
            style={{
              background: "var(--accent-strong)",
              color: "var(--foreground)",
              boxShadow: "0 0 14px oklch(52% 0.19 26 / 0.28)",
            }}
          >
            Book Table
          </Link>
        </div>

        {/* Mobile: cart badge + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <CartBadge />
          <MobileMenu items={[...navItems, { label: "Cart", href: "/cart" }, { label: "WhatsApp Order", href: "/whatsapp-order" }, { label: "Demo", href: "/demo" }]} />
        </div>
      </div>
    </header>
  );
}

export function PublicShell({
  restaurantName,
  children,
}: {
  restaurantName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ isolation: "isolate" }}>
      {/* Background ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[-2]"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 15% 0%, oklch(74% 0.13 82 / 0.10) 0%, transparent 60%),
            radial-gradient(ellipse 55% 40% at 85% 15%, oklch(52% 0.19 26 / 0.07) 0%, transparent 55%)
          `,
        }}
      />
      {/* Subtle floating orbs */}
      <div aria-hidden className="floating-orb animate-float pointer-events-none fixed left-[5%] top-[20%] z-[-1] h-64 w-64" style={{ background: "oklch(74% 0.13 82 / 0.04)" }} />
      <div aria-hidden className="floating-orb animate-float-slow pointer-events-none fixed right-[8%] top-[40%] z-[-1] h-80 w-80" style={{ background: "oklch(52% 0.19 26 / 0.04)", animationDelay: "2s" }} />
      <div aria-hidden className="floating-orb animate-float pointer-events-none fixed bottom-[15%] left-[40%] z-[-1] h-52 w-52" style={{ background: "oklch(74% 0.13 82 / 0.03)", animationDelay: "4s" }} />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        <Navbar restaurantName={restaurantName} />

        <main className="flex-1 py-6">{children}</main>

        {/* Footer */}
        <footer className="mt-20" style={{ borderTop: "1px solid var(--border)" }}>
          {/* Main footer grid */}
          <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
            {/* Brand column */}
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                  style={{
                    background: "var(--accent-strong)",
                    color: "var(--foreground)",
                    boxShadow: "0 0 16px oklch(52% 0.19 26 / 0.25)",
                    fontFamily: "var(--font-serif)",
                  }}
                >
                  M
                </div>
                <p className="font-serif text-xl" style={{ color: "var(--foreground)" }}>{restaurantName}</p>
              </div>
              <p className="max-w-xs text-sm leading-7" style={{ color: "var(--muted)" }}>
                Progressive Indian dining in Bengaluru. Elevated flavours, seamless hospitality, effortless WhatsApp booking.
              </p>
              {/* Hours */}
              <div className="space-y-1 text-xs" style={{ color: "var(--muted)" }}>
                <p className="font-semibold uppercase tracking-wide opacity-80" style={{ color: "var(--accent)" }}>Hours</p>
                <p>Mon – Thu &nbsp;12:00 – 22:30</p>
                <p>Fri &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;12:00 – 23:00</p>
                <p>Sat – Sun &nbsp;12:00 – 23:30</p>
              </div>
              {/* Address */}
              <div className="space-y-0.5 text-xs" style={{ color: "var(--muted)" }}>
                <p className="font-semibold uppercase tracking-wide opacity-80" style={{ color: "var(--accent)" }}>Location</p>
                <p>12 Residency Road, Ashok Nagar</p>
                <p>Bengaluru, Karnataka 560025</p>
              </div>
              {/* Social icons */}
              <div className="flex gap-3 pt-1">
                {[
                  { label: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" },
                  { label: "Facebook", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
                  { label: "WhatsApp", path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" },
                ].map(({ label, path }) => (
                  <a
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full transition"
                    href="#"
                    key={label}
                    onClick={(e) => e.preventDefault()}
                    style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.borderColor = "var(--accent)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d={path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Explore */}
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--accent)" }}>Explore</p>
              <ul className="space-y-2.5 text-sm" style={{ color: "var(--muted)" }}>
                <li><Link className="transition hover:text-[var(--foreground)]" href="/menu">Full Menu</Link></li>
                <li><Link className="transition hover:text-[var(--foreground)]" href="/about">Our Story</Link></li>
                <li><Link className="transition hover:text-[var(--foreground)]" href="/contact">Contact Us</Link></li>
                <li><Link className="transition hover:text-[var(--foreground)]" href="/demo">Live Demo</Link></li>
              </ul>
            </div>

            {/* Reserve */}
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--accent)" }}>Reserve</p>
              <ul className="space-y-2.5 text-sm" style={{ color: "var(--muted)" }}>
                <li><Link className="transition hover:text-[var(--foreground)]" href="/book-table">Book a Table</Link></li>
                <li><Link className="transition hover:text-[var(--foreground)]" href="/whatsapp-order">WhatsApp Order</Link></li>
                <li><Link className="transition hover:text-[var(--foreground)]" href="/track-order">Track Your Order</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--accent)" }}>Contact</p>
              <ul className="space-y-2.5 text-sm" style={{ color: "var(--muted)" }}>
                <li>
                  <a className="transition hover:text-[var(--foreground)]" href="tel:+919876543210">
                    +91 98765 43210
                  </a>
                </li>
                <li>
                  <a className="transition hover:text-[var(--foreground)]" href="mailto:hello@mirchmasala.demo">
                    hello@mirchmasala.demo
                  </a>
                </li>
              </ul>
              <Link
                className="mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition hover:brightness-110"
                href="/book-table"
                style={{
                  border: "1px solid oklch(52% 0.19 26 / 0.4)",
                  color: "var(--accent)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-strong)"; e.currentTarget.style.color = "var(--foreground)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--accent)"; }}
              >
                Book a Table →
              </Link>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="flex flex-col items-center justify-between gap-3 py-6 sm:flex-row text-xs opacity-50"
            style={{ borderTop: "1px solid var(--border)", color: "var(--muted)" }}
          >
            <p>© {new Date().getFullYear()} Mirch Masala. All rights reserved.</p>
            <div className="flex gap-5">
              <Link className="hover:opacity-80" href="#">Privacy Policy</Link>
              <Link className="hover:opacity-80" href="#">Terms of Use</Link>
              <Link className="hover:opacity-80" href="/login">Operator Login</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
