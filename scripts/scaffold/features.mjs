// Single source of truth for `pnpm scaffold`. Everything the CLI knows about the template is here.
//
// A feature is something you can remove. Removing it does four things (engine.mjs):
//   1. blocks and lines marked `scaffold:begin|line <feature>` in shared files disappear;
//   2. the paths in `delete` are deleted;
//   3. the `json`, `text` and `write` edits are applied;
//   4. `cors` origins are taken out of the API env files.
// Marker syntax and the rules for adding a feature: docs/SCAFFOLD.md.

const WEB_PANELS = (name) => [
  `apps/web/src/panels/${name}.tsx`,
  `apps/desktop/src/panels/${name}.tsx`,
  `apps/landing/src/components/connected/${name}.tsx`,
];

const HOME_JSON = [
  "apps/web/src/i18n/locales/en/home.json",
  "apps/web/src/i18n/locales/es/home.json",
  "apps/desktop/src/i18n/locales/en/home.json",
  "apps/desktop/src/i18n/locales/es/home.json",
  "apps/landing/messages/en/connected.json",
  "apps/landing/messages/es/connected.json",
];

const COMMON_JSON = [
  "apps/web/src/i18n/locales/en/common.json",
  "apps/web/src/i18n/locales/es/common.json",
  "apps/desktop/src/i18n/locales/en/common.json",
  "apps/desktop/src/i18n/locales/es/common.json",
  "apps/landing/messages/en/common.json",
  "apps/landing/messages/es/common.json",
];

const LANDING_HOME = ["apps/landing/messages/en/home.json", "apps/landing/messages/es/home.json"];

const ABOUT_JSON = [
  "apps/web/src/i18n/locales/en/about.json",
  "apps/web/src/i18n/locales/es/about.json",
  "apps/desktop/src/i18n/locales/en/about.json",
  "apps/desktop/src/i18n/locales/es/about.json",
];

const APP_PACKAGES = [
  "apps/web/package.json",
  "apps/desktop/package.json",
  "apps/landing/package.json",
];

const jsonDel = (files, paths) => files.map((file) => ({ file, del: paths }));
const rootScripts = (...names) => [{ file: "package.json", del: names.map((n) => `scripts.${n}`) }];
const turboPassThrough = (...names) => [
  {
    file: "turbo.json",
    arrayRemove: { path: "globalPassThroughEnv", values: names, dropEmpty: true },
  },
];
const turboEnv = (...names) => [
  { file: "turbo.json", arrayRemove: { path: "globalEnv", values: names, dropEmpty: true } },
];
const turboOutputs = (...values) => [
  { file: "turbo.json", arrayRemove: { path: "tasks.build.outputs", values } },
];

/**
 * `user: true` features are the ones you choose. The others are derived: they follow from
 * your choices (see `resolveRemoved`) and exist so a file can say "only if X and Y are gone".
 */
export const FEATURES = {
  // ---- apps -------------------------------------------------------------------------------
  api: {
    user: true,
    label: "API (FastAPI)",
    delete: ["apps/api", "ruff.toml", ".github/workflows/ci-api.yml", ".github/actions/setup-uv"],
    // The "what is inside" cards of the Next app describe the API.
    json: jsonDel(LANDING_HOME, ["features.api"]),
  },
  web: {
    user: true,
    label: "Web app (React + Vite)",
    delete: ["apps/web", ".github/workflows/ci-web.yml"],
    cors: ["http://localhost:5173", "https://your-web-app.example.com"],
    json: [...turboOutputs("dist/**"), ...jsonDel(LANDING_HOME, ["features.web"])],
  },
  desktop: {
    user: true,
    label: "Desktop app (Electron)",
    delete: [
      "apps/desktop",
      ".github/workflows/ci-desktop.yml",
      "docs/ELECTRON.md",
      "apps/landing/src/app/[locale]/download",
      "apps/landing/messages/en/download.json",
      "apps/landing/messages/es/download.json",
    ],
    cors: ["http://localhost:5174"],
    json: [
      ...rootScripts("dist:desktop"),
      ...jsonDel(LANDING_HOME, ["features.web"]),
      ...jsonDel(
        ["apps/landing/messages/en/home.json", "apps/landing/messages/es/home.json"],
        ["cta"],
      ),
      ...jsonDel(
        ["apps/landing/messages/en/common.json", "apps/landing/messages/es/common.json"],
        ["nav.download"],
      ),
    ],
    text: [
      {
        file: "apps/landing/src/i18n/request.ts",
        from: ', "download"',
        to: "",
      },
    ],
  },
  landing: {
    user: true,
    label: "Next app (static export, apps/landing)",
    delete: ["apps/landing", ".github/workflows/ci-landing.yml"],
    cors: ["http://localhost:3000", "https://your-landing.example.com"],
    json: turboOutputs(".next/**", "!.next/cache/**"),
  },

  // ---- API channels -----------------------------------------------------------------------
  rest: {
    user: true,
    label: "REST channel (items and database status; /health stays)",
    requires: "api",
    delete: [...WEB_PANELS("PanelREST"), "packages/lib/src/axios.ts"],
    json: [
      ...jsonDel(HOME_JSON, ["rest"]),
      { file: "packages/lib/package.json", del: ["dependencies.axios"] },
    ],
  },
  graphql: {
    user: true,
    label: "GraphQL channel",
    requires: "api",
    delete: [
      "apps/api/app/api/graphql",
      "apps/api/tests/test_graphql.py",
      ...WEB_PANELS("PanelGraphQL"),
      "packages/lib/src/graphql-client.ts",
    ],
    json: jsonDel(HOME_JSON, ["graphql"]),
  },
  websocket: {
    user: true,
    label: "WebSocket channel",
    requires: "api",
    delete: [
      "apps/api/app/api/websocket",
      ...WEB_PANELS("PanelWebSocket"),
      "packages/lib/src/ws-client.ts",
    ],
    json: jsonDel(HOME_JSON, ["websocket"]),
  },

  // ---- databases --------------------------------------------------------------------------
  sqlite: {
    user: true,
    label: "SQLite database (it holds the demo items)",
    requires: "api",
    delete: [
      "apps/api/app/models/sqlite",
      "apps/api/app/seeds/sqlite.py",
      "apps/api/alembic/sqlite",
    ],
    json: turboPassThrough("SQLITE_URL"),
  },
  postgres: {
    user: true,
    label: "PostgreSQL database (Docker for development)",
    requires: "api",
    delete: ["apps/api/app/models/postgres", "apps/api/alembic/postgres", "docker-compose.yml"],
    json: [...rootScripts("db:up", "db:down"), ...turboPassThrough("POSTGRES_URL")],
  },
  items: {
    user: true,
    label: "Demo items (model, migration, seed, routes and panels)",
    requires: "sqlite",
    delete: [
      "apps/api/app/models/sqlite/item.py",
      "apps/api/app/schemas/item.py",
      "apps/api/alembic/sqlite/versions/0001_create_items.py",
      "apps/api/app/seeds/sqlite.py",
      "apps/api/tests/test_seed.py",
    ],
    write: [{ file: "apps/api/alembic/sqlite/versions/.gitkeep", content: "" }],
    json: jsonDel(HOME_JSON, [
      "rest.itemsTitle",
      "rest.empty",
      "rest.placeholder",
      "rest.add",
      "rest.itemsError",
      "rest.saveError",
      "graphql.itemsTitle",
      "graphql.empty",
      "graphql.itemsError",
    ]),
  },

  // ---- landing and UI extras --------------------------------------------------------------
  "landing-demo": {
    user: true,
    label: "Live demo section in the Next app",
    requires: "landing",
    delete: [
      "apps/landing/src/components/connected",
      "apps/landing/messages/en/connected.json",
      "apps/landing/messages/es/connected.json",
      "apps/landing/docs/CONNECTED.md",
      "apps/landing/.env.development",
      "apps/landing/.env.production.example",
    ],
    json: [
      ...jsonDel(
        ["apps/landing/package.json"],
        ["dependencies.@repo/lib", "dependencies.@tanstack/react-query"],
      ),
      ...turboEnv("NEXT_PUBLIC_API_URL"),
    ],
    text: [
      {
        file: "apps/landing/src/i18n/request.ts",
        from: ', "connected"',
        to: "",
      },
    ],
  },
  "dark-mode": {
    user: true,
    label: "Dark mode toggle (zustand)",
    delete: [
      "apps/web/src/store/theme.ts",
      "apps/desktop/src/store/theme.ts",
      "apps/landing/src/store/theme.ts",
      "apps/landing/src/components/ThemeToggle.tsx",
      "apps/landing/src/components/ThemeScript.tsx",
      "apps/landing/docs/THEME.md",
    ],
    json: [
      ...jsonDel(COMMON_JSON, ["buttons.toggleTheme", "theme"]),
      ...jsonDel(ABOUT_JSON, ["stack.zustand"]),
      ...jsonDel(APP_PACKAGES, ["dependencies.zustand", "devDependencies.zustand"]),
    ],
  },

  // ---- derived (not asked: they follow from the answers above) ----------------------------
  "db-layer": {
    label: "Database layer (no database left)",
    delete: [
      "apps/api/app/db",
      "apps/api/app/models",
      "apps/api/app/seeds",
      "apps/api/app/api/deps.py",
      "apps/api/alembic",
      "apps/api/alembic.ini",
      "docs/DATABASES.md",
    ],
    json: [
      ...rootScripts("db:migrate", "db:seed"),
      ...jsonDel(
        ["apps/api/package.json"],
        [
          "scripts.db:migrate",
          "scripts.db:migrate:create",
          "scripts.db:rollback",
          "scripts.db:seed",
          "scripts.db:setup",
        ],
      ),
    ],
  },
  "db-status": {
    label: "Database status (route and panels)",
    delete: [
      "apps/api/app/api/routes/databases.py",
      "apps/api/app/schemas/database.py",
      "apps/api/tests/test_databases.py",
      ...WEB_PANELS("PanelDatabases"),
    ],
    json: jsonDel(HOME_JSON, ["databases"]),
  },
  "items-rest": {
    label: "Items REST route",
    delete: ["apps/api/app/api/routes/items.py", "apps/api/tests/test_items.py"],
  },
  channels: {
    label: "API channels (none left)",
    delete: [
      "docs/CHANNELS.md",
      "apps/api/docs/CHANNELS.md",
      "apps/web/docs/PANELS.md",
      // Without channels nothing reads VITE_API_URL.
      "apps/web/.env.development",
      "apps/web/.env.production.example",
      "apps/desktop/.env.development",
      "apps/desktop/.env.production.example",
    ],
    json: [
      ...jsonDel(
        ["apps/web/package.json", "apps/desktop/package.json"],
        ["dependencies.@tanstack/react-query", "devDependencies.@tanstack/react-query"],
      ),
      ...turboEnv("VITE_API_URL"),
    ],
  },
  lib: {
    label: "Shared API clients (@repo/lib)",
    delete: ["packages/lib"],
    json: jsonDel(APP_PACKAGES, ["dependencies.@repo/lib", "devDependencies.@repo/lib"]),
    text: [
      {
        file: "apps/landing/next.config.ts",
        from: '"@repo/lib", ',
        to: "",
      },
    ],
  },
  "lib-schemas": {
    label: "Shared zod schemas",
    delete: ["packages/lib/src/schemas.ts"],
    json: [{ file: "packages/lib/package.json", del: ["dependencies.zod"] }],
  },
  frontends: {
    label: "Frontends (none left)",
    delete: ["docs/I18N.md", "docs/TAILWIND.md"],
  },
  "only-postgres": {
    label: "SQLite removed but PostgreSQL kept (the migration helpers point to PostgreSQL)",
  },
  "react-apps": {
    label: "React apps (neither web nor desktop left)",
  },
  ui: {
    label: "Shared UI components (@repo/ui)",
    delete: ["packages/ui"],
  },
  tailwind: {
    label: "Shared Tailwind tokens",
    delete: ["packages/tailwind-config"],
  },
  "static-out": {
    label: "out/ build folder (no Electron or Next left)",
    json: turboOutputs("out/**"),
  },

  // ---- always removed by `pnpm scaffold` --------------------------------------------------
  template: {
    label: "Template-only material (this CLI, its docs and its CI)",
    delete: ["scripts/scaffold", "docs/SCAFFOLD.md", ".github/workflows/ci-scaffold.yml"],
    json: rootScripts("scaffold", "scaffold:verify"),
  },
};

export const USER_FEATURES = Object.keys(FEATURES).filter((name) => FEATURES[name].user);

/** Rules that turn your choices into the full set of removed features. Run until stable. */
const RULES = [
  // Everything of the backend goes with the backend.
  (has) => has("api") && ["rest", "graphql", "websocket", "sqlite", "postgres"],
  (has) => has("sqlite") && ["items"],
  // Demo items need a channel that shows them.
  (has) => has("rest") && has("graphql") && ["items"],
  (has) => has("sqlite") && has("postgres") && ["db-layer"],
  (has) => (has("rest") || has("db-layer")) && ["db-status"],
  (has) => (has("items") || has("rest")) && ["items-rest"],
  (has) => (has("api") || (has("rest") && has("graphql") && has("websocket"))) && ["channels"],
  (has) => (has("landing") || has("channels")) && ["landing-demo"],
  (has) => (has("channels") || (has("web") && has("desktop") && has("landing-demo"))) && ["lib"],
  (has) => (has("lib") || (has("rest") && has("items") && has("db-status"))) && ["lib-schemas"],
  (has) => has("web") && has("desktop") && has("landing") && ["ui", "tailwind", "frontends"],
  (has) => has("desktop") && has("landing") && ["static-out"],
  (has) => has("web") && has("desktop") && ["react-apps"],
];

export function resolveRemoved(chosen, { template = false } = {}) {
  const removed = new Set(chosen);
  for (const name of removed) {
    if (!FEATURES[name]?.user)
      throw new Error(`Unknown option "${name}". Options: ${USER_FEATURES.join(", ")}.`);
  }
  if (template) removed.add("template");

  let changed = true;
  while (changed) {
    changed = false;
    for (const rule of RULES) {
      const result = rule((name) => removed.has(name));
      if (!result) continue;
      for (const name of result) {
        if (!removed.has(name)) {
          removed.add(name);
          changed = true;
        }
      }
    }
  }

  // Not a removal rule: it describes a combination (SQLite gone, PostgreSQL stays).
  if (removed.has("sqlite") && !removed.has("postgres")) removed.add("only-postgres");

  if (["api", "web", "desktop", "landing"].every((app) => removed.has(app))) {
    throw new Error("Nothing would be left: keep at least one of api, web, desktop or landing.");
  }
  return removed;
}

/** Edits that depend on a combination of removed features. */
export function conditionalOps(removed) {
  const ops = { json: [], text: [] };
  if (removed.has("sqlite") && !removed.has("postgres")) {
    // Only PostgreSQL left: the migration helpers must point to it.
    ops.json.push({
      file: "apps/api/package.json",
      set: {
        "scripts.db:migrate:create": "uv run alembic -n postgres revision --autogenerate -m",
        "scripts.db:rollback": "uv run alembic -n postgres downgrade -1",
      },
    });
  }
  if (removed.has("db-layer")) {
    ops.json.push({
      file: "apps/api/package.json",
      set: { "scripts.dev": "uv run uvicorn app.main:app --reload --port 8000" },
    });
  }
  return ops;
}

const APP_SUMMARY = [
  ["api", "FastAPI API"],
  ["web", "React web app"],
  ["desktop", "Electron desktop app"],
  ["landing", "Next.js static app"],
];

/** `description` of the root package.json for what is left. */
export function describeProject(removed) {
  const parts = APP_SUMMARY.filter(([name]) => !removed.has(name)).map(([, text]) => text);
  return `pnpm + Turborepo monorepo: ${parts.join(", ")}.`;
}

/** Ready-made answers. `pnpm scaffold --preset <name>`; the same list drives verify.mjs. */
export const PRESETS = {
  full: { label: "Everything the template has", without: [] },
  "api-web-both": {
    label: "API (both databases) + web",
    without: ["desktop", "landing"],
  },
  "api-web-sqlite": {
    label: "API (SQLite) + web",
    without: ["desktop", "landing", "postgres"],
  },
  "api-web-postgres": {
    label: "API (PostgreSQL) + web",
    without: ["desktop", "landing", "sqlite"],
  },
  "api-web-nodb": {
    label: "API without database + web",
    without: ["desktop", "landing", "sqlite", "postgres"],
  },
  "web-only": { label: "Web only", without: ["api", "desktop", "landing"] },
  "next-only": { label: "Next app only", without: ["api", "web", "desktop"] },
  "desktop-only": { label: "Desktop only", without: ["api", "web", "landing"] },
  "api-only": { label: "API only", without: ["web", "desktop", "landing"] },
  "api-web-minimal": {
    label: "API (PostgreSQL, REST only) + web, no dark mode",
    without: ["desktop", "landing", "sqlite", "graphql", "websocket", "dark-mode"],
  },
};

/**
 * Words that must not survive in a pruned project. A match is a leftover reference to
 * something that was removed. `allow` lists the rare legitimate matches ({ file, pattern }).
 */
export const RESIDUE = {
  api: [
    /apps\/api/,
    /@repo\/api/,
    /FastAPI/i,
    /uvicorn/i,
    /\buv (sync|lock|run|add|remove)\b/,
    /astral\.sh\/uv/,
    /\bpytest\b/,
    /\bruff\b/i,
  ],
  web: [/apps\/web\b/, /@repo\/web/, /ci-web/, /\b5173\b/],
  desktop: [
    /electron/i,
    /apps\/desktop/,
    /@repo\/desktop/,
    /dist:desktop/,
    /ci-desktop/,
    /\b5174\b/,
  ],
  landing: [
    /apps\/landing/,
    /@repo\/landing/,
    /next-intl/,
    /Next\.js/,
    /next\.config/,
    /ci-landing/,
  ],
  graphql: [/graphql/i, /strawberry/i],
  websocket: [/websocket/i, /ws-client/],
  rest: [/PanelREST/, /\baxios\b/i],
  sqlite: [/sqlite/i],
  postgres: [/postgres/i, /psycopg/i, /docker compose/i, /docker-compose/, /db:up/, /db:down/],
  items: [/\/api\/items/, /ItemType/, /ItemSchema/, /ItemList/, /ItemCreate/, /demo items?/i],
  "db-layer": [/alembic/i, /db:(migrate|seed|setup|rollback)/, /sqlalchemy/i],
  "db-status": [/health\/databases/, /PanelDatabases/, /Databases panel/i],
  channels: [/CHANNELS\.md/],
  lib: [/@repo\/lib/, /packages\/lib/],
  ui: [/@repo\/ui/, /packages\/ui/],
  tailwind: [/tailwind/i],
  "dark-mode": [/zustand/i, /ThemeToggle/, /toggleTheme/, /useThemeStore/],
  "landing-demo": [/ConnectedSection/, /CONNECTED\.md/, /NEXT_PUBLIC_API_URL/],
  template: [/scaffold:(begin|end|line)/, /pnpm scaffold/, /scripts\/scaffold/, /SCAFFOLD\.md/],
};

export const RESIDUE_ALLOW = [];
