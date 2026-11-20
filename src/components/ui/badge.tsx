import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-bold whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        teal: "bg-[var(--tile-teal)] text-[var(--tile-teal-fg)]",
        coral: "bg-[var(--tile-coral)] text-[var(--tile-coral-fg)]",
        green: "bg-[var(--tile-green)] text-[var(--tile-green-fg)]",
        ochre: "bg-[var(--tile-ochre)] text-[var(--tile-ochre-fg)]",
        ghost: "border-[1.5px] border-dashed border-[var(--line)] text-[var(--text-2)] bg-transparent",
        ok: "bg-[var(--ok-wash)] text-[var(--ok)]",
        almost: "bg-[var(--almost-wash)] text-[var(--almost-text)]",
        work: "bg-[var(--work-wash)] text-[var(--work-text)]",
      },
    },
    defaultVariants: {
      variant: "teal",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
