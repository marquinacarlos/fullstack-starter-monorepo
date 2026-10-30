import { contextBridge, ipcRenderer } from "electron";

import type { UpdateState, UpdatesApi } from "./shared";

// Only this small, explicit API is exposed to the renderer (contextIsolation is on).
const updates: UpdatesApi = {
  getStatus: () => ipcRenderer.invoke("updates:get"),
  onStatus: (callback) => {
    const listener = (_event: unknown, state: UpdateState) => callback(state);
    ipcRenderer.on("updates:status", listener);
    return () => ipcRenderer.removeListener("updates:status", listener);
  },
};

contextBridge.exposeInMainWorld("updates", updates);
