import type { ComponentProps } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
  ghost: "bg-transparent text-foreground hover:bg-muted",
};

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
}

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
