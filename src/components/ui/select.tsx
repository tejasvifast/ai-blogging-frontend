import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Lightweight native <select> styled to match the design system. Radix Select
 * isn't installed, and native selects are accessible + reliable for admin forms.
 */
const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "flex h-10 w-full appearance-none rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 pr-9 text-sm text-[var(--color-foreground)] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-[var(--color-card)] [&>option]:text-[var(--color-foreground)]",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
