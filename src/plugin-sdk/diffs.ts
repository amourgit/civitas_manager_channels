// Narrow plugin-sdk surface for the bundled diffs plugin.
// Keep this list additive and scoped to the bundled diffs surface.

export { definePluginEntry } from "./plugin-entry.js";
export type { CIVITASConfig } from "../config/config.js";
export { resolvePreferredCIVITASTmpDir } from "../infra/tmp-civitas-dir.js";
export type {
  AnyAgentTool,
  CIVITASPluginApi,
  CIVITASPluginConfigSchema,
  CIVITASPluginToolContext,
  PluginLogger,
} from "../plugins/types.js";
