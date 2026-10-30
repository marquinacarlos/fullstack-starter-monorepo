# Landing (Next.js)

Marketing / download site. App Router + next-intl, built as a **static export** (frontend only, no API in Next). Port **3000**. Routes: `/` and `/download`, under `/en` and `/es`.

| Command      | What it does                                                    |
| ------------ | --------------------------------------------------------------- |
| `pnpm dev`   | Next dev server on http://localhost:3000                        |
| `pnpm build` | Static export into `out/` (host it on any static server or CDN) |
| `pnpm lint`  | ESLint (root config)                                            |
| `pnpm test`  | Vitest (logic only, one smoke test)                             |

It only uses `@repo/tailwind-config` from the shared packages. Docs: [I18N](docs/I18N.md).

Update the download links in `src/app/[locale]/download/page.tsx` (`RELEASES_URL`).
