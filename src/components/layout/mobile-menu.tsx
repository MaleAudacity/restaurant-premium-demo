"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
}

interface MobileMenuProps {
  items: NavItem[];
}

export function MobileMenu({ items }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-10 w-10 items-center justify-center rounded-full transition md:hidden"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          border: "1px solid var(--border)",
          background: "oklch(15% 0.022 36 / 0.5)",
          color: "var(--foreground)",
        }}
      >
        <AnimatePresence initial={false} mode="wait">
          {open ? (
            <motion.span
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0, rotate: -90 }}
              key="close"
              transition={{ duration: 0.15 }}
            >
              <X className="h-4 w-4" />
            </motion.span>
          ) : (
            <motion.span
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0, rotate: 90 }}
              key="open"
              transition={{ duration: 0.15 }}
            >
              <Menu className="h-4 w-4" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-30 backdrop-blur-sm"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{ background: "oklch(9% 0.015 40 / 0.7)" }}
              transition={{ duration: 0.2 }}
            />

            {/* Drawer */}
            <motion.nav
              animate={{ opacity: 1, y: 0 }}
              className="fixed inset-x-4 top-20 z-40 overflow-hidden rounded-3xl shadow-2xl"
              exit={{ opacity: 0, y: -8 }}
              initial={{ opacity: 0, y: -12 }}
              style={{
                border: "1px solid var(--border)",
                background: "oklch(11% 0.016 39)",
              }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div className="p-6">
                <ul className="space-y-1">
                  {items.map((item, index) => (
                    <motion.li
                      animate={{ opacity: 1, x: 0 }}
                      initial={{ opacity: 0, x: -8 }}
                      key={item.href}
                      transition={{ delay: index * 0.04, duration: 0.18 }}
                    >
                      <Link
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition"
                        href={item.href}
                        onClick={() => setOpen(false)}
                        style={{ color: "var(--muted)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--foreground)"; e.currentTarget.style.background = "oklch(15% 0.022 36 / 0.5)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.background = "transparent"; }}
                      >
                        {item.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
                <div className="mt-5 pt-5 space-y-2" style={{ borderTop: "1px solid var(--border)" }}>
                  <Link
                    className="flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition hover:brightness-110"
                    href="/book-table"
                    onClick={() => setOpen(false)}
                    style={{ background: "var(--accent-strong)", color: "var(--foreground)" }}
                  >
                    Book a Table
                  </Link>
                  <Link
                    className="flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm transition"
                    href="/login"
                    onClick={() => setOpen(false)}
                    style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--foreground)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted)"; }}
                  >
                    Operator Login
                  </Link>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
