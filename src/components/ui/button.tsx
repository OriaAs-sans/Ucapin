import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control font-ui font-bold text-base transition-all duration-150 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] disabled:pointer-events-none disabled:opacity-45 active:translate-y-[1px] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--btn-bg)] text-[var(--btn-fg)] border-2 border-[var(--btn-bg)] hover:bg-[var(--btn-hover)] hover:-translate-y-[1px]",
        accent:
          "bg-[var(--coral)] text-[var(--on-coral)] border-2 border-[var(--coral)] hover:bg-[#FF8D70] hover:shadow-[0_8px_18px_rgba(255,122,89,0.32)] hover:-translate-y-[1px]",
        outline:
          "bg-transparent text-[var(--text)] border-2 border-[var(--btn-bg)] hover:bg-[var(--surface-2)] hover:-translate-y-[1px]",
        surface:
          "bg-[var(--surface)] text-[var(--text)] border-[1.5px] border-[var(--line)] hover:bg-[var(--surface-2)] hover:-translate-y-[1px]",
        ghostLight:
          "bg-transparent text-[var(--hero-fg)] border-2 border-[rgba(247,245,238,0.45)] hover:bg-[rgba(247,245,238,0.12)]",
        quiet:
          "bg-transparent text-[var(--link)] border-2 border-transparent underline underline-offset-4 hover:decoration-2 px-3",
      },
      size: {
        default: "min-h-[48px] px-5 py-2",
        sm: "min-h-[40px] px-3.5 py-1.5 text-sm rounded-[12px]",
        lg: "min-h-[52px] px-6 py-2.5 text-lg",
        icon: "h-[42px] w-[42px] rounded-[12px] p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
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
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
