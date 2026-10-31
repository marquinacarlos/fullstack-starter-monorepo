# Electron: distribution and updates

App: `apps/desktop`. Tools: `electron-vite` (build), `electron-builder` (installers), `electron-updater` (updates).

## Build vs distribute

| Command             | Result                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| `pnpm build`        | Compiles main, preload and renderer to `apps/desktop/out/`. No installer. Runs in CI on every PR |
| `pnpm dist:desktop` | Build + `electron-builder`: installers in `apps/desktop/release/`                                |

`electron-builder` builds for the **current OS**. To get all three installers use CI (`.github/workflows/ci-desktop.yml` runs a matrix on macOS, Windows and Linux).

## Installers

Configured in `apps/desktop/electron-builder.yml`:

| OS      | Targets                                                |
| ------- | ------------------------------------------------------ |
| Windows | NSIS installer (`.exe`)                                |
| macOS   | `.dmg` and `.zip` (the zip is required by the updater) |
| Linux   | AppImage                                               |

Icons: `apps/desktop/build/icon.png` (placeholder, 1024x1024). Replace it. electron-builder makes `.icns` and `.ico`.

## Before the first release

1. Replace `appId`, `productName`, `copyright`, `linux.executableName` (letters, digits and hyphens only) and the `author` in `package.json`.
2. Replace `publish.owner` and `publish.repo` with your GitHub repo.
3. Replace the placeholder icon.
4. Create `apps/desktop/.env.production` (copy `.env.production.example`) with your production API URL, or set `VITE_API_URL` in CI. It is baked into the bundle and is public.
5. Add **code signing** (macOS certificate + notarization, Windows certificate). Without it, macOS auto-update does not work and Windows shows warnings.

## API access from the packaged app (CORS)

**Tested** (Electron 45, macOS, packaged app loaded with `loadFile`): the page runs from `file://`, the browser sends **no `Origin` header** and does **not enforce CORS**. A call to a server that sends no CORS headers still works. So the packaged app can call the API without any entry in `CORS_ORIGINS`.

What this means:

- In **dev**, the renderer runs at `http://localhost:5174`. That is a normal origin, so CORS applies. That is why `5174` is in `apps/api/.env.development`.
- In **production**, do not add the desktop app to `CORS_ORIGINS`. Only list your web and landing origins.
- CORS is not a security boundary. The API cannot tell your app apart from any other client, so protect it with authentication when you add it.
- If you change how the window loads (a custom protocol like `app://`, or a remote `https://` URL), the page gets a real origin and CORS applies again. Add that origin to `CORS_ORIGINS`.
- Not tested on Windows or Linux. Check there before your first release.

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
