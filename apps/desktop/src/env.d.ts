import type { UpdatesApi } from "./shared";

declare global {
  interface Window {
    /** Exposed by src/preload.ts. */
    updates: UpdatesApi;
  }
}

export {};
