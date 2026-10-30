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

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${
      isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted"
    }`;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-page py-3">
          <span className="mr-4 font-semibold">{t("appName")}</span>
          <nav className="flex gap-1">
            <NavLink to="/" end className={linkClass}>
              <Home size={16} /> {t("nav.home")}
            </NavLink>
            <NavLink to="/about" className={linkClass}>
              <Info size={16} /> {t("nav.about")}
            </NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Languages size={16} aria-label={t("buttons.changeLanguage")} />
            {languages.map((lng) => (
              <Button
                key={lng}
                variant={current === lng ? "primary" : "ghost"}
                onClick={() => void i18n.changeLanguage(lng)}
              >
                {lng.toUpperCase()}
              </Button>
            ))}
            <Button variant="secondary" onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              {t("buttons.toggleTheme")} ({t(`theme.${theme}`)})
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-page py-8">
        <Outlet />
      </main>
    </div>
  );
}
