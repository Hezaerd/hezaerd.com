import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const LEAKED_REACT_REQUIRE = /__require\(["']react["']\)/g;

function walkMjsFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMjsFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".mjs")) {
      files.push(fullPath);
    }
  }
  return files;
}

function findReactProvider(serverRoot: string): { file: string; exportName: string } | null {
  for (const file of walkMjsFiles(path.join(serverRoot, "_libs"))) {
    const code = readFileSync(file, "utf8");
    const match = code.match(/require_react as (\w+)/);
    if (match) {
      return { file, exportName: match[1]! };
    }
  }

  return null;
}

function toImportPath(fromFile: string, toFile: string) {
  const relative = path.relative(path.dirname(fromFile), toFile).replace(/\\/g, "/");
  return relative.startsWith(".") ? relative : `./${relative}`;
}

export function patchServerOutput(cwd: string) {
  const serverRoot = path.resolve(cwd, ".output/server");
  if (!existsSync(serverRoot)) return 0;

  const libsDir = path.join(serverRoot, "_libs");
  if (!existsSync(libsDir)) return 0;

  const reactProvider = findReactProvider(serverRoot);
  if (!reactProvider) return 0;

  let patched = 0;
  for (const file of walkMjsFiles(serverRoot)) {
    let code = readFileSync(file, "utf8");
    if (!LEAKED_REACT_REQUIRE.test(code)) continue;
    LEAKED_REACT_REQUIRE.lastIndex = 0;

    const sameChunkMatch = code.match(/\brequire_react(?:\$\d+)?\b/);
    if (sameChunkMatch) {
      code = code.replaceAll(LEAKED_REACT_REQUIRE, `${sameChunkMatch[0]}()`);
    } else {
      const importPath = toImportPath(file, reactProvider.file);
      const importLine = `import { ${reactProvider.exportName} as require_react } from "${importPath}";\n`;
      if (!code.includes(importLine.trim())) {
        code = importLine + code;
      }
      code = code.replaceAll(LEAKED_REACT_REQUIRE, "require_react()");
    }

    writeFileSync(file, code);
    patched += 1;
  }

  return patched;
}

if (import.meta.main) {
  const patched = patchServerOutput(process.cwd());
  if (patched > 0) {
    console.log(`[patch-ssr-react-require] patched ${patched} SSR chunk(s)`);
  }
}
