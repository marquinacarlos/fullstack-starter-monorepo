import { create } from "zustand";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

interface ThemeState {
  theme: Theme;
  /** Copies the theme that the <head> script already applied (see ThemeScript). */
  syncFromDocument: () => void;
  toggleTheme: () => void;
}

// The `.dark` class on <html> is what the Tailwind `dark:` variant and the CSS tokens read.
// Not using zustand's `persist` here: the page is pre-rendered as static HTML, so the store
// must start as "light" on server and client alike, and only sync after hydration.
export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",
  syncFromDocument: () =>
    set({ theme: document.documentElement.classList.contains("dark") ? "dark" : "light" }),
  toggleTheme: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // storage blocked (private mode): the theme still changes for this visit
    }
    set({ theme: next });
  },
}));
