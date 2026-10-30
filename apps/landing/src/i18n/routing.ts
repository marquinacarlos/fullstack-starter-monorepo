import { defineRouting } from "next-intl/routing";

// DEFAULT LANGUAGE: change this one value to make the site open in another language.
// `/` redirects to `/<defaultLocale>` (see src/app/page.tsx).
export const DEFAULT_LOCALE = "en";

// localStorage key where the language picked by the user is remembered.
export const LOCALE_STORAGE_KEY = "locale";

export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: DEFAULT_LOCALE,
});
