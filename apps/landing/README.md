# Landing (Next.js)

Marketing / download site. App Router + next-intl, built as a **static export** (frontend only, no API in Next). Port **3000**. Routes: `/` and `/download`, under `/en` and `/es`.

| Command      | What it does                                                    |
| ------------ | --------------------------------------------------------------- |
| `pnpm dev`   | Next dev server on http://localhost:3000                        |
| `pnpm build` | Static export into `out/` (host it on any static server or CDN) |
| `pnpm lint`  | ESLint (root config)                                            |
| `pnpm test`  | Vitest (logic only, one smoke test)                             |

It uses `@repo/tailwind-config`, and `@repo/ui` + `@repo/lib` for the "Everything is connected" demo section (live REST, GraphQL, WebSocket and databases, like web and desktop). Docs: [I18N](docs/I18N.md), [CONNECTED](docs/CONNECTED.md).

Update the download links in `src/app/[locale]/download/page.tsx` (`RELEASES_URL`).

Env: `NEXT_PUBLIC_API_URL` (API address for the demo section) in `.env.development` (dev) or `.env.production` (build). It is public and baked into the static files. If it is missing, the page still builds and works.
