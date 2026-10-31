// First-run setup for a fresh clone. Safe to run again: every step is idempotent.
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// pnpm and docker are .cmd shims on Windows and need a shell.
const shell = process.platform === "win32";

function log(message) {
  process.stdout.write(`\n==> ${message}\n`);
}

function fail(message) {
  process.stderr.write(`\nbootstrap failed: ${message}\n`);
  process.exit(1);
}

// scaffold:begin api
function succeeds(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: "ignore", shell });
  return result.status === 0;
}
// scaffold:end api

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit", shell });
  if (result.status !== 0) fail(`"${command} ${args.join(" ")}" exited with ${result.status}`);
}

// scaffold:begin api
log("Checking tools");
if (!succeeds("uv", ["--version"])) {
  fail("uv is not installed. Install it from https://docs.astral.sh/uv/ and run again.");
}
// scaffold:end api

log("JavaScript dependencies (pnpm install)");
run("pnpm", ["install"]);

// scaffold:begin api
log("Python dependencies (uv sync)");
run("uv", ["sync"], join(root, "apps", "api"));
// scaffold:end api

// scaffold:begin db-layer
log("Databases (migrations for every enabled and reachable database)");
run("pnpm", ["--filter", "@repo/api", "db:migrate"]);
// scaffold:end db-layer

log("Done. Start everything with: pnpm dev");
process.stdout.write("PostgreSQL is optional. To use it: pnpm db:up (see docs/DATABASES.md)\n"); // scaffold:line postgres
