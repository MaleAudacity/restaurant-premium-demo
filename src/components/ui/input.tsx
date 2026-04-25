import * as React from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex h-12 w-full rounded-2xl border border-white/10 bg-stone-950/60 px-4 text-sm text-stone-100 shadow-inner outline-none transition placeholder:text-stone-500 focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/20",
        className,
      )}
      {...props}
    />
  );
}
