# Desktop (Electron + React + Vite)

Same UI and the same three evidence panels as the web app, in an Electron window. Renderer dev server on port **5174**.

| Command             | What it does                                                                |
| ------------------- | --------------------------------------------------------------------------- |
| `pnpm dev`          | Starts Vite and opens the Electron window                                   |
| `pnpm build`        | Type check + compiles main, preload and renderer into `out/` (no installer) |
| `pnpm dist:desktop` | Build + `electron-builder`: creates installers in `release/`                |
| `pnpm lint`         | ESLint (root config)                                                        |
| `pnpm test`         | Vitest (logic only, one smoke test)                                         |

Files: `src/main.ts` (main process + updater), `src/preload.ts` (safe IPC bridge), `src/renderer.tsx` (React entry), `electron-builder.yml`, `build/` (icons).

Docs: [UPDATES](docs/UPDATES.md), [PANELS](docs/PANELS.md). Distribution: [docs/ELECTRON.md](../../docs/ELECTRON.md).
