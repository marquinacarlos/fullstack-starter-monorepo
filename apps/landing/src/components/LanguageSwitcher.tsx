"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "../i18n/navigation";
import { LOCALE_STORAGE_KEY, routing } from "../i18n/routing";

export function LanguageSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2">
      <Languages size={16} aria-label={t("language")} />
      {routing.locales.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => {
            try {
              localStorage.setItem(LOCALE_STORAGE_KEY, code);
            } catch {
              // storage blocked (private mode): the URL still carries the language
            }
            router.replace(pathname, { locale: code });
          }}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            code === locale ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          }`}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
