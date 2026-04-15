import fs from "node:fs";
import path from "node:path";
import { defineConfig, type UserConfig } from "tsdown";
import {
  listBundledPluginBuildEntries,
  listBundledPluginRuntimeDependencies,
} from "./scripts/lib/bundled-plugin-build-entries.mjs";
import { buildPluginSdkEntrySources } from "./scripts/lib/plugin-sdk-entries.mjs";

// ─────────────────────────────────────────────────────────────────────────────
// CIVITAS Channel Manager — tsdown build config
//
// Scope: channel management + routing gateway + plugin-sdk only.
// Excluded: agents/AI, auto-reply, canvas, TTS, image/video generation,
//           realtime voice/transcription, ACP, context-engine, MCP tools serve.
// ─────────────────────────────────────────────────────────────────────────────

type InputOptionsFactory = Extract<NonNullable<UserConfig["inputOptions"]>, Function>;
type InputOptionsArg = InputOptionsFactory extends (
  options: infer Options,
  format: infer _Format,
  context: infer _Context,
) => infer _Return
  ? Options
  : never;
type InputOptionsReturn = InputOptionsFactory extends (
  options: infer _Options,
  format: infer _Format,
  context: infer _Context,
) => infer Return
  ? Return
  : never;
type OnLogFunction = InputOptionsArg extends { onLog?: infer OnLog } ? NonNullable<OnLog> : never;

const env = {
  NODE_ENV: "production",
};

const SUPPRESSED_EVAL_WARNING_PATHS = [
  "@protobufjs/inquire/index.js",
  "bottleneck/lib/IORedisConnection.js",
  "bottleneck/lib/RedisConnection.js",
] as const;

function normalizedLogHaystack(log: { message?: string; id?: string; importer?: string }): string {
  return [log.message, log.id, log.importer].filter(Boolean).join("\n").replaceAll("\\", "/");
}

function buildInputOptions(options: InputOptionsArg): InputOptionsReturn {
  if (process.env.OPENCLAW_BUILD_VERBOSE === "1") {
    return undefined;
  }

  const previousOnLog = typeof options.onLog === "function" ? options.onLog : undefined;

  function isSuppressedLog(log: {
    code?: string;
    message?: string;
    id?: string;
    importer?: string;
  }) {
    if (log.code === "PLUGIN_TIMINGS") {
      return true;
    }
    if (log.code === "UNRESOLVED_IMPORT") {
      return normalizedLogHaystack(log).includes("extensions/");
    }
    if (log.code !== "EVAL") {
      return false;
    }
    const haystack = normalizedLogHaystack(log);
    return SUPPRESSED_EVAL_WARNING_PATHS.some((path) => haystack.includes(path));
  }

  return {
    ...options,
    onLog(...args: Parameters<OnLogFunction>) {
      const [level, log, defaultHandler] = args;
      if (isSuppressedLog(log)) {
        return;
      }
      if (typeof previousOnLog === "function") {
        previousOnLog(level, log, defaultHandler);
        return;
      }
      defaultHandler(level, log);
    },
  };
}

function nodeBuildConfig(config: UserConfig): UserConfig {
  return {
    ...config,
    env,
    fixedExtension: false,
    platform: "node",
    inputOptions: buildInputOptions,
  };
}

const bundledPluginBuildEntries = listBundledPluginBuildEntries();
const bundledPluginRuntimeDependencies = listBundledPluginRuntimeDependencies();

/**
 * Build bundled hook entries — only hooks relevant to channel management.
 * Excludes AI/LLM hooks (llm-slug-generator) which depend on agent stack.
 */
function buildBundledHookEntries(): Record<string, string> {
  const hooksRoot = path.join(process.cwd(), "src", "hooks", "bundled");
  const entries: Record<string, string> = {};

  if (!fs.existsSync(hooksRoot)) {
    return entries;
  }

  for (const dirent of fs.readdirSync(hooksRoot, { withFileTypes: true })) {
    if (!dirent.isDirectory()) {
      continue;
    }

    const hookName = dirent.name;
    const handlerPath = path.join(hooksRoot, hookName, "handler.ts");
    if (!fs.existsSync(handlerPath)) {
      continue;
    }

    entries[`bundled/${hookName}/handler`] = handlerPath;
  }

  return entries;
}

const bundledHookEntries = buildBundledHookEntries();
const bundledPluginRoot = (pluginId: string) => ["extensions", pluginId].join("/");
const bundledPluginFile = (pluginId: string, relativePath: string) =>
  `${bundledPluginRoot(pluginId)}/${relativePath}`;

const explicitNeverBundleDependencies = [
  "@lancedb/lancedb",
  "@matrix-org/matrix-sdk-crypto-nodejs",
  "matrix-js-sdk",
  ...bundledPluginRuntimeDependencies,
].toSorted((left, right) => left.localeCompare(right));

function shouldNeverBundleDependency(id: string): boolean {
  return explicitNeverBundleDependencies.some((dependency) => {
    return id === dependency || id.startsWith(`${dependency}/`);
  });
}

/**
 * Core channel manager entries.
 *
 * Included:
 *   - index / entry / library: main public API surfaces
 *   - cli: command-line interface (channels setup, config, status)
 *   - channels: channel management core
 *   - config: configuration engine
 *   - routing: message routing to external gateway
 *   - plugin-sdk: extension contract surfaces
 *   - plugins: plugin registry, activation, public surface
 *   - infra: shared infrastructure (file-read, warning-filter)
 *   - facade-activation-check: plugin activation boundary
 *   - telegram/token+audit: channel-level utilities (lightweight, no AI)
 *
 * Excluded vs openclaw full build:
 *   - agents/* (AI model selection, pi-model-discovery, subagent-registry)
 *   - commands/status.summary.runtime (agent status — not channel concern)
 *   - cli/daemon-cli (daemon lifecycle — not needed for pure channel mgr)
 *   - extensionAPI (agent extension API)
 *   - mcp/plugin-tools-serve (MCP AI tools server)
 *   - plugins/runtime/index (agent plugin runtime)
 *   - llm-slug-generator hook (LLM dependent)
 */
function buildCoreDistEntries(): Record<string, string> {
  const entries: Record<string, string> = {
    // Public API
    index: "src/index.ts",
    entry: "src/entry.ts",
    library: "src/library.ts",

    // Plugin SDK — full public surface
    "facade-activation-check.runtime": "src/plugin-sdk/facade-activation-check.runtime.ts",
    "plugins/provider-discovery.runtime": "src/plugins/provider-discovery.runtime.ts",
    "plugins/provider-runtime.runtime": "src/plugins/provider-runtime.runtime.ts",
    "plugins/public-surface-runtime": "src/plugins/public-surface-runtime.ts",
    "plugins/sdk-alias": "src/plugins/sdk-alias.ts",
    "plugins/build-smoke-entry": "src/plugins/build-smoke-entry.ts",

    // Infrastructure
    "infra/boundary-file-read": "src/infra/boundary-file-read.ts",
    "infra/warning-filter": "src/infra/warning-filter.ts",
  };

  // Telegram channel utilities (token + audit) — lightweight, no AI dependency
  const telegramToken = bundledPluginFile("telegram", "src/token.ts");
  const telegramAudit = bundledPluginFile("telegram", "src/audit.ts");
  if (fs.existsSync(telegramToken)) {
    entries["telegram/token"] = telegramToken;
  }
  if (fs.existsSync(telegramAudit)) {
    entries["telegram/audit"] = telegramAudit;
  }

  return entries;
}

const coreDistEntries = buildCoreDistEntries();

function buildUnifiedDistEntries(): Record<string, string> {
  return {
    ...coreDistEntries,
    // Internal compat artifact for the root-alias.cjs lazy loader.
    "plugin-sdk/compat": "src/plugin-sdk/compat.ts",
    ...Object.fromEntries(
      Object.entries(buildPluginSdkEntrySources()).map(([entry, source]) => [
        `plugin-sdk/${entry}`,
        source,
      ]),
    ),
    // All channel extension plugins (telegram, slack, discord, whatsapp, etc.)
    ...bundledPluginBuildEntries,
    // Channel-level hooks only
    ...bundledHookEntries,
  };
}

export default defineConfig([
  nodeBuildConfig({
    entry: buildUnifiedDistEntries(),
    deps: {
      neverBundle: shouldNeverBundleDependency,
    },
  }),
]);
