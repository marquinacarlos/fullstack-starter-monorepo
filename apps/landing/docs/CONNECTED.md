# "Everything is connected" section

The landing is a marketing site, but its home page also has a demo section that proves the landing is wired to the same API and databases as the web and desktop apps. It shows the same four panels:

| Panel     | File                                          | Proves                                                                    |
| --------- | --------------------------------------------- | ------------------------------------------------------------------------- |
| REST      | `src/components/connected/PanelREST.tsx`      | `REST /health: connected`, items list and create (SQLite), zod            |
| GraphQL   | `src/components/connected/PanelGraphQL.tsx`   | `GraphQL health: ok`, items by query                                      |
| WebSocket | `src/components/connected/PanelWebSocket.tsx` | `WebSocket: connected`, live counter, echo                                |
| Databases | `src/components/connected/PanelDatabases.tsx` | State of SQLite and PostgreSQL (`connected`, `disabled`, `not available`) |

## It is still a static site

- The landing is built with `output: "export"`: plain HTML and JS, no Node server, no API in Next.
- The panels are client components. They run in the **browser** and call the FastAPI backend directly (CORS: `3000` is already in `CORS_ORIGINS`).
- A shared `QueryClientProvider` lives in `ConnectedPanels.tsx`. Panels do not share state or hooks.

## Where the code comes from

- The panels are copies of the web app panels. They use `@repo/ui` and `@repo/lib` (REST, GraphQL and WebSocket clients, zod), like web and desktop.
- Texts come from the `connected` namespace (`messages/{en,es}/connected.json`), so the EN/ES buttons translate them too.
- `@repo/lib` reads the API address from `VITE_API_URL` in Vite apps and from `NEXT_PUBLIC_API_URL` in Next.js.
- `next.config.ts` has `transpilePackages: ["@repo/lib", "@repo/ui"]`, because those packages are TypeScript source.

## Settings

| File                                   | In git? | Value                                                         |
| -------------------------------------- | ------- | ------------------------------------------------------------- |
| `apps/landing/.env.development`        | Yes     | `NEXT_PUBLIC_API_URL=http://localhost:8000`                   |
| `apps/landing/.env.production.example` | Yes     | Template for your real API URL                                |
| `apps/landing/.env.production`         | No      | Your real URL. Baked into the files at build time, and public |

If `NEXT_PUBLIC_API_URL` is missing at build time, the landing does **not** break: the section shows a short hint instead of the panels.

## Remove the demo section

The rest of the landing does not depend on it.

1. Delete `src/components/connected/`.
2. In `src/app/[locale]/page.tsx`: remove the `ConnectedSection` import and its tag.
3. Delete `messages/en/connected.json` and `messages/es/connected.json`, and remove `"connected"` from `namespaces` in `src/i18n/request.ts`.
4. In `next.config.ts`: remove `transpilePackages`. In `src/app/globals.css`: remove the `@source` line.
5. Delete `apps/landing/.env.development` and `.env.production.example`, and `NEXT_PUBLIC_API_URL` in `turbo.json`.
6. In `apps/landing/package.json`: remove `@repo/lib`, `@repo/ui` and `@tanstack/react-query`, then run `pnpm install`.
