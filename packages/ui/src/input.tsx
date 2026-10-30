import type { ComponentProps } from "react";

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return (
    <input
      className={`w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-card-foreground outline-none focus:ring-2 focus:ring-primary ${className}`}
      {...props}
    />
  );
}
