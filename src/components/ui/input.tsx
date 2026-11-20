import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex min-h-[48px] w-full rounded-control border-2 border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-base font-medium text-[var(--text)] placeholder:text-[var(--text-2)]/70 transition-colors focus-visible:border-[var(--btn-bg)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[2px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
