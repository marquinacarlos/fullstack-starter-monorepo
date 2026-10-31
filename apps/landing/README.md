# Landing (Next.js)

Marketing site. App Router + next-intl, built as a **static export** (frontend only, no API in Next). Port **3000**. Routes live under `/en` and `/es`.
It has a `/download` page for the desktop app. <!-- scaffold:line desktop -->

| Command      | What it does                                                    |
| ------------ | --------------------------------------------------------------- |
| `pnpm dev`   | Next dev server on http://localhost:3000                        |
| `pnpm build` | Static export into `out/` (host it on any static server or CDN) |
| `pnpm lint`  | ESLint (root config)                                            |
| `pnpm test`  | Vitest (logic only, one smoke test)                             |

It uses `@repo/tailwind-config` and `@repo/ui`.
The "Everything is connected" demo section also uses `@repo/lib` (live panels, like web and desktop). <!-- scaffold:line landing-demo -->
It also has a light/dark theme toggle (zustand). <!-- scaffold:line dark-mode -->

Docs: [I18N](docs/I18N.md).
Demo section: [CONNECTED](docs/CONNECTED.md). <!-- scaffold:line landing-demo -->
Theme: [THEME](docs/THEME.md). <!-- scaffold:line dark-mode -->

Update the download links in `src/app/[locale]/download/page.tsx` (`RELEASES_URL`). <!-- scaffold:line desktop -->

Env: `NEXT_PUBLIC_API_URL` (API address for the demo section) in `.env.development` (dev) or `.env.production` (build). It is public and baked into the static files. If it is missing, the page still builds and works. <!-- scaffold:line landing-demo -->
