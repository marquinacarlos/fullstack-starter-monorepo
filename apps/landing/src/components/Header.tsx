import { Download, Home } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "../i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const t = useTranslations("common");
  const linkClass =
    "inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium hover:bg-muted md:min-h-0 md:py-1.5";

  return (
    <header className="border-b border-border bg-card">
      {/* Phone: name + controls on the first row, nav below. From `md`: one row. */}
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-page">
        <span className="font-semibold md:mr-4">{t("appName")}</span>
        <div className="ml-auto flex items-center gap-1 sm:gap-2 md:order-last">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        <nav className="order-last flex w-full gap-1 md:order-none md:w-auto">
          <Link href="/" className={linkClass}>
            <Home size={16} /> {t("nav.home")}
          </Link>
          <Link href="/download" className={linkClass}>
            <Download size={16} /> {t("nav.download")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
