import { ArrowUpRight } from "lucide-react";

import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="h-full">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-400">{label}</p>
          <p className="font-serif text-4xl text-stone-50">{value}</p>
          <p className="text-sm text-stone-300/75">{hint}</p>
        </div>
        <div className="rounded-full border border-amber-300/20 bg-amber-300/10 p-3 text-amber-100">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
    </Card>
  );
}
