// `pnpm scaffold`: turns this template into your project by removing what you do not need.
// Plain Node, no dependencies. Read docs/SCAFFOLD.md before changing it.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";

import {
  apply,
  finish,
  isScaffoldFile,
  listFiles,
  plan,
  processMarkers,
  readText,
} from "./engine.mjs";
import { FEATURES, PRESETS, USER_FEATURES, resolveRemoved } from "./features.mjs";
import { formatFindings, scan } from "./scan.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const HELP = `pnpm scaffold [options]

Removes what your project does not need. With no options it asks questions.

  --preset <name>     use a ready-made answer (see --list)
  --without a,b,c     remove these options (see --list)
  --dry-run           show what would change and touch nothing
  --yes               do not ask for confirmation
  --no-install        skip pnpm install, uv lock and formatting
  --force             skip the clean git tree check
  --check             only validate the markers of the template
  --list              show presets and options
`;

function parseArguments(argv) {
  const options = { without: null, preset: null, flags: new Set() };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--preset") options.preset = argv[++i];
    else if (arg === "--without") options.without = (argv[++i] ?? "").split(",").filter(Boolean);
    else if (arg.startsWith("--")) options.flags.add(arg.slice(2));
    else throw new Error(`Unknown argument "${arg}". Try --help.`);
  }
  return options;
}

function printList() {
  console.log("Presets:");
  for (const [name, preset] of Object.entries(PRESETS)) {
    console.log(`  ${name.padEnd(18)} ${preset.label}`);
  }
  console.log("\nOptions for --without:");
  for (const name of USER_FEATURES) console.log(`  ${name.padEnd(14)} ${FEATURES[name].label}`);
  console.log(
    "\nThe CLI also removes what depends on your choices (for example no API removes its databases).",
  );
}

async function ask(rl, question, fallback = true) {
  const answer = (await rl.question(`${question} ${fallback ? "[Y/n]" : "[y/N]"} `))
    .trim()
    .toLowerCase();
  if (answer === "") return fallback;
  return answer.startsWith("y") || answer === "s" || answer === "si";
}

/** Asks what to keep. Returns the list of removed options. */
async function interview() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const removed = new Set();
  const keep = async (name, question) => {
    const kept = await ask(rl, question);
    if (!kept) removed.add(name);
    return kept;
  };
  try {
    console.log("\nAnswer what your project will KEEP (Enter = yes).\n");
    const api = await keep("api", "API (FastAPI)?");
    await keep("web", "Web app (React + Vite)?");
    await keep("desktop", "Desktop app (Electron)?");
    const landing = await keep("landing", "Next app (static export)?");

    if (api) {
      console.log("");
      await keep("rest", "REST channel (items, database status)?");
      await keep("graphql", "GraphQL channel?");
      await keep("websocket", "WebSocket channel?");
      console.log("");
      const sqlite = await keep("sqlite", "SQLite database?");
      await keep("postgres", "PostgreSQL database?");
      if (sqlite) await keep("items", "Demo items (model, seed, panels)?");
    }
    if (landing && api) await keep("landing-demo", "Live demo section in the Next app?");
    console.log("");
    await keep("dark-mode", "Dark mode toggle?");
  } finally {
    rl.close();
  }
  return [...removed];
}

function git(args) {
  return spawnSync("git", args, { cwd: ROOT, encoding: "utf8" });
}

function assertCleanTree() {
  const status = git(["status", "--porcelain"]);
  if (status.status !== 0) {
    throw new Error(
      "This folder is not a git repository. Run `git init` and commit first, or use --force.",
    );
  }
  if (status.stdout.trim() !== "") {
    throw new Error(
      "The git tree has uncommitted changes. Commit or stash them first (or use --force).",
    );
  }
}

/** Every marker of the template must be balanced and name a known feature. */
export function checkMarkers(root = ROOT) {
  let count = 0;
  for (const rel of listFiles(root)) {
    if (isScaffoldFile(rel)) continue;
    const text = readText(root, rel);
    if (text?.includes("scaffold:")) {
      processMarkers(text, new Set(), rel);
      count += 1;
    }
  }
  return count;
}

function summarize(changes) {
  console.log(`\nWill delete ${changes.deletes.length} path(s):`);
  for (const rel of changes.deletes) console.log(`  - ${rel}`);
  const edited = [...changes.files.keys()].sort();
  console.log(`\nWill edit or create ${edited.length} file(s):`);
  for (const rel of edited) console.log(`  ~ ${rel}`);
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const { flags } = options;

  if (flags.has("help")) return console.log(HELP);
  if (flags.has("list")) return printList();
  if (flags.has("check")) {
    console.log(`Markers OK in ${checkMarkers()} file(s).`);
    return undefined;
  }

  let chosen;
  if (options.preset) {
    const preset = PRESETS[options.preset];
    if (!preset) throw new Error(`Unknown preset "${options.preset}". Try --list.`);
    chosen = [...preset.without];
  } else if (options.without) {
    chosen = options.without;
  } else if (process.stdin.isTTY) {
    chosen = await interview();
  } else {
    throw new Error("No terminal to ask questions. Use --preset or --without (see --help).");
  }

  const dryRun = flags.has("dry-run");
  if (!dryRun && !flags.has("force")) assertCleanTree();

  const removed = resolveRemoved(chosen, { template: true });
  const changes = plan(ROOT, removed);

  const kept = USER_FEATURES.filter((name) => !removed.has(name));
  console.log(`\nKeeps:    ${kept.join(", ") || "(nothing optional)"}`);
  console.log(
    `Removes:  ${[...removed].filter((name) => name !== "template").join(", ") || "(nothing)"}`,
  );
  summarize(changes);

  if (dryRun) {
    console.log("\nDry run: nothing was changed.");
    return undefined;
  }

  if (!flags.has("yes")) {
    if (!process.stdin.isTTY) throw new Error("Confirmation needed. Pass --yes to apply.");
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const go = await ask(rl, "\nApply these changes?", false);
    rl.close();
    if (!go) return console.log("Nothing changed.");
  }

  apply(ROOT, changes);
  console.log("\nChanges written.");
  if (!flags.has("no-install")) finish(ROOT, changes, (line) => console.log(line));

  const findings = scan(ROOT, removed);
  if (findings.length > 0) {
    console.error(
      `\nLeftovers found (${findings.length}). They mention something that was removed:`,
    );
    console.error(formatFindings(findings));
    process.exitCode = 1;
    return undefined;
  }
  console.log("\nNo leftovers found. Next: review the changes, run `pnpm check`, then commit.");
  return undefined;
}

main().catch((error) => {
  console.error(`\nscaffold: ${error.message}`);
  process.exit(1);
});
