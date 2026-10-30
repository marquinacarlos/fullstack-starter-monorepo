"use client";

import { Button } from "@repo/ui";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { useThemeStore } from "../store/theme";

export function ThemeToggle() {
  const t = useTranslations("common");
  const { theme, syncFromDocument, toggleTheme } = useThemeStore();

  // After hydration, adopt the theme the <head> script applied (stored choice or system).
  useEffect(() => {
    syncFromDocument();
  }, [syncFromDocument]);

  return (
    <Button variant="secondary" onClick={toggleTheme}>
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      {t("buttons.toggleTheme")} ({t(`theme.${theme}`)})
    </Button>
  );
}
