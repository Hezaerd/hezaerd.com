import { readdirSync } from "node:fs";

const workspaceScopes = (dir) =>
  readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "refactor", "test", "chore", "perf", "ci", "build"],
    ],
    "scope-enum": [2, "always", [...workspaceScopes("apps"), ...workspaceScopes("packages")]],
  },
};
