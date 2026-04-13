// Private runtime barrel for the bundled Zalo Personal extension.
// Keep this barrel thin and aligned with the local extension surface.

export * from "./api.js";
export type { ReplyPayload } from "civitas/plugin-sdk/reply-runtime";
export type {
  BaseProbeResult,
  ChannelAccountSnapshot,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionAdapter,
  ChannelStatusIssue,
} from "civitas/plugin-sdk/channel-contract";
export type {
  OpenClawConfig,
  GroupToolPolicyConfig,
  MarkdownTableMode,
} from "civitas/plugin-sdk/config-runtime";
export type {
  PluginRuntime,
  AnyAgentTool,
  ChannelPlugin,
  OpenClawPluginToolContext,
} from "civitas/plugin-sdk/core";
export type { RuntimeEnv } from "civitas/plugin-sdk/runtime";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  normalizeAccountId,
} from "civitas/plugin-sdk/core";
export { chunkTextForOutbound } from "civitas/plugin-sdk/text-chunking";
export {
  isDangerousNameMatchingEnabled,
  resolveDefaultGroupPolicy,
  resolveOpenProviderRuntimeGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "civitas/plugin-sdk/config-runtime";
export {
  mergeAllowlist,
  summarizeMapping,
  formatAllowFromLowercase,
} from "civitas/plugin-sdk/allow-from";
export { resolveMentionGatingWithBypass } from "civitas/plugin-sdk/channel-inbound";
export { createChannelPairingController } from "civitas/plugin-sdk/channel-pairing";
export { createChannelReplyPipeline } from "civitas/plugin-sdk/channel-reply-pipeline";
export { buildBaseAccountStatusSnapshot } from "civitas/plugin-sdk/status-helpers";
export { resolveSenderCommandAuthorization } from "civitas/plugin-sdk/command-auth";
export {
  evaluateGroupRouteAccessForPolicy,
  resolveSenderScopedGroupPolicy,
} from "civitas/plugin-sdk/group-access";
export { loadOutboundMediaFromUrl } from "civitas/plugin-sdk/outbound-media";
export {
  deliverTextOrMediaReply,
  isNumericTargetId,
  resolveSendableOutboundReplyParts,
  sendPayloadWithChunkedTextAndMedia,
  type OutboundReplyPayload,
} from "civitas/plugin-sdk/reply-payload";
export { resolvePreferredOpenClawTmpDir } from "civitas/plugin-sdk/browser-support";
