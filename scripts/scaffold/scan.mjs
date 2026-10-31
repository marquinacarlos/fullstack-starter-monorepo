// Residue scanner: after pruning, nothing may still talk about what was removed.
import { RESIDUE, RESIDUE_ALLOW } from "./features.mjs";
import { listFiles, readText } from "./engine.mjs";

/**
 * @param {string} root project folder
 * @param {Set<string>} removed removed features (derived ones included)
 * @returns {{ file: string, line: number, feature: string, text: string }[]}
 */
export function scan(root, removed) {
  const rules = [...removed].flatMap((feature) =>
    (RESIDUE[feature] ?? []).map((pattern) => ({ feature, pattern })),
  );
  const findings = [];
  for (const file of listFiles(root)) {
    const text = readText(root, file);
    if (text === null) continue;
    text.split("\n").forEach((content, index) => {
      for (const { feature, pattern } of rules) {
        if (!pattern.test(content)) continue;
        const allowed = RESIDUE_ALLOW.some(
          (rule) => rule.pattern.test(content) && rule.file.test(file),
        );
        if (!allowed) findings.push({ file, line: index + 1, feature, text: content.trim() });
      }
    });
  }
  return findings;
}

export function formatFindings(findings) {
  return findings
    .map((f) => `  ${f.file}:${f.line}  [${f.feature}]  ${f.text.slice(0, 110)}`)
    .join("\n");
}
