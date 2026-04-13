// Private runtime barrel for the bundled IRC extension.
// Keep this barrel thin and generic-only.

export type {
  BaseProbeResult,
  ChannelPlugin,
  OpenClawConfig,
  PluginRuntime,
} from "civitas/plugin-sdk/core";
export type { RuntimeEnv } from "civitas/plugin-sdk/runtime";
export type {
  BlockStreamingCoalesceConfig,
  DmConfig,
  DmPolicy,
  GroupPolicy,
  GroupToolPolicyBySenderConfig,
  GroupToolPolicyConfig,
  MarkdownConfig,
} from "civitas/plugin-sdk/config-runtime";
export type { OutboundReplyPayload } from "civitas/plugin-sdk/reply-payload";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  getChatChannelMeta,
} from "civitas/plugin-sdk/core";
export {
  PAIRING_APPROVED_MESSAGE,
  buildBaseChannelStatusSummary,
} from "civitas/plugin-sdk/channel-status";
export { createChannelPairingController } from "civitas/plugin-sdk/channel-pairing";
export { createAccountStatusSink } from "civitas/plugin-sdk/channel-lifecycle";
export {
  readStoreAllowFromForDmPolicy,
  resolveEffectiveAllowFromLists,
} from "civitas/plugin-sdk/channel-policy";
export { resolveControlCommandGate } from "civitas/plugin-sdk/command-auth";
export { dispatchInboundReplyWithBase } from "civitas/plugin-sdk/inbound-reply-dispatch";
export { chunkTextForOutbound } from "civitas/plugin-sdk/text-chunking";
export {
  deliverFormattedTextWithAttachments,
  formatTextWithAttachmentLinks,
  resolveOutboundMediaUrls,
} from "civitas/plugin-sdk/reply-payload";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
  isDangerousNameMatchingEnabled,
} from "civitas/plugin-sdk/config-runtime";
export { logInboundDrop } from "civitas/plugin-sdk/channel-inbound";
