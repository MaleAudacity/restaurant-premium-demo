"use client";

const dishRow = [
  { hindi: "दम बिरयानी", english: "Dum Biryani", icon: "🍚" },
  { hindi: "सीख कबाब", english: "Seekh Kebab", icon: "🍢" },
  { hindi: "मक्खन चिकन", english: "Butter Chicken", icon: "🫕" },
  { hindi: "पनीर टिक्का", english: "Paneer Tikka", icon: "🌶️" },
  { hindi: "दाल बुखारा", english: "Dal Bukhara", icon: "🌿" },
  { hindi: "तंदूरी झींगा", english: "Tandoori Prawns", icon: "🦐" },
  { hindi: "गुलाब जामुन", english: "Gulab Jamun", icon: "🍮" },
  { hindi: "मक्खन नान", english: "Butter Naan", icon: "🫓" },
  { hindi: "शाही लस्सी", english: "Royal Lassi", icon: "🥛" },
  { hindi: "नल्ली निहारी", english: "Nalli Nihari", icon: "🍖" },
];

const vibeRow = [
  { text: "🔥 Alag Swad", gold: true },
  { text: "✦ Taza Masale", gold: false },
  { text: "🌶️ Dil Se Pakaya", gold: true },
  { text: "✦ Daily Fresh", gold: false },
  { text: "⭐ 4.9 Stars", gold: true },
  { text: "✦ Open Flame", gold: false },
  { text: "🫕 Slow Cooked", gold: true },
  { text: "✦ Premium Dining", gold: false },
  { text: "🌿 Farm to Plate", gold: true },
  { text: "✦ Zero Shortcuts", gold: false },
  { text: "🎉 Ghar Jaisa Swad", gold: true },
  { text: "✦ Bengaluru Ka Best", gold: false },
];

// Duplicate each array so the scroll loops seamlessly
const dishes = [...dishRow, ...dishRow];
const vibes = [...vibeRow, ...vibeRow];

export function MarqueeStrip() {
  return (
    <div className="overflow-hidden border-y border-white/8 bg-[var(--background-muted)]">
      {/* Row 1 — dish names, scrolls left */}
      <div className="flex animate-marquee-left whitespace-nowrap py-3">
        {dishes.map((d, i) => (
          <span key={i} className="mx-5 inline-flex shrink-0 items-center gap-2 text-sm">
            <span className="text-lg leading-none">{d.icon}</span>
            <span className="font-serif text-[var(--foreground)]">{d.hindi}</span>
            <span className="text-[var(--muted)]/50">·</span>
            <span className="text-[var(--muted)]">{d.english}</span>
            <span className="ml-3 text-[var(--accent)]/35 text-base">✦</span>
          </span>
        ))}
      </div>

      {/* Row 2 — vibe words, scrolls right */}
      <div className="flex animate-marquee-right whitespace-nowrap pb-3">
        {vibes.map((v, i) => (
          <span
            key={i}
            className={[
              "mx-4 shrink-0 text-[11px] uppercase tracking-[0.22em]",
              v.gold ? "text-[var(--accent)]" : "text-[var(--muted)]/60",
            ].join(" ")}
          >
            {v.text}
          </span>
        ))}
      </div>
    </div>
  );
}
