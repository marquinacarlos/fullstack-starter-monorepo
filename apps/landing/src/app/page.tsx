"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, routing } from "../i18n/routing";

// `/` has no content. It sends the visitor to the language they picked last time,
// or to DEFAULT_LOCALE on a first visit. Visiting /en or /es directly always wins.
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    } catch {
      // storage blocked: fall back to the default
    }
    const locale = routing.locales.find((l) => l === saved) ?? DEFAULT_LOCALE;
    // trailingSlash is on: go straight to /en/ and skip a 308 redirect hop.
    router.replace(`/${locale}/`);
  }, [router]);

  // Visible only without JavaScript, or for a moment before the redirect.
  return (
    <p style={{ padding: "1.5rem", fontFamily: "sans-serif" }}>
      <a href={`/${DEFAULT_LOCALE}/`}>Continue</a>
    </p>
  );
}
