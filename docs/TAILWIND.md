# Tailwind CSS v4 (CSS-first)

There is **no** `tailwind.config.js` or `tailwind.config.ts`. All configuration is CSS.

## Where things are

| File                                                    | Role                                          |
| ------------------------------------------------------- | --------------------------------------------- |
| `packages/tailwind-config/shared-styles.css`            | Design tokens in `@theme` + dark mode variant |
| `apps/*/src/index.css` (landing: `src/app/globals.css`) | Imports Tailwind and the tokens               |

## App stylesheet

```css
@import "tailwindcss";
@import "@repo/tailwind-config";
@source "../../../packages/ui/src";
```

- `@import "@repo/tailwind-config"` loads the shared tokens. The package exports its CSS with the `style` condition.
- `@source` tells Tailwind to scan `packages/ui` for class names. Tailwind v4 detects sources automatically, but not inside other workspace packages. Without this line, `Button` and `Card` would lose their styles.
- The path is relative to the CSS file.
- Landing uses `@repo/ui` only in its demo section, so its `@source` is `../../../../packages/ui/src` (relative to `src/app/globals.css`).

## Plugins

Vite apps use `@tailwindcss/vite` in `vite.config.ts` / `electron.vite.config.ts`. Landing uses `@tailwindcss/postcss` in `postcss.config.mjs`.

## Tokens

Semantic colors are CSS variables set in `:root` and `.dark`, then mapped in `@theme inline`:

```css
:root {
  --primary: oklch(0.55 0.2 265);
}
.dark {
  --primary: oklch(0.68 0.17 265);
}
@theme inline {
  --color-primary: var(--primary);
}
```

This creates `bg-primary`, `text-primary`, etc. `inline` is needed so the utilities read the variable at runtime and `.dark` can override it.

Other tokens: fonts (`--font-sans`, `--font-mono`), `--radius-card` (`rounded-card`), `--spacing-page` (`px-page`).

## Dark mode

`@custom-variant dark (&:where(.dark, .dark *));` links `dark:` classes to a `.dark` class on `<html>`. The zustand store (`src/store/theme.ts`) toggles it and saves the choice in localStorage. Because tokens change under `.dark`, most components need no `dark:` classes. The landing (static HTML) also has a small script in `<head>` that sets the class before the first paint, to avoid a flash: see `apps/landing/docs/THEME.md`.

## Add a token

Add the variable in `:root` and `.dark`, then map it in `@theme inline`. Every app gets it.

## Responsive design (mobile first)

All three apps are built **mobile first**: the plain classes style a phone, and `sm:`, `md:` and `lg:` only add changes for wider screens. Tailwind breakpoints are `min-width`: `sm` 640 px, `md` 768 px, `lg` 1024 px. Do not use `max-*:` variants to patch the desktop layout.

Rules used in this repo:

| Rule                                                | Example                                                                                                                                                                              |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Give every grid a base column, then grow            | `grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3`. Without `grid-cols-1`, one long word makes the grid wider than the screen                                                    |
| Touch targets of 44 px on phones, compact from `sm` | `min-h-11 sm:min-h-0 sm:py-1.5` (`Button` and `Input` in `@repo/ui` already do it)                                                                                                   |
| Inputs at 16 px on phones                           | `text-base sm:text-sm` (below 16 px iOS zooms the page when you focus the field)                                                                                                     |
| Let long text break                                 | `wrap-anywhere` on lists and user content. `min-w-0` on grid and flex children (`Card` has it)                                                                                       |
| Stack forms on phones                               | `flex flex-col gap-2 sm:flex-row`                                                                                                                                                    |
| Header: two rows on phones, one from `md`           | Name and controls on the first row, nav below (`order-last w-full md:order-none md:w-auto`). Icon-only buttons with an `aria-label`; the text appears from `sm` (`hidden sm:inline`) |
| Page padding                                        | `px-4 sm:px-page`                                                                                                                                                                    |

Desktop: the Electron window has a minimum size of 360x480 (`minWidth`, `minHeight` in `apps/desktop/src/main.ts`).

### How to check

There are no component or E2E tests (see [TESTING.md](TESTING.md)), so check by hand in the browser at 320, 375, 768 and 1280 px, with a very long item name (`POST /api/items` accepts up to 100 characters without spaces). In the console, this must be `false` at every width:

```js
document.documentElement.scrollWidth > document.documentElement.clientWidth;
```
