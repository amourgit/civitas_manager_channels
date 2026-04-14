#!/usr/bin/env node
/**
 * CIVITAS Channel Manager — Main Entry Point
 *
 * Dual-mode module:
 *
 *   • When executed directly (`node dist/index.js`), it acts as the CLI
 *     entry point: boots the channels CLI via the `run-main` pathway.
 *
 *   • When imported as a library (`import { loadConfig } from 'civitas-manager-channels'`),
 *     it lazily hydrates the public API surface from `./library.js` so that
 *     tree-shaking and startup time are preserved for library consumers.
 *
 * The split between "run as main" and "imported as lib" is implemented with
 * `isMainModule` to avoid double-initialisation when bundlers import this
 * file as a shared dependency while `dist/civitas-channels.js` is the real
 * entry point.
 *
 * Adapted from the OpenClaw index.ts for CIVITAS Channel Manager.
 */

import process from "node:process";
import { fileURLToPath } from "node:url";
import { formatUncaughtError } from "./infra/errors.js";
import { isMainModule } from "./infra/is-main.js";
import { installUnhandledRejectionHandler } from "./infra/unhandled-rejections.js";

// ─── Library Consumer API ─────────────────────────────────────────────────────
//
// These bindings are populated only for library consumers.
// The CLI entry stays on the lean path and must not read them while running
// as main.

type LibraryExports = typeof import("./library.js");

/** @see {@link import("./library.js").getReplyFromConfig} */
export let getReplyFromConfig: LibraryExports["getReplyFromConfig"];
/** @see {@link import("./library.js").applyTemplate} */
export let applyTemplate: LibraryExports["applyTemplate"];
/** @see {@link import("./library.js").createDefaultDeps} */
export let createDefaultDeps: LibraryExports["createDefaultDeps"];
/** @see {@link import("./library.js").deriveSessionKey} */
export let deriveSessionKey: LibraryExports["deriveSessionKey"];
/** @see {@link import("./library.js").describePortOwner} */
export let describePortOwner: LibraryExports["describePortOwner"];
/** @see {@link import("./library.js").ensureBinary} */
export let ensureBinary: LibraryExports["ensureBinary"];
/** @see {@link import("./library.js").ensurePortAvailable} */
export let ensurePortAvailable: LibraryExports["ensurePortAvailable"];
/** @see {@link import("./library.js").handlePortError} */
export let handlePortError: LibraryExports["handlePortError"];
/** @see {@link import("./library.js").loadConfig} */
export let loadConfig: LibraryExports["loadConfig"];
/** @see {@link import("./library.js").loadSessionStore} */
export let loadSessionStore: LibraryExports["loadSessionStore"];
/** @see {@link import("./library.js").monitorWebChannel} */
export let monitorWebChannel: LibraryExports["monitorWebChannel"];
/** @see {@link import("./library.js").normalizeE164} */
export let normalizeE164: LibraryExports["normalizeE164"];
/** @see {@link import("./library.js").PortInUseError} */
export let PortInUseError: LibraryExports["PortInUseError"];
/** @see {@link import("./library.js").promptYesNo} */
export let promptYesNo: LibraryExports["promptYesNo"];
/** @see {@link import("./library.js").resolveSessionKey} */
export let resolveSessionKey: LibraryExports["resolveSessionKey"];
/** @see {@link import("./library.js").resolveStorePath} */
export let resolveStorePath: LibraryExports["resolveStorePath"];
/** @see {@link import("./library.js").runCommandWithTimeout} */
export let runCommandWithTimeout: LibraryExports["runCommandWithTimeout"];
/** @see {@link import("./library.js").runExec} */
export let runExec: LibraryExports["runExec"];
/** @see {@link import("./library.js").saveSessionStore} */
export let saveSessionStore: LibraryExports["saveSessionStore"];
/** @see {@link import("./library.js").waitForever} */
export let waitForever: LibraryExports["waitForever"];

// ─── CLI Deps Loader ──────────────────────────────────────────────────────────

type CliDeps = {
  installGaxiosFetchCompat: () => Promise<void>;
  runCli: (argv: string[]) => Promise<void>;
};

async function loadCliDeps(): Promise<CliDeps> {
  const [{ installGaxiosFetchCompat }, { runCli }] = await Promise.all([
    import("./infra/gaxios-fetch-compat.js"),
    import("./cli/run-main.js"),
  ]);
  return { installGaxiosFetchCompat, runCli };
}

// ─── CLI Entry (legacy programmatic path) ────────────────────────────────────

/**
 * Boot the CIVITAS Channel Manager CLI programmatically.
 *
 * Prefer running the CLI via `civitas-channels` binary or
 * `node dist/civitas-channels.js` for normal usage.
 * This export exists for programmatic invocation and testing.
 *
 * @param argv - Process argument vector (defaults to `process.argv`).
 * @param deps - Optional pre-loaded CLI dependency bundle (for testing).
 */
export async function runChannelsCliEntry(
  argv: string[] = process.argv,
  deps?: CliDeps,
): Promise<void> {
  const { installGaxiosFetchCompat, runCli } = deps ?? (await loadCliDeps());
  await installGaxiosFetchCompat();
  await runCli(argv);
}

// ─── Module Mode Detection ────────────────────────────────────────────────────

const isMain = isMainModule({
  currentFile: fileURLToPath(import.meta.url),
});

// Library consumer path: hydrate all public API bindings lazily.
if (!isMain) {
  ({
    getReplyFromConfig,
    applyTemplate,
    createDefaultDeps,
    deriveSessionKey,
    describePortOwner,
    ensureBinary,
    ensurePortAvailable,
    handlePortError,
    loadConfig,
    loadSessionStore,
    monitorWebChannel,
    normalizeE164,
    PortInUseError,
    promptYesNo,
    resolveSessionKey,
    resolveStorePath,
    runCommandWithTimeout,
    runExec,
    saveSessionStore,
    waitForever,
  } = await import("./library.js"));
}

// CLI main path: install error handlers and boot the CLI.
if (isMain) {
  const { restoreTerminalState } = await import("./terminal/restore.js");

  // Install global error handlers to prevent silent crashes from
  // unhandled rejections and uncaught exceptions.
  installUnhandledRejectionHandler();

  process.on("uncaughtException", (error) => {
    console.error("[civitas] Uncaught exception:", formatUncaughtError(error));
    restoreTerminalState("uncaught exception", { resumeStdinIfPaused: false });
    process.exit(1);
  });

  void runChannelsCliEntry(process.argv).catch((err) => {
    console.error("[civitas] CLI failed:", formatUncaughtError(err));
    restoreTerminalState("cli failure", { resumeStdinIfPaused: false });
    process.exit(1);
  });
}
