import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent-strong)] text-[var(--foreground)] shadow-[0_8px_24px_oklch(52%_0.19_26_/_0.3)] hover:brightness-110 hover:scale-[1.01]",
        secondary:
          "border border-[var(--border)] bg-[oklch(15%_0.022_36_/_0.6)] text-[var(--foreground)] hover:bg-[oklch(18%_0.024_36_/_0.7)] hover:border-[var(--accent)]",
        ghost:
          "text-[var(--muted)] hover:bg-[oklch(15%_0.022_36_/_0.5)] hover:text-[var(--foreground)]",
        outline:
          "border border-[var(--accent)]/35 bg-transparent text-[var(--accent)] hover:bg-[var(--accent-strong)] hover:text-[var(--foreground)] hover:border-[var(--accent-strong)]",
        destructive:
          "bg-rose-500/90 text-white shadow-[0_14px_30px_rgba(244,63,94,0.2)] hover:bg-rose-500",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
