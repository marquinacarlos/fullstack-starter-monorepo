# Light / dark theme

The landing has the same theme toggle as web and desktop: a **Toggle theme** button in the header, with its text translated (EN/ES).

## How it works

| Piece       | File                             | Job                                                                                                         |
| ----------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Store       | `src/store/theme.ts`             | zustand store: `theme`, `toggleTheme()`, `syncFromDocument()`. Saves the choice in `localStorage` (`theme`) |
| Button      | `src/components/ThemeToggle.tsx` | Calls the store. Uses `Button` from `@repo/ui` and lucide icons                                             |
| Head script | `src/components/ThemeScript.tsx` | Runs **before the first paint** and adds the `.dark` class                                                  |
| Texts       | `messages/{en,es}/common.json`   | `buttons.toggleTheme`, `theme.light`, `theme.dark`                                                          |

The colors come from the shared tokens in `@repo/tailwind-config`: they change when `<html>` has the `.dark` class (see [docs/TAILWIND.md](../../../docs/TAILWIND.md#dark-mode)).

## Why there is a head script

The landing is static HTML. Without the script, every visitor would first see the light page and, after React loads, a flash to dark. The script reads the saved choice (or, on a first visit, the system preference) and sets the class before anything is drawn.

## Why the store does not use `persist`

The page is pre-rendered, so the server and the first client render must match: the store starts as `light` on both, and `ThemeToggle` adopts the real theme after hydration with `syncFromDocument()`. `<html>` has `suppressHydrationWarning` because the script changes its class before React runs. Saving to `localStorage` is done by hand in `toggleTheme()`.

## Behavior

- First visit: follows the system theme. After the visitor clicks the button, that choice wins.
- The choice stays across routes (`/`, `/download`), reloads and language changes.
- Each app saves it separately (browsers do not share storage between `localhost:3000`, `:5173` and `:5174`).

## Remove the theme toggle

1. Delete `src/store/theme.ts`, `src/components/ThemeToggle.tsx` and `src/components/ThemeScript.tsx`.
2. In `src/components/Header.tsx`: remove the `ThemeToggle` import and tag.
3. In `src/app/[locale]/layout.tsx`: remove the `ThemeScript` import, the `<head>` block and `suppressHydrationWarning`.
4. Remove `buttons` and `theme` from `messages/{en,es}/common.json`.
5. Remove `zustand` from `apps/landing/package.json` and run `pnpm install`.
