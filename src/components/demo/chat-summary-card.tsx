import { CheckCircle2, Clock3, CreditCard, MapPin, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { type ChatCard } from "@/lib/demo/chat-types";

const toneStyles: Record<NonNullable<ChatCard["tone"]>, string> = {
  amber: "border-amber-300/26 bg-amber-400/12 text-amber-50",
  emerald: "border-emerald-300/26 bg-emerald-400/12 text-emerald-50",
  stone: "border-white/10 bg-white/6 text-stone-50",
};

function getCardIcon(kind: ChatCard["kind"]) {
  switch (kind) {
    case "status":
      return <CheckCircle2 className="h-4 w-4" />;
    case "contact":
      return <MapPin className="h-4 w-4" />;
    case "list":
      return <Sparkles className="h-4 w-4" />;
    default:
      return <CreditCard className="h-4 w-4" />;
  }
}

export function DemoChatSummaryCard({ card }: { card: ChatCard }) {
  return (
    <div
      className={cn(
        "min-w-[240px] rounded-[22px] border px-4 py-4 shadow-[0_14px_40px_rgba(0,0,0,0.18)]",
        toneStyles[card.tone ?? "stone"],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-2xl bg-black/18 p-2 text-current">
            {getCardIcon(card.kind)}
          </div>
          <div>
            <p className="text-sm font-semibold">{card.title}</p>
            {card.subtitle ? (
              <p className="mt-1 text-xs leading-5 text-current/76">{card.subtitle}</p>
            ) : null}
          </div>
        </div>
        {card.badge ? (
          <span className="rounded-full border border-current/18 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-current/88">
            {card.badge}
          </span>
        ) : null}
      </div>

      {card.items?.length ? (
        <div className="mt-4 space-y-3 rounded-[18px] border border-black/8 bg-black/10 p-3">
          {card.items.map((item) => (
            <div className="flex items-start justify-between gap-3" key={`${card.title}-${item.title}`}>
              <div>
                <p className="text-sm font-medium text-current">{item.title}</p>
                {item.description ? (
                  <p className="mt-1 text-xs leading-5 text-current/72">{item.description}</p>
                ) : null}
              </div>
              <div className="text-right">
                {item.meta ? <p className="text-xs font-semibold text-current">{item.meta}</p> : null}
                {item.badge ? (
                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-current/70">
                    {item.badge}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {card.rows?.length ? (
        <div className="mt-4 space-y-2.5">
          {card.rows.map((row) => (
            <div className="flex items-start justify-between gap-4 text-xs" key={`${card.title}-${row.label}`}>
              <span className="text-current/66">{row.label}</span>
              <span className="max-w-[62%] text-right font-medium leading-5 text-current">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {card.footnote ? (
        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-black/10 px-3 py-2 text-[11px] leading-5 text-current/74">
          <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{card.footnote}</span>
        </div>
      ) : null}
    </div>
  );
}
