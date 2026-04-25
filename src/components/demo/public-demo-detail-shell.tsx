import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function PublicDemoDetailShell({
  eyebrow,
  title,
  description,
  highlights,
  primaryCta,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  highlights: Array<{
    icon: LucideIcon;
    label: string;
    value: string;
  }>;
  primaryCta: {
    href: string;
    label: string;
  };
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden border-amber-300/12 bg-[linear-gradient(135deg,rgba(245,158,11,0.2),rgba(17,24,39,0.48))] p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-100/82">{eyebrow}</p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight text-stone-50 md:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-stone-100/82 md:text-lg">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={primaryCta.href}>
                {primaryCta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/demo">
                <ArrowLeft className="h-4 w-4" />
                Back to Demo Center
              </Link>
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-200/78">Showcase Notes</p>
          <div className="mt-5 grid gap-3">
            {highlights.map(({ icon: Icon, label, value }) => (
              <div
                className="rounded-[24px] border border-white/10 bg-black/18 px-4 py-4"
                key={label}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8 text-amber-200">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-400">{label}</p>
                    <p className="mt-2 text-sm leading-6 text-stone-200/86">{value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {children}
    </div>
  );
}
