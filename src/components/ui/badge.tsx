import { cva, type VariantProps } from "class-variance-authority";

import { cn, getStatusTone } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]",
  {
    variants: {
      tone: {
        amber: "border-[var(--accent)]/25 bg-[var(--accent)]/10 text-[var(--accent)]",
        emerald: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
        rose: "border-rose-400/25 bg-rose-400/10 text-rose-300",
        stone: "border-[var(--border)] bg-[oklch(15%_0.022_36_/_0.5)] text-[var(--muted)]",
      },
    },
    defaultVariants: {
      tone: "stone",
    },
  },
);

export function Badge({
  className,
  tone,
  children,
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ tone, className }))}>{children}</div>;
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={getStatusTone(status)}>{status.replaceAll("_", " ")}</Badge>;
}
