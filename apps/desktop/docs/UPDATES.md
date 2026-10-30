# Auto-update

Library: `electron-updater`. Code: `src/main.ts`. UI: `src/components/UpdatesStatus.tsx`.

## How it works

1. On start, `setupAutoUpdate()` checks `app.isPackaged`.
2. **Not packaged (dev):** it does nothing and the state is `dev`. The UI shows **"Updates: dev mode, disabled"**. This is the visible proof in `pnpm dev`.
3. **Packaged:** it calls `autoUpdater.checkForUpdatesAndNotify()` and sends every state change to the renderer.
4. The renderer reads the state through `window.updates` (`src/preload.ts`). It never touches `ipcRenderer` directly.

## States

`dev`, `checking`, `available`, `not-available`, `downloaded`, `error`. The type is `UpdateState` in `src/shared.ts`.

## To make it work for real

- Set `publish.owner` and `publish.repo` in `electron-builder.yml`.
- Publish a release to that GitHub repository (see [docs/ELECTRON.md](../../../docs/ELECTRON.md)).
- Code signing is needed for macOS auto-update and recommended on Windows.
- macOS needs the `zip` target, because the updater uses it (already in the config).

## Remove auto-update

Delete `UpdatesStatus.tsx`, its tag in `routes/Home.tsx`, the `updates` block in both `home.json` files, `src/shared.ts`, the `updates` bridge in `preload.ts`, `setupAutoUpdate()` in `main.ts`, the `publish` block in `electron-builder.yml`. Then run `pnpm --filter @repo/desktop remove electron-updater`.
