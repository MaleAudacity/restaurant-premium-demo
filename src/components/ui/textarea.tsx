import * as React from "react";

import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-28 w-full rounded-3xl border border-white/10 bg-stone-950/60 px-4 py-3 text-sm text-stone-100 shadow-inner outline-none transition placeholder:text-stone-500 focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/20",
        className,
      )}
      {...props}
    />
  );
}
