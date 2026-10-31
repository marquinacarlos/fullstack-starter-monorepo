// scaffold:begin landing-demo
// The ambient ImportMeta typing must reach every app that compiles this file (Next.js has none).
// scaffold:end landing-demo
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./env.d.ts" />

// scaffold:begin landing-demo
// Next.js reads NEXT_PUBLIC_API_URL. Each bundler replaces only its own variable at build time,
// so the lookup of the other one is harmless: `import.meta.env` is undefined in Next, and
// `process` does not exist in the Vite browser build.
function fromNext(): string | undefined {
  try {
    return process.env.NEXT_PUBLIC_API_URL;
  } catch {
    return undefined;
  }
}

// scaffold:end landing-demo
// Vite replaces VITE_API_URL at build time.
const candidates = [
  import.meta.env?.VITE_API_URL,
  fromNext(), // scaffold:line landing-demo
];
const url = candidates.find(Boolean);

const names = [
  "VITE_API_URL",
  "NEXT_PUBLIC_API_URL", // scaffold:line landing-demo
];

// No fallback on purpose: a build that silently calls localhost is worse than a clear error.
if (!url) {
  throw new Error(
    `${names.join(" or ")} is not set. Define it in this app's .env.development (dev) or .env.production (build).`,
  );
}

/** Base URL of the API. */
export const API_URL: string = url;
