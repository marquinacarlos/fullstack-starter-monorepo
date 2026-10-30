const url = import.meta.env.VITE_API_URL;

// No fallback on purpose: a build that silently calls localhost is worse than a clear error.
if (!url) {
  throw new Error(
    "VITE_API_URL is not set. Define it in this app's .env.development (dev) or .env.production (build).",
  );
}

/** Base URL of the API, from VITE_API_URL. */
export const API_URL: string = url;
