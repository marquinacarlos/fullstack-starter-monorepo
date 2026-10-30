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

`@custom-variant dark (&:where(.dark, .dark *));` links `dark:` classes to a `.dark` class on `<html>`. The zustand store (`src/store/theme.ts`) toggles it and saves the choice in localStorage. Because tokens change under `.dark`, most components need no `dark:` classes.

## Add a token

Add the variable in `:root` and `.dark`, then map it in `@theme inline`. Every app gets it.
