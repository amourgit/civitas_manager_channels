#!/usr/bin/env node
/**
 * CIVITAS Channel Manager — CLI Entry Point
 *
 * This is the primary executable entry point for the `civitas-channels` binary.
 * It handles:
 *
 *  • Fast-path shortcuts (--version, --help) so those commands remain instant
 *    even when the full CLI module is heavy to load.
 *  • CLI respawn logic for profile/container-switching.
 *  • Windows argv normalisation.
 *  • Process environment setup (encoding, gaxios compat, compile cache).
 *
 * The actual command tree lives in `src/cli/run-main.ts` and is loaded
 * lazily so that startup time is minimal for fast-path commands.
 *
 * Adapted from the OpenClaw entry.ts for CIVITAS Channel Manager.
 */

import { spawn } from "node:child_process";
import { enableCompileCache } from "node:module";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { isRootHelpInvocation, isRootVersionInvocation } from "./cli/argv.js";
import { applyCliProfileEnv, parseCliProfileArgs } from "./cli/profile.js";
import { normalizeWindowsArgv } from "./cli/windows-argv.js";
import { buildCliRespawnPlan } from "./entry.respawn.js";
import { isTruthyEnvValue, normalizeEnv } from "./infra/env.js";
import { isMainModule } from "./infra/is-main.js";
import { ensureCivitasExecMarkerOnProcess } from "./infra/civitas-exec-env.js";
import { installProcessWarningFilter } from "./infra/warning-filter.js";
import { attachChildProcessBridge } from "./process/child-process-bridge.js";

// ─── Wrapper/Entry Pair Config ────────────────────────────────────────────────
//
// Maps the public-facing launcher scripts to the compiled entry module.
// Used by `isMainModule` to correctly detect "run as main" when the process
// was started via a wrapper script rather than by pointing Node directly at
// this file.

const CIVITAS_ENTRY_WRAPPER_PAIRS = [
  { wrapperBasename: "civitas-channels.mjs", entryBasename: "civitas-channels.js" },
  { wrapperBasename: "civitas-channels.js",  entryBasename: "civitas-channels.js" },
  { wrapperBasename: "CIVITAS.mjs",          entryBasename: "civitas-channels.js" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns true if the `secrets audit` sub-command is being invoked.
 * The secrets audit command requires the auth store to be opened in
 * read-only mode to avoid accidental mutations during an audit run.
 */
function shouldForceReadOnlyAuthStore(argv: string[]): boolean {
  const tokens = argv.slice(2).filter((token) => token.length > 0 && !token.startsWith("-"));
  for (let index = 0; index < tokens.length - 1; index += 1) {
    if (tokens[index] === "secrets" && tokens[index + 1] === "audit") {
      return true;
    }
  }
  return false;
}

// ─── Guard: Only run when this IS the main module ─────────────────────────────

if (
  !isMainModule({
    currentFile: fileURLToPath(import.meta.url),
    wrapperEntryPairs: [...CIVITAS_ENTRY_WRAPPER_PAIRS],
  })
) {
  // Imported as a library dependency — skip all entry-point side effects.
} else {
  // ── Environment Setup ───────────────────────────────────────────────────────

  const { installGaxiosFetchCompat } = await import("./infra/gaxios-fetch-compat.js");

  await installGaxiosFetchCompat();
  process.title = "civitas-channels";
  ensureCivitasExecMarkerOnProcess();
  installProcessWarningFilter();
  normalizeEnv();

  // Enable the Node.js compile cache for faster cold starts in production.
  // This is best-effort and must never block startup.
  if (!isTruthyEnvValue(process.env.NODE_DISABLE_COMPILE_CACHE)) {
    try {
      enableCompileCache();
    } catch {
      // Silently skip — compile cache is a performance optimisation, not required.
    }
  }

  // Force read-only auth store for commands that must not mutate credentials.
  if (shouldForceReadOnlyAuthStore(process.argv)) {
    process.env.CIVITAS_AUTH_STORE_READONLY = "1";
  }

  // Respect --no-color flag consistently across the whole process tree.
  if (process.argv.includes("--no-color")) {
    process.env.NO_COLOR = "1";
    process.env.FORCE_COLOR = "0";
  }

  // ── Respawn Logic ───────────────────────────────────────────────────────────
  //
  // Some commands (e.g. --profile, --container) need to restart the process
  // with a different environment or binary. The respawn plan is built here
  // and if one exists the child is spawned and this process becomes a thin
  // wrapper that proxies stdio and forwards the exit code.

  function ensureCliRespawnReady(): boolean {
    const plan = buildCliRespawnPlan();
    if (!plan) {
      return false;
    }

    const child = spawn(process.execPath, plan.argv, {
      stdio: "inherit",
      env: plan.env,
    });

    attachChildProcessBridge(child);

    child.once("exit", (code, signal) => {
      if (signal) {
        process.exitCode = 1;
        return;
      }
      process.exit(code ?? 1);
    });

    child.once("error", (error) => {
      console.error(
        "[civitas] Failed to respawn CLI:",
        error instanceof Error ? (error.stack ?? error.message) : error,
      );
      process.exit(1);
    });

    // Parent process must not continue running the CLI after spawning.
    return true;
  }

  // ── Version Fast Path ───────────────────────────────────────────────────────
  //
  // Resolve `--version` / `-V` before loading Commander so that version
  // queries are near-instant even on cold starts.

  function tryHandleRootVersionFastPath(argv: string[]): boolean {
    if (!isRootVersionInvocation(argv)) {
      return false;
    }
    Promise.all([import("./version.js"), import("./infra/git-commit.js")])
      .then(([{ VERSION }, { resolveCommitHash }]) => {
        const commit = resolveCommitHash({ moduleUrl: import.meta.url });
        console.log(
          commit
            ? `CIVITAS Channel Manager ${VERSION} (${commit})`
            : `CIVITAS Channel Manager ${VERSION}`,
        );
        process.exit(0);
      })
      .catch((error) => {
        console.error(
          "[civitas] Failed to resolve version:",
          error instanceof Error ? (error.stack ?? error.message) : error,
        );
        process.exitCode = 1;
      });
    return true;
  }

  // ── Main Boot ───────────────────────────────────────────────────────────────

  process.argv = normalizeWindowsArgv(process.argv);

  if (!ensureCliRespawnReady()) {
    const parsed = parseCliProfileArgs(process.argv);
    if (!parsed.ok) {
      console.error(`[civitas] ${parsed.error}`);
      process.exit(2);
    }

    if (parsed.profile) {
      applyCliProfileEnv({ profile: parsed.profile });
      process.argv = parsed.argv;
    }

    if (!tryHandleRootVersionFastPath(process.argv)) {
      runMainOrRootHelp(process.argv);
    }
  }
}

// ─── Help Fast Path (exported for programmatic use) ──────────────────────────

/**
 * Attempt to handle `--help` / `-h` at the root level without booting the
 * full Commander tree. Returns `true` if the help was handled (and the
 * process will exit), `false` if the caller should continue with normal boot.
 */
export function tryHandleRootHelpFastPath(
  argv: string[],
  deps: {
    outputRootHelp?: () => void | Promise<void>;
    onError?: (error: unknown) => void;
  } = {},
): boolean {
  if (!isRootHelpInvocation(argv)) {
    return false;
  }

  const handleError =
    deps.onError ??
    ((error: unknown) => {
      console.error(
        "[civitas] Failed to display help:",
        error instanceof Error ? (error.stack ?? error.message) : error,
      );
      process.exitCode = 1;
    });

  if (deps.outputRootHelp) {
    Promise.resolve()
      .then(() => deps.outputRootHelp?.())
      .catch(handleError);
    return true;
  }

  import("./cli/root-help-metadata.js")
    .then(async ({ outputPrecomputedRootHelpText }) => {
      if (outputPrecomputedRootHelpText()) {
        return;
      }
      const { outputRootHelp } = await import("./cli/program/root-help.js");
      await outputRootHelp();
    })
    .catch(handleError);

  return true;
}

// ─── Internal Boot Helper ─────────────────────────────────────────────────────

function runMainOrRootHelp(argv: string[]): void {
  if (tryHandleRootHelpFastPath(argv)) {
    return;
  }
  import("./cli/run-main.js")
    .then(({ runCli }) => runCli(argv))
    .catch((error) => {
      console.error(
        "[civitas] Failed to start CLI:",
        error instanceof Error ? (error.stack ?? error.message) : error,
      );
      process.exitCode = 1;
    });
}
