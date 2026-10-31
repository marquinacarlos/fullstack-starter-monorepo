// Proves that every preset still produces a project that works.
// For each preset it copies the template to a temporary folder, runs the real `pnpm scaffold`
// there, then `pnpm check` and a smoke test of the API. It never touches this repository.
//
//   pnpm scaffold:verify                       every preset
//   pnpm scaffold:verify --preset web-only     some presets (comma separated)
//   pnpm scaffold:verify --quick               skip `pnpm check` (API lint and tests only)
//   pnpm scaffold:verify --docker              also apply a real PostgreSQL migration (needs Docker)
//   pnpm scaffold:verify --keep                keep the temporary folders
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { PRESETS, resolveRemoved } from "./features.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SHELL = process.platform === "win32";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? null : args[index + 1];
};

// ---- helpers ------------------------------------------------------------------------------

function copyTemplate(destination) {
  const listed = spawnSync("git", ["ls-files", "-co", "--exclude-standard", "-z"], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (listed.status !== 0)
    throw new Error("git ls-files failed: run this inside the template repository.");
  for (const rel of listed.stdout.split("\0").filter(Boolean)) {
    const source = path.join(ROOT, rel);
    if (!fs.existsSync(source)) continue; // tracked but deleted in the working tree
    const target = path.join(destination, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
  const git = (...gitArgs) =>
    spawnSync(
      "git",
      ["-c", "user.name=verify", "-c", "user.email=verify@example.com", ...gitArgs],
      {
        cwd: destination,
        stdio: "ignore",
      },
    );
  git("init", "-q");
  git("add", "-A");
  git("commit", "-q", "-m", "template");
}

function step(name, command, commandArgs, { cwd, log, env = {} }) {
  const started = Date.now();
  fs.appendFileSync(log, `\n$ ${command} ${commandArgs.join(" ")}\n`);
  const result = spawnSync(command, commandArgs, {
    cwd,
    shell: SHELL,
    encoding: "utf8",
    env: { ...process.env, ...env },
    maxBuffer: 256 * 1024 * 1024,
  });
  fs.appendFileSync(log, `${result.stdout ?? ""}${result.stderr ?? ""}`);
  return { name, ok: result.status === 0, ms: Date.now() - started };
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function waitFor(url, attempts = 60) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

function expect(problems, condition, message) {
  if (!condition) problems.push(message);
}

// ---- smoke test of the API ------------------------------------------------------------------

async function smokeApi(project, removed, log) {
  const started = Date.now();
  const problems = [];
  const apiDir = path.join(project, "apps", "api");
  const has = (name) => !removed.has(name);

  if (has("sqlite") || has("postgres")) {
    const migrate = step("migrate", "pnpm", ["db:migrate"], { cwd: project, log });
    expect(problems, migrate.ok, "pnpm db:migrate failed");
    if (has("items")) {
      const seed = step("seed", "pnpm", ["db:seed"], { cwd: project, log });
      expect(problems, seed.ok, "pnpm db:seed failed");
    }
  }

  const port = await freePort();
  const server = spawn("uv", ["run", "uvicorn", "app.main:app", "--port", String(port)], {
    cwd: apiDir,
    shell: SHELL,
    stdio: ["ignore", fs.openSync(log, "a"), fs.openSync(log, "a")],
  });
  const base = `http://127.0.0.1:${port}`;
  try {
    const up = await waitFor(`${base}/health`);
    expect(problems, up, "the API did not start");
    if (up) {
      const health = await (await fetch(`${base}/health`)).json();
      expect(problems, health.status === "ok", "/health is not ok");

      const graphql = await fetch(`${base}/graphql`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: "{ health }" }),
      });
      if (has("graphql")) {
        expect(problems, (await graphql.json()).data?.health === "ok", "GraphQL health is not ok");
        if (has("items")) {
          const items = await fetch(`${base}/graphql`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ query: "{ items { id } }" }),
          });
          expect(
            problems,
            (await items.json()).data?.items?.length === 3,
            "GraphQL items are not the 3 seeded",
          );
        }
      } else {
        expect(problems, graphql.status === 404, "GraphQL is removed but /graphql still answers");
      }

      const databases = await fetch(`${base}/health/databases`);
      if (has("db-status")) {
        const names = (await databases.json()).databases.map((db) => db.name).sort();
        const wanted = ["postgres", "sqlite"].filter((db) => has(db));
        expect(
          problems,
          names.join() === wanted.join(),
          `database list is ${names}, wanted ${wanted}`,
        );
      } else {
        expect(problems, databases.status === 404, "/health/databases should not exist");
      }

      const items = await fetch(`${base}/api/items`);
      if (has("items-rest")) {
        expect(problems, (await items.json()).length === 3, "REST items are not the 3 seeded");
      } else {
        expect(problems, items.status === 404, "/api/items should not exist");
      }

      if (has("websocket")) {
        const echoed = await new Promise((resolve) => {
          const socket = new WebSocket(`ws://127.0.0.1:${port}/ws`);
          const timer = setTimeout(() => resolve(false), 5000);
          socket.onopen = () => socket.send("ping");
          socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === "echo" && message.value === "ping") {
              clearTimeout(timer);
              socket.close();
              resolve(true);
            }
          };
          socket.onerror = () => resolve(false);
        });
        expect(problems, echoed, "WebSocket did not echo");
      }
    }
  } finally {
    server.kill();
  }
  for (const problem of problems) fs.appendFileSync(log, `SMOKE PROBLEM: ${problem}\n`);
  return { name: "api smoke", ok: problems.length === 0, ms: Date.now() - started, problems };
}

// ---- PostgreSQL with a real migration (Docker) -------------------------------------------------

async function postgresMigration(project, log) {
  const started = Date.now();
  const problems = [];
  const apiDir = path.join(project, "apps", "api");
  const compose = ["compose", "-p", "scaffold-verify"];

  const busy = await new Promise((resolve) => {
    const probe = net.connect(5432, "127.0.0.1");
    probe.once("connect", () => (probe.destroy(), resolve(true)));
    probe.once("error", () => resolve(false));
  });
  if (busy) {
    fs.appendFileSync(log, "port 5432 is busy\n");
    return {
      name: "postgres migration",
      ok: false,
      ms: 0,
      problems: ["port 5432 is busy: run `pnpm db:down` first"],
    };
  }

  fs.writeFileSync(
    path.join(apiDir, "app", "models", "postgres", "note.py"),
    `from sqlalchemy.orm import Mapped, mapped_column

from app.db.databases import postgres_db


class Note(postgres_db.Base):
    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(primary_key=True)
    body: Mapped[str] = mapped_column()
`,
  );
  fs.appendFileSync(
    path.join(apiDir, "app", "models", "postgres", "__init__.py"),
    "from app.models.postgres.note import Note  # noqa: F401\n",
  );
  fs.writeFileSync(
    path.join(apiDir, "app", "seeds", "postgres.py"),
    `from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.postgres.note import Note


def seed(session: Session) -> int:
    if session.scalars(select(Note)).first():
        return 0
    session.add(Note(body="hello"))
    session.commit()
    return 1
`,
  );

  const sh = (name, command, commandArgs, cwd = project) => {
    const result = step(name, command, commandArgs, { cwd, log });
    expect(problems, result.ok, `${name} failed`);
    return result.ok;
  };
  const count = () => {
    const result = spawnSync(
      "uv",
      [
        "run",
        "python",
        "-c",
        "from app.db.databases import postgres_db as d; from sqlalchemy import inspect; print(','.join(sorted(inspect(d.engine).get_table_names())))",
      ],
      { cwd: apiDir, shell: SHELL, encoding: "utf8" },
    );
    return (result.stdout ?? "").trim();
  };

  try {
    if (!sh("docker up", "docker", [...compose, "up", "-d", "--wait", "db"])) return finishPg();
    if (
      !sh(
        "autogenerate",
        "uv",
        ["run", "alembic", "-n", "postgres", "revision", "--autogenerate", "-m", "create notes"],
        apiDir,
      )
    )
      return finishPg();
    sh("db:migrate", "pnpm", ["db:migrate"]);
    expect(
      problems,
      count().split(",").includes("notes"),
      "table notes was not created by the migration",
    );
    sh("db:seed", "pnpm", ["db:seed"]);
    sh("db:seed again", "pnpm", ["db:seed"]);
    const rows = spawnSync(
      "uv",
      [
        "run",
        "python",
        "-c",
        "from app.db.databases import postgres_db as d; from sqlalchemy import text; print(d.engine.connect().execute(text('select count(*) from notes')).scalar())",
      ],
      { cwd: apiDir, shell: SHELL, encoding: "utf8" },
    );
    expect(
      problems,
      (rows.stdout ?? "").trim() === "1",
      "the seed is not idempotent (expected 1 row)",
    );
    sh("db:rollback", "uv", ["run", "alembic", "-n", "postgres", "downgrade", "-1"], apiDir);
    expect(problems, !count().split(",").includes("notes"), "rollback did not drop the table");
  } finally {
    step("docker down", "docker", [...compose, "down", "-v"], { cwd: project, log });
  }
  return finishPg();

  function finishPg() {
    return {
      name: "postgres migration",
      ok: problems.length === 0,
      ms: Date.now() - started,
      problems,
    };
  }
}

// ---- one preset ---------------------------------------------------------------------------------

async function verifyPreset(name, base) {
  const preset = PRESETS[name];
  if (!preset) throw new Error(`Unknown preset "${name}".`);
  const removed = resolveRemoved(preset.without, { template: true });
  const project = path.join(base, name);
  const log = path.join(base, `${name}.log`);
  fs.mkdirSync(project, { recursive: true });
  fs.writeFileSync(log, "");

  const steps = [];
  const record = (result) => {
    steps.push(result);
    process.stdout.write(
      `  ${result.ok ? "ok  " : "FAIL"} ${result.name} (${Math.round(result.ms / 1000)}s)\n`,
    );
    return result.ok;
  };

  console.log(`\n== ${name}: ${preset.label}`);
  copyTemplate(project);

  const scaffold = step(
    "scaffold",
    "node",
    ["scripts/scaffold/index.mjs", "--preset", name, "--yes"],
    { cwd: project, log },
  );
  if (!record(scaffold)) return { name, steps, log };

  if (flag("quick")) {
    if (!removed.has("api")) {
      record(
        step("api lint and tests", "pnpm", ["--filter", "@repo/api", "lint"], {
          cwd: project,
          log,
        }),
      );
      record(step("api tests", "pnpm", ["--filter", "@repo/api", "test"], { cwd: project, log }));
    }
  } else {
    record(step("pnpm check", "pnpm", ["check"], { cwd: project, log }));
  }

  if (!removed.has("api")) {
    record(await smokeApi(project, removed, log));
    if (flag("docker") && !removed.has("postgres")) record(await postgresMigration(project, log));
  }
  return { name, steps, log };
}

// ---- main -----------------------------------------------------------------------------------------

const selected = (option("preset") ?? Object.keys(PRESETS).join(",")).split(",").filter(Boolean);
const base = fs.mkdtempSync(path.join(os.tmpdir(), "scaffold-verify-"));
console.log(`Working in ${base} (your repository is not touched).`);

const outcomes = [];
for (const name of selected) outcomes.push(await verifyPreset(name, base));

console.log("\nSummary");
let failed = 0;
for (const outcome of outcomes) {
  const bad = outcome.steps.filter((s) => !s.ok);
  failed += bad.length > 0 ? 1 : 0;
  console.log(
    `  ${bad.length === 0 ? "PASS" : "FAIL"}  ${outcome.name}${bad.length ? `  -> ${bad.map((s) => s.name).join(", ")}  (log: ${outcome.log})` : ""}`,
  );
  for (const s of bad) for (const problem of s.problems ?? []) console.log(`        ${problem}`);
}

if (!flag("keep") && failed === 0) fs.rmSync(base, { recursive: true, force: true });
else console.log(`\nKept ${base} for inspection.`);
process.exit(failed === 0 ? 0 : 1);
