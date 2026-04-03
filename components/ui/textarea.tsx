import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[120px] w-full rounded-md border border-[var(--bb-border)] bg-[var(--bb-input-bg)] px-3 py-2 text-sm text-[var(--bb-input-text)] placeholder:text-[var(--bb-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bb-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
