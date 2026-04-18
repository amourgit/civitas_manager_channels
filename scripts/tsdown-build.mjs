#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { BUNDLED_PLUGIN_PATH_PREFIX } from "./lib/bundled-plugin-paths.mjs";

const logLevel = process.env.OPENCLAW_BUILD_VERBOSE ? "info" : "warn";
const extraArgs = process.argv.slice(2);
const INEFFECTIVE_DYNAMIC_IMPORT_RE = /\[INEFFECTIVE_DYNAMIC_IMPORT\]/;
const UNRESOLVED_IMPORT_RE = /\[UNRESOLVED_IMPORT\]/;
const ANSI_ESCAPE_RE = new RegExp(String.raw`\u001B\[[0-9;]*m`, "g");

function removeDistPluginNodeModulesSymlinks(rootDir) {
  const extensionsDir = path.join(rootDir, "extensions");
  if (!fs.existsSync(extensionsDir)) {
    return;
  }

  for (const dirent of fs.readdirSync(extensionsDir, { withFileTypes: true })) {
    if (!dirent.isDirectory()) {
      continue;
    }
    const nodeModulesPath = path.join(extensionsDir, dirent.name, "node_modules");
    try {
      if (fs.lstatSync(nodeModulesPath).isSymbolicLink()) {
        fs.rmSync(nodeModulesPath, { force: true, recursive: true });
      }
    } catch {
      // Skip missing or unreadable paths so the build can proceed.
    }
  }
}

function pruneStaleRuntimeSymlinks() {
  const cwd = process.cwd();
  // runtime-postbuild stages plugin-owned node_modules into dist/ and links the
  // dist-runtime overlay back to that tree. Remove only those symlinks up front
  // so tsdown's clean step cannot traverse stale runtime overlays on rebuilds.
  removeDistPluginNodeModulesSymlinks(path.join(cwd, "dist"));
  removeDistPluginNodeModulesSymlinks(path.join(cwd, "dist-runtime"));
}

pruneStaleRuntimeSymlinks();

// npm package imports that are intentionally external (neverBundle) and not installed
// in this channel-manager scope. These produce warnings but are not fatal.
const EXTERNAL_NPM_PACKAGE_PREFIXES = [
  "openclaw/plugin-sdk",   // plugin-sdk subpath — resolved at runtime via package alias
  "@anthropic-ai/",        // Anthropic SDK — agent-stack only
  "@mariozechner/",        // Pi agent runtime — agent-stack only
  "openai",                // OpenAI SDK — agent-stack only
  "https-proxy-agent",     // proxy agent — optional infra dep
];

function isExternalNpmPackage(line) {
  // Extract the module specifier from the warning line
  const match = line.match(/Could not resolve '([^']+)'/);
  if (!match) return false;
  const specifier = match[1];
  // Bare npm package: no leading ./ or ../ — treat as external
  if (!specifier.startsWith(".") && !specifier.startsWith("/")) {
    return EXTERNAL_NPM_PACKAGE_PREFIXES.some((prefix) => specifier.startsWith(prefix)) ||
      // Any bare package specifier is an npm dep — not a fatal source-level issue
      !specifier.includes("/") || specifier.startsWith("@");
  }
  return false;
}

function findFatalUnresolvedImport(lines) {
  for (const line of lines) {
    if (!UNRESOLVED_IMPORT_RE.test(line)) {
      continue;
    }

    const normalizedLine = line.replace(ANSI_ESCAPE_RE, "");
    if (
      !normalizedLine.includes(BUNDLED_PLUGIN_PATH_PREFIX) &&
      !normalizedLine.includes("node_modules/") &&
      !isExternalNpmPackage(normalizedLine)
    ) {
      return normalizedLine;
    }
  }

  return null;
}

const result = spawnSync(
  "pnpm",
  ["exec", "tsdown", "--config-loader", "unrun", "--logLevel", logLevel, ...extraArgs],
  {
    encoding: "utf8",
    stdio: "pipe",
    shell: process.platform === "win32",
  },
);

const stdout = result.stdout ?? "";
const stderr = result.stderr ?? "";
if (stdout) {
  process.stdout.write(stdout);
}
if (stderr) {
  process.stderr.write(stderr);
}

if (result.status === 0 && INEFFECTIVE_DYNAMIC_IMPORT_RE.test(`${stdout}\n${stderr}`)) {
  console.error(
    "Build emitted [INEFFECTIVE_DYNAMIC_IMPORT]. Replace transparent runtime re-export facades with real runtime boundaries.",
  );
  process.exit(1);
}

const fatalUnresolvedImport =
  result.status === 0 ? findFatalUnresolvedImport(`${stdout}\n${stderr}`.split("\n")) : null;

if (fatalUnresolvedImport) {
  console.error(`Build emitted [UNRESOLVED_IMPORT] outside extensions: ${fatalUnresolvedImport}`);
  process.exit(1);
}

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
