import * as React from "react";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "block font-display text-sm font-bold leading-snug text-[var(--text)]",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
