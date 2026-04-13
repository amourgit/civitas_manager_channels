// Private runtime barrel for the bundled Zalo extension.
// Keep this barrel thin and aligned with the local extension surface.

export * from "./api.js";
export type { ReplyPayload } from "civitas/plugin-sdk/reply-runtime";
export type { OpenClawConfig, GroupPolicy } from "civitas/plugin-sdk/config-runtime";
export type { MarkdownTableMode } from "civitas/plugin-sdk/config-runtime";
export type { BaseTokenResolution } from "civitas/plugin-sdk/channel-contract";
export type {
  BaseProbeResult,
  ChannelAccountSnapshot,
  ChannelMessageActionAdapter,
  ChannelMessageActionName,
  ChannelStatusIssue,
} from "civitas/plugin-sdk/channel-contract";
export type { SecretInput } from "civitas/plugin-sdk/secret-input";
export type { SenderGroupAccessDecision } from "civitas/plugin-sdk/group-access";
export type { ChannelPlugin, PluginRuntime, WizardPrompter } from "civitas/plugin-sdk/core";
export type { RuntimeEnv } from "civitas/plugin-sdk/runtime";
export type { OutboundReplyPayload } from "civitas/plugin-sdk/reply-payload";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  createDedupeCache,
  formatPairingApproveHint,
  jsonResult,
  normalizeAccountId,
  readStringParam,
  resolveClientIp,
} from "civitas/plugin-sdk/core";
export {
  applyAccountNameToChannelSection,
  applySetupAccountConfigPatch,
  buildSingleChannelSecretPromptState,
  mergeAllowFromEntries,
  migrateBaseNameToDefaultAccount,
  promptSingleChannelSecretInput,
  runSingleChannelSecretStep,
  setTopLevelChannelDmPolicyWithAllowFrom,
} from "civitas/plugin-sdk/setup";
export {
  buildSecretInputSchema,
  hasConfiguredSecretInput,
  normalizeResolvedSecretInputString,
  normalizeSecretInputString,
} from "civitas/plugin-sdk/secret-input";
export {
  buildTokenChannelStatusSummary,
  PAIRING_APPROVED_MESSAGE,
} from "civitas/plugin-sdk/channel-status";
export { buildBaseAccountStatusSnapshot } from "civitas/plugin-sdk/status-helpers";
export { chunkTextForOutbound } from "civitas/plugin-sdk/text-chunking";
export {
  formatAllowFromLowercase,
  isNormalizedSenderAllowed,
} from "civitas/plugin-sdk/allow-from";
export { addWildcardAllowFrom } from "civitas/plugin-sdk/setup";
export { evaluateSenderGroupAccess } from "civitas/plugin-sdk/group-access";
export { resolveOpenProviderRuntimeGroupPolicy } from "civitas/plugin-sdk/config-runtime";
export {
  warnMissingProviderGroupPolicyFallbackOnce,
  resolveDefaultGroupPolicy,
} from "civitas/plugin-sdk/config-runtime";
export { createChannelPairingController } from "civitas/plugin-sdk/channel-pairing";
export { createChannelReplyPipeline } from "civitas/plugin-sdk/channel-reply-pipeline";
export { logTypingFailure } from "civitas/plugin-sdk/channel-feedback";
export {
  deliverTextOrMediaReply,
  isNumericTargetId,
  sendPayloadWithChunkedTextAndMedia,
} from "civitas/plugin-sdk/reply-payload";
export {
  resolveDirectDmAuthorizationOutcome,
  resolveSenderCommandAuthorizationWithRuntime,
} from "civitas/plugin-sdk/command-auth";
export { resolveInboundRouteEnvelopeBuilderWithRuntime } from "civitas/plugin-sdk/inbound-envelope";
export { waitForAbortSignal } from "civitas/plugin-sdk/runtime";
export {
  applyBasicWebhookRequestGuards,
  createFixedWindowRateLimiter,
  createWebhookAnomalyTracker,
  readJsonWebhookBodyOrReject,
  registerWebhookTarget,
  registerWebhookTargetWithPluginRoute,
  resolveWebhookPath,
  resolveWebhookTargetWithAuthOrRejectSync,
  WEBHOOK_ANOMALY_COUNTER_DEFAULTS,
  WEBHOOK_RATE_LIMIT_DEFAULTS,
  withResolvedWebhookRequestPipeline,
} from "civitas/plugin-sdk/webhook-ingress";
export type {
  RegisterWebhookPluginRouteOptions,
  RegisterWebhookTargetOptions,
} from "civitas/plugin-sdk/webhook-ingress";
