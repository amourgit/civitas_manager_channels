// Private runtime barrel for the bundled Mattermost extension.
// Keep this barrel thin and generic-only.

export type {
  BaseProbeResult,
  ChannelAccountSnapshot,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelPlugin,
  ChatType,
  HistoryEntry,
  CIVITASConfig,
  CIVITASPluginApi,
  PluginRuntime,
} from "civitas/plugin-sdk/core";
export type { RuntimeEnv } from "civitas/plugin-sdk/runtime";
export type { ReplyPayload } from "civitas/plugin-sdk/reply-runtime";
export type { ModelsProviderData } from "civitas/plugin-sdk/command-auth";
export type {
  BlockStreamingCoalesceConfig,
  DmPolicy,
  GroupPolicy,
} from "civitas/plugin-sdk/config-runtime";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  createDedupeCache,
  parseStrictPositiveInteger,
  resolveClientIp,
  isTrustedProxyAddress,
} from "civitas/plugin-sdk/core";
export { buildComputedAccountStatusSnapshot } from "civitas/plugin-sdk/channel-status";
export { createAccountStatusSink } from "civitas/plugin-sdk/channel-lifecycle";
export { buildAgentMediaPayload } from "civitas/plugin-sdk/agent-media-payload";
export {
  buildModelsProviderData,
  listSkillCommandsForAgents,
  resolveControlCommandGate,
  resolveStoredModelOverride,
} from "civitas/plugin-sdk/command-auth";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  isDangerousNameMatchingEnabled,
  loadSessionStore,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  resolveStorePath,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "civitas/plugin-sdk/config-runtime";
export { formatInboundFromLabel } from "civitas/plugin-sdk/channel-inbound";
export { logInboundDrop } from "civitas/plugin-sdk/channel-inbound";
export { createChannelPairingController } from "civitas/plugin-sdk/channel-pairing";
export {
  DM_GROUP_ACCESS_REASON,
  readStoreAllowFromForDmPolicy,
  resolveDmGroupAccessWithLists,
  resolveEffectiveAllowFromLists,
} from "civitas/plugin-sdk/channel-policy";
export { evaluateSenderGroupAccessForPolicy } from "civitas/plugin-sdk/group-access";
export { createChannelReplyPipeline } from "civitas/plugin-sdk/channel-reply-pipeline";
export { logTypingFailure } from "civitas/plugin-sdk/channel-feedback";
export { loadOutboundMediaFromUrl } from "civitas/plugin-sdk/outbound-media";
export { rawDataToString } from "civitas/plugin-sdk/browser-support";
export { chunkTextForOutbound } from "civitas/plugin-sdk/text-chunking";
export {
  DEFAULT_GROUP_HISTORY_LIMIT,
  buildPendingHistoryContextFromMap,
  clearHistoryEntriesIfEnabled,
  recordPendingHistoryEntryIfEnabled,
} from "civitas/plugin-sdk/reply-history";
export { normalizeAccountId, resolveThreadSessionKeys } from "civitas/plugin-sdk/routing";
export { resolveAllowlistMatchSimple } from "civitas/plugin-sdk/allow-from";
export { registerPluginHttpRoute } from "civitas/plugin-sdk/webhook-targets";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
} from "civitas/plugin-sdk/webhook-ingress";
export {
  applyAccountNameToChannelSection,
  applySetupAccountConfigPatch,
  migrateBaseNameToDefaultAccount,
} from "civitas/plugin-sdk/setup";
export {
  getAgentScopedMediaLocalRoots,
  resolveChannelMediaMaxBytes,
} from "civitas/plugin-sdk/media-runtime";
export { normalizeProviderId } from "civitas/plugin-sdk/provider-model-shared";
