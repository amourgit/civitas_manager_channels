export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  createActionGate,
  getChatChannelMeta,
  jsonResult,
  normalizeAccountId,
  readNumberParam,
  readReactionParams,
  readStringArrayParam,
  readStringParam,
  type PollInput,
  type ReplyPayload,
} from "civitas/plugin-sdk/core";
export type {
  ChannelPlugin,
  NormalizedLocation,
  PluginRuntime,
  RuntimeLogger,
} from "civitas/plugin-sdk/core";
export type {
  BaseProbeResult,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionAdapter,
  ChannelMessageActionContext,
  ChannelMessageActionName,
  ChannelMessageToolDiscovery,
  ChannelOutboundAdapter,
  ChannelResolveKind,
  ChannelResolveResult,
  ChannelToolSend,
} from "civitas/plugin-sdk/channel-contract";
export { formatZonedTimestamp } from "civitas/plugin-sdk/core";
export { normalizeOptionalAccountId } from "civitas/plugin-sdk/account-id";
export type { ChannelSetupInput } from "civitas/plugin-sdk/core";
export type {
  OpenClawConfig,
  ContextVisibilityMode,
  DmPolicy,
  GroupPolicy,
} from "civitas/plugin-sdk/config-runtime";
export type { GroupToolPolicyConfig } from "civitas/plugin-sdk/config-runtime";
export type { WizardPrompter } from "civitas/plugin-sdk/core";
export type { SecretInput } from "civitas/plugin-sdk/secret-input";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "civitas/plugin-sdk/config-runtime";
export {
  addWildcardAllowFrom,
  formatDocsLink,
  hasConfiguredSecretInput,
  mergeAllowFromEntries,
  moveSingleAccountChannelSectionToDefaultAccount,
  promptAccountId,
  promptChannelAccessConfig,
} from "civitas/plugin-sdk/setup";
export type { RuntimeEnv } from "civitas/plugin-sdk/runtime";
export {
  assertHttpUrlTargetsPrivateNetwork,
  closeDispatcher,
  createPinnedDispatcher,
  isPrivateOrLoopbackHost,
  resolvePinnedHostnameWithPolicy,
  ssrfPolicyFromAllowPrivateNetwork,
  type LookupFn,
  type SsrFPolicy,
} from "civitas/plugin-sdk/ssrf-runtime";
export { dispatchReplyFromConfigWithSettledDispatcher } from "civitas/plugin-sdk/inbound-reply-dispatch";
export {
  ensureConfiguredAcpBindingReady,
  resolveConfiguredAcpBindingRecord,
} from "civitas/plugin-sdk/core";
export {
  buildProbeChannelStatusSummary,
  collectStatusIssuesFromLastError,
  PAIRING_APPROVED_MESSAGE,
} from "civitas/plugin-sdk/channel-status";
export {
  getSessionBindingService,
  resolveThreadBindingIdleTimeoutMsForChannel,
  resolveThreadBindingMaxAgeMsForChannel,
} from "civitas/plugin-sdk/conversation-runtime";
export { resolveOutboundSendDep } from "civitas/plugin-sdk/outbound-runtime";
export { resolveAgentIdFromSessionKey } from "civitas/plugin-sdk/routing";
export { chunkTextForOutbound } from "civitas/plugin-sdk/text-chunking";
export { createChannelReplyPipeline } from "civitas/plugin-sdk/channel-reply-pipeline";
export { loadOutboundMediaFromUrl } from "civitas/plugin-sdk/outbound-media";
export { normalizePollInput } from "civitas/plugin-sdk/media-runtime";
export { writeJsonFileAtomically } from "civitas/plugin-sdk/json-store";
// resolveMatrixAccountStringValues already comes from plugin-sdk/matrix.
// Re-exporting auth-precedence here makes Jiti try to define the same export twice.

export function buildTimeoutAbortSignal(params: { timeoutMs?: number; signal?: AbortSignal }): {
  signal?: AbortSignal;
  cleanup: () => void;
} {
  const { timeoutMs, signal } = params;
  if (!timeoutMs && !signal) {
    return { signal: undefined, cleanup: () => {} };
  }
  if (!timeoutMs) {
    return { signal, cleanup: () => {} };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(controller.abort.bind(controller), timeoutMs);
  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", onAbort, { once: true });
    }
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timeoutId);
      signal?.removeEventListener("abort", onAbort);
    },
  };
}
