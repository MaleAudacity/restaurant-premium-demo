import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function DemoCard({
  icon: Icon,
  eyebrow,
  title,
  description,
  href,
  ctaLabel,
  highlights,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  highlights: string[];
}) {
  return (
    <Card className="flex h-full flex-col overflow-hidden border-amber-300/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(0,0,0,0.18))] p-0">
      <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.22),transparent_46%)] px-6 py-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f59e0b,#f97316)] text-stone-950">
          <Icon className="h-5 w-5" />
        </div>
        <p className="mt-5 text-xs uppercase tracking-[0.3em] text-amber-100/80">{eyebrow}</p>
        <h3 className="mt-3 font-serif text-3xl text-stone-50">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-stone-300/80">{description}</p>
      </div>
      <div className="flex flex-1 flex-col px-6 py-6">
        <div className="grid gap-3">
          {highlights.map((item) => (
            <div
              className="rounded-[20px] border border-white/10 bg-black/18 px-4 py-3 text-sm text-stone-200/84"
              key={item}
            >
              {item}
            </div>
          ))}
        </div>
        <Button asChild className="mt-6 w-full justify-between" size="lg">
          <Link href={href}>
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
