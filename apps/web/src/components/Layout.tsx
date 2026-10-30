import { Button } from "@repo/ui";
import { Info, Home, Languages, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet } from "react-router-dom";

import { languages } from "../i18n";
import { useThemeStore } from "../store/theme";

export function Layout() {
  const { t, i18n } = useTranslation("common");
  const { theme, toggleTheme } = useThemeStore();
  const current = i18n.resolvedLanguage;

  // Mobile first: 44px tap targets by default, compact from `md` up.
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium md:min-h-0 md:py-1.5 ${
      isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted"
    }`;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        {/* Phone: name + controls on the first row, nav below. From `md`: one row. */}
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-page">
          <span className="font-semibold md:mr-4">{t("appName")}</span>
          <div className="ml-auto flex items-center gap-1 sm:gap-2 md:order-last">
            <Languages
              size={16}
              className="hidden sm:block"
              aria-label={t("buttons.changeLanguage")}
            />
            {languages.map((lng) => (
              <Button
                key={lng}
                variant={current === lng ? "primary" : "ghost"}
                className="min-w-11 sm:min-w-0"
                onClick={() => void i18n.changeLanguage(lng)}
              >
                {lng.toUpperCase()}
              </Button>
            ))}
            <Button
              variant="secondary"
              onClick={toggleTheme}
              aria-label={`${t("buttons.toggleTheme")} (${t(`theme.${theme}`)})`}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              <span className="hidden sm:inline">
                {t("buttons.toggleTheme")} ({t(`theme.${theme}`)})
              </span>
            </Button>
          </div>
          <nav className="order-last flex w-full gap-1 md:order-none md:w-auto">
            <NavLink to="/" end className={linkClass}>
              <Home size={16} /> {t("nav.home")}
            </NavLink>
            <NavLink to="/about" className={linkClass}>
              <Info size={16} /> {t("nav.about")}
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-page sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
