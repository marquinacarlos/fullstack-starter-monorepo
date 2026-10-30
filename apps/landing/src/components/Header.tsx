import { Download, Home } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "../i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const t = useTranslations("common");
  const linkClass =
    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-muted";

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-page py-3">
        <span className="mr-4 font-semibold">{t("appName")}</span>
        <nav className="flex gap-1">
          <Link href="/" className={linkClass}>
            <Home size={16} /> {t("nav.home")}
          </Link>
          <Link href="/download" className={linkClass}>
            <Download size={16} /> {t("nav.download")}
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
