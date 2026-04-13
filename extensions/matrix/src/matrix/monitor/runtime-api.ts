// Narrow Matrix monitor helper seam.
// Keep monitor internals off the broad package runtime-api barrel so monitor
// tests and shared workers do not pull unrelated Matrix helper surfaces.

export type { NormalizedLocation, PluginRuntime, RuntimeLogger } from "civitas/plugin-sdk/core";
export type { BlockReplyContext, ReplyPayload } from "civitas/plugin-sdk/reply-runtime";
export type { MarkdownTableMode, CIVITASConfig } from "civitas/plugin-sdk/config-runtime";
export type { RuntimeEnv } from "civitas/plugin-sdk/runtime";
export { ensureConfiguredAcpBindingReady } from "civitas/plugin-sdk/core";
export {
  addAllowlistUserEntriesFromConfigEntry,
  buildAllowlistResolutionSummary,
  canonicalizeAllowlistWithResolvedIds,
  formatAllowlistMatchMeta,
  patchAllowlistUsersInConfigEntries,
  summarizeMapping,
} from "civitas/plugin-sdk/allow-from";
export { createReplyPrefixOptions } from "civitas/plugin-sdk/channel-reply-pipeline";
export { createTypingCallbacks } from "civitas/plugin-sdk/channel-reply-pipeline";
export {
  formatLocationText,
  logInboundDrop,
  toLocationContext,
} from "civitas/plugin-sdk/channel-inbound";
export { getAgentScopedMediaLocalRoots } from "civitas/plugin-sdk/agent-media-payload";
export { logTypingFailure, resolveAckReaction } from "civitas/plugin-sdk/channel-feedback";
export {
  buildChannelKeyCandidates,
  resolveChannelEntryMatch,
} from "civitas/plugin-sdk/channel-targets";
