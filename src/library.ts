/**
 * CIVITAS Channel Manager — Public Library Surface
 *
 * This module exposes the stable programmatic API for consumers who import
 * the CIVITAS Channel Manager as a library (rather than running it as a CLI).
 *
 * Lazy-loaded runtimes are used for heavy modules so that import time stays
 * minimal when only a subset of the API is used.
 *
 * Adapted from the OpenClaw library surface for CIVITAS Channel Manager.
 */

import type { getReplyFromConfig as getReplyFromConfigRuntime } from "./auto-reply/reply.runtime.js";
import { applyTemplate } from "./auto-reply/templating.js";
import { createDefaultDeps } from "./cli/deps.js";
import type { promptYesNo as promptYesNoRuntime } from "./cli/prompt.js";
import { waitForever } from "./cli/wait.js";
import { loadConfig } from "./config/config.js";
import { resolveStorePath } from "./config/sessions/paths.js";
import { deriveSessionKey, resolveSessionKey } from "./config/sessions/session-key.js";
import { loadSessionStore, saveSessionStore } from "./config/sessions/store.js";
import type { ensureBinary as ensureBinaryRuntime } from "./infra/binaries.js";
import {
  describePortOwner,
  ensurePortAvailable,
  handlePortError,
  PortInUseError,
} from "./infra/ports.js";
import type { monitorWebChannel as monitorWebChannelRuntime } from "./plugins/runtime/runtime-web-channel-plugin.js";
import type {
  runCommandWithTimeout as runCommandWithTimeoutRuntime,
  runExec as runExecRuntime,
} from "./process/exec.js";
import { normalizeE164 } from "./utils.js";

// ─── Lazy Runtime Type Aliases ────────────────────────────────────────────────

type GetReplyFromConfig = typeof getReplyFromConfigRuntime;
type PromptYesNo = typeof promptYesNoRuntime;
type EnsureBinary = typeof ensureBinaryRuntime;
type RunExec = typeof runExecRuntime;
type RunCommandWithTimeout = typeof runCommandWithTimeoutRuntime;
type MonitorWebChannel = typeof monitorWebChannelRuntime;

// ─── Lazy Module Promises ─────────────────────────────────────────────────────

let replyRuntimePromise: Promise<typeof import("./auto-reply/reply.runtime.js")> | null = null;
let promptRuntimePromise: Promise<typeof import("./cli/prompt.js")> | null = null;
let binariesRuntimePromise: Promise<typeof import("./infra/binaries.js")> | null = null;
let execRuntimePromise: Promise<typeof import("./process/exec.js")> | null = null;
let webChannelRuntimePromise: Promise<
  typeof import("./plugins/runtime/runtime-web-channel-plugin.js")
> | null = null;

function loadReplyRuntime() {
  replyRuntimePromise ??= import("./auto-reply/reply.runtime.js");
  return replyRuntimePromise;
}

function loadPromptRuntime() {
  promptRuntimePromise ??= import("./cli/prompt.js");
  return promptRuntimePromise;
}

function loadBinariesRuntime() {
  binariesRuntimePromise ??= import("./infra/binaries.js");
  return binariesRuntimePromise;
}

function loadExecRuntime() {
  execRuntimePromise ??= import("./process/exec.js");
  return execRuntimePromise;
}

function loadWebChannelRuntime() {
  webChannelRuntimePromise ??= import("./plugins/runtime/runtime-web-channel-plugin.js");
  return webChannelRuntimePromise;
}

// ─── Lazy Exports ─────────────────────────────────────────────────────────────

/**
 * Get the reply handler configured for a given session or channel.
 * Loaded lazily to avoid pulling in the full auto-reply runtime on startup.
 */
export const getReplyFromConfig: GetReplyFromConfig = async (...args) =>
  (await loadReplyRuntime()).getReplyFromConfig(...args);

/**
 * Prompt the user for a yes/no answer in the CLI.
 * Loaded lazily — only needed when interactive prompts are required.
 */
export const promptYesNo: PromptYesNo = async (...args) =>
  (await loadPromptRuntime()).promptYesNo(...args);

/**
 * Ensure a required binary is available on the system PATH.
 * Loaded lazily — used during setup and healthcheck flows.
 */
export const ensureBinary: EnsureBinary = async (...args) =>
  (await loadBinariesRuntime()).ensureBinary(...args);

/**
 * Execute a shell command and return its output.
 * Loaded lazily — only needed when running subprocess commands.
 */
export const runExec: RunExec = async (...args) => (await loadExecRuntime()).runExec(...args);

/**
 * Execute a shell command with a hard timeout.
 * Loaded lazily — only needed when running subprocess commands.
 */
export const runCommandWithTimeout: RunCommandWithTimeout = async (...args) =>
  (await loadExecRuntime()).runCommandWithTimeout(...args);

/**
 * Start monitoring a web-based channel plugin.
 * Loaded lazily — only needed when web channel plugins are active.
 */
export const monitorWebChannel: MonitorWebChannel = async (...args) =>
  (await loadWebChannelRuntime()).monitorWebChannel(...args);

// ─── Direct Exports ───────────────────────────────────────────────────────────

export {
  // Auto-reply templating
  applyTemplate,
  // CLI infrastructure
  createDefaultDeps,
  waitForever,
  // Config & session management
  loadConfig,
  loadSessionStore,
  saveSessionStore,
  deriveSessionKey,
  resolveSessionKey,
  resolveStorePath,
  // Network / ports
  describePortOwner,
  ensurePortAvailable,
  handlePortError,
  PortInUseError,
  // Utilities
  normalizeE164,
};
