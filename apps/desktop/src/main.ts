import { join } from "node:path";

import { app, BrowserWindow, ipcMain, shell } from "electron";
import { autoUpdater } from "electron-updater";

import type { UpdateState } from "./shared";

let mainWindow: BrowserWindow | null = null;
let updateState: UpdateState = { status: "dev" };

function setUpdateState(next: UpdateState) {
  updateState = next;
  mainWindow?.webContents.send("updates:status", next);
}

function setupAutoUpdate() {
  // Auto-update only works in a packaged app that has a published release to compare with.
  if (!app.isPackaged) {
    setUpdateState({ status: "dev" });
    return;
  }

  autoUpdater.on("checking-for-update", () => setUpdateState({ status: "checking" }));
  autoUpdater.on("update-available", (info) =>
    setUpdateState({ status: "available", version: info.version }),
  );
  autoUpdater.on("update-not-available", () => setUpdateState({ status: "not-available" }));
  autoUpdater.on("update-downloaded", (info) =>
    setUpdateState({ status: "downloaded", version: info.version }),
  );
  autoUpdater.on("error", (error) => setUpdateState({ status: "error", message: error.message }));

  void autoUpdater.checkForUpdatesAndNotify();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 760,
    // The UI is responsive down to phone width; below this the window is not useful.
    minWidth: 360,
    minHeight: 480,
    show: false,
    webPreferences: {
      preload: join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.once("ready-to-show", () => mainWindow?.show());
  // Replay the state once the renderer is listening (it may have loaded after the event).
  mainWindow.webContents.once("did-finish-load", () => setUpdateState(updateState));

  // External links open in the system browser, never inside the app.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://")) void shell.openExternal(url);
    return { action: "deny" };
  });

  // electron-vite sets this variable only in `dev`.
  const devUrl = process.env["ELECTRON_RENDERER_URL"];
  if (devUrl) {
    void mainWindow.loadURL(devUrl);
  } else {
    void mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

ipcMain.handle("updates:get", () => updateState);

void app.whenReady().then(() => {
  createWindow();
  setupAutoUpdate();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  mainWindow = null;
  if (process.platform !== "darwin") app.quit();
});
