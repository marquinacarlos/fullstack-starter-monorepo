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

function succeeds(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: "ignore", shell });
  return result.status === 0;
}

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit", shell });
  if (result.status !== 0) fail(`"${command} ${args.join(" ")}" exited with ${result.status}`);
}

log("Checking tools");
if (!succeeds("uv", ["--version"])) {
  fail("uv is not installed. Install it from https://docs.astral.sh/uv/ and run again.");
}
if (!succeeds("docker", ["info"])) {
  fail("Docker is not running. Start Docker Desktop and run again.");
}

log("JavaScript dependencies (pnpm install)");
run("pnpm", ["install"]);

log("Python dependencies (uv sync)");
run("uv", ["sync"], join(root, "apps", "api"));

log("PostgreSQL (docker compose up)");
run("docker", ["compose", "up", "-d", "--wait", "db"]);

log("Database migrations (alembic)");
run("pnpm", ["--filter", "@repo/api", "migrate"]);

log("Done. Start everything with: pnpm dev");
