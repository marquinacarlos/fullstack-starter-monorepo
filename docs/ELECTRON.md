# Electron: distribution and updates

App: `apps/desktop`. Tools: `electron-vite` (build), `electron-builder` (installers), `electron-updater` (updates).

## Build vs distribute

| Command             | Result                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| `pnpm build`        | Compiles main, preload and renderer to `apps/desktop/out/`. No installer. Runs in CI on every PR |
| `pnpm dist:desktop` | Build + `electron-builder`: installers in `apps/desktop/release/`                                |

`electron-builder` builds for the **current OS**. To get all three installers use CI (the `electron` job runs a matrix on macOS, Windows and Linux).

## Installers

Configured in `apps/desktop/electron-builder.yml`:

| OS      | Targets                                                |
| ------- | ------------------------------------------------------ |
| Windows | NSIS installer (`.exe`)                                |
| macOS   | `.dmg` and `.zip` (the zip is required by the updater) |
| Linux   | AppImage                                               |

Icons: `apps/desktop/build/icon.png` (placeholder, 1024x1024). Replace it. electron-builder makes `.icns` and `.ico`.

## Before the first release

1. Replace `appId`, `productName`, `copyright` and the `author` in `package.json`.
2. Replace `publish.owner` and `publish.repo` with your GitHub repo.
3. Replace the placeholder icon.
4. Set `VITE_API_URL` to your production API (it is baked into the bundle).
5. Add **code signing** (macOS certificate + notarization, Windows certificate). Without it, macOS auto-update does not work and Windows shows warnings.

## Publish a release

```bash
export GH_TOKEN=<github token with repo scope>
pnpm --filter @repo/desktop exec electron-builder --publish always
```

The CI job builds with `--publish never`. Add your own release job when you are ready.

## Auto-update

Details in `apps/desktop/docs/UPDATES.md`. Short version: it runs only when `app.isPackaged`; in dev the UI shows "Updates: dev mode, disabled".

## Security defaults

`contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`. The renderer only gets what `src/preload.ts` exposes. Consider adding a Content-Security-Policy before shipping (not enabled by default because Vite dev injects inline scripts).
