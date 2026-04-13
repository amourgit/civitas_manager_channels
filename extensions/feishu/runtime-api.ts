// Private runtime barrel for the bundled Feishu extension.
// Keep this barrel thin and generic-only.

export type {
  AllowlistMatch,
  AnyAgentTool,
  BaseProbeResult,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelMeta,
  ChannelOutboundAdapter,
  ChannelPlugin,
  HistoryEntry,
  CIVITASConfig,
  CIVITASPluginApi,
  OutboundIdentity,
  PluginRuntime,
  ReplyPayload,
} from "civitas/plugin-sdk/core";
export type { CIVITASConfig as ChanneldbotConfig } from "civitas/plugin-sdk/core";
export type { RuntimeEnv } from "civitas/plugin-sdk/runtime";
export type { GroupToolPolicyConfig } from "civitas/plugin-sdk/config-runtime";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  createActionGate,
  createDedupeCache,
} from "civitas/plugin-sdk/core";
export {
  PAIRING_APPROVED_MESSAGE,
  buildProbeChannelStatusSummary,
  createDefaultChannelRuntimeState,
} from "civitas/plugin-sdk/channel-status";
export { buildAgentMediaPayload } from "civitas/plugin-sdk/agent-media-payload";
export { createChannelPairingController } from "civitas/plugin-sdk/channel-pairing";
export { createReplyPrefixContext } from "civitas/plugin-sdk/channel-reply-pipeline";
export {
  evaluateSupplementalContextVisibility,
  filterSupplementalContextItems,
  resolveChannelContextVisibilityMode,
} from "civitas/plugin-sdk/config-runtime";
export { readJsonFileWithFallback } from "civitas/plugin-sdk/json-store";
export { createPersistentDedupe } from "civitas/plugin-sdk/persistent-dedupe";
export { normalizeAgentId } from "civitas/plugin-sdk/routing";
export { chunkTextForOutbound } from "civitas/plugin-sdk/text-chunking";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
  requestBodyErrorToText,
} from "civitas/plugin-sdk/webhook-ingress";
