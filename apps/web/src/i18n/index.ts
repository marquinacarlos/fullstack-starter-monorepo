import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enAbout from "./locales/en/about.json";
import enCommon from "./locales/en/common.json";
import enHome from "./locales/en/home.json";
import esAbout from "./locales/es/about.json";
import esCommon from "./locales/es/common.json";
import esHome from "./locales/es/home.json";

// One JSON file per namespace and language. To add a namespace, see docs/I18N.md.
export const resources = {
  en: { common: enCommon, home: enHome, about: enAbout },
  es: { common: esCommon, home: esHome, about: esAbout },
} as const;

export const languages = ["en", "es"] as const;

// DEFAULT LANGUAGE: change this one value to make the app open in another language.
// It applies on first launch only. After the user picks a language, that choice is saved
// in localStorage and wins on later launches.
export const DEFAULT_LANGUAGE: (typeof languages)[number] = "en";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    // First entry: used when nothing is saved yet. "en" stays as the fallback for missing keys.
    fallbackLng: [...new Set([DEFAULT_LANGUAGE, "en"])],
    supportedLngs: languages,
    // "es-MX" -> "es"
    nonExplicitSupportedLngs: true,
    defaultNS: "common",
    ns: ["common", "home", "about"],
    interpolation: { escapeValue: false },
    // No "navigator": the browser language must not override DEFAULT_LANGUAGE.
    detection: { order: ["localStorage"], caches: ["localStorage"] },
  });

export default i18n;
