// Types shared by main, preload and renderer (type-only: safe to import from anywhere).
export type UpdateState =
  | { status: "dev" }
  | { status: "checking" }
  | { status: "available"; version: string }
  | { status: "not-available" }
  | { status: "downloaded"; version: string }
  | { status: "error"; message: string };

export interface UpdatesApi {
  getStatus: () => Promise<UpdateState>;
  /** Returns an unsubscribe function. */
  onStatus: (callback: (state: UpdateState) => void) => () => void;
}
