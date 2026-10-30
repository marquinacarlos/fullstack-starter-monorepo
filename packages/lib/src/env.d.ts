// Minimal typing so this package does not depend on vite. Vite replaces
// import.meta.env.VITE_API_URL at build time in every Vite consumer app.
// `env` is optional because other bundlers (Next.js) do not define it.
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env?: ImportMetaEnv;
}
