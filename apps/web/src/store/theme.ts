import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

// The `.dark` class on <html> is what the Tailwind `dark:` variant and the CSS tokens read.
function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

const systemTheme: Theme = window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: systemTheme,
      toggleTheme: () => {
        const next: Theme = get().theme === "dark" ? "light" : "dark";
        applyTheme(next);
        set({ theme: next });
      },
    }),
    {
      name: "theme",
      // Runs once localStorage has been read (or the default is used).
      onRehydrateStorage: () => (state) => applyTheme(state?.theme ?? systemTheme),
    },
  ),
);
