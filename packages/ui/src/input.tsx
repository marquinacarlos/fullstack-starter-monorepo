import type { ComponentProps } from "react";

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return (
    <input
      className={`min-h-11 w-full rounded-lg border border-border bg-card px-3 py-2 text-base text-card-foreground sm:min-h-0 sm:py-1.5 sm:text-sm outline-none focus:ring-2 focus:ring-primary ${className}`}
      {...props}
    />
  );
}
