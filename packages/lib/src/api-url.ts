// The ambient ImportMeta typing must reach every app that compiles this file (Next.js has none).
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./env.d.ts" />

// Vite apps (web, desktop) define VITE_API_URL. Next.js (landing) defines NEXT_PUBLIC_API_URL.
// Each bundler replaces only its own variable at build time. The other lookup is harmless:
// `import.meta.env` is undefined in Next, and `process` does not exist in the Vite browser build.
function fromNext(): string | undefined {
  try {
    return process.env.NEXT_PUBLIC_API_URL;
  } catch {
    return undefined;
  }
}

const url = import.meta.env?.VITE_API_URL || fromNext();

// No fallback on purpose: a build that silently calls localhost is worse than a clear error.
if (!url) {
  throw new Error(
    "VITE_API_URL (NEXT_PUBLIC_API_URL in Next.js) is not set. Define it in this app's .env.development (dev) or .env.production (build).",
  );
}

/** Base URL of the API, from VITE_API_URL or NEXT_PUBLIC_API_URL. */
export const API_URL: string = url;
