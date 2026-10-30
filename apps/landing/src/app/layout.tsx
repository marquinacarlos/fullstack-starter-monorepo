import type { ReactNode } from "react";

// Pass-through root layout: <html> and <body> are rendered by app/[locale]/layout.tsx
// so the `lang` attribute can follow the locale.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
