// Private runtime barrel for the bundled Signal extension.
// Prefer narrower SDK subpaths plus local extension seams over the legacy signal barrel.

export type { ChannelMessageActionAdapter } from "civitas/plugin-sdk/channel-contract";
export { buildChannelConfigSchema, SignalConfigSchema } from "../config-api.js";
export { PAIRING_APPROVED_MESSAGE } from "civitas/plugin-sdk/channel-status";
import type { CIVITASConfig as RuntimeCIVITASConfig } from "civitas/plugin-sdk/config-runtime";
export type { RuntimeCIVITASConfig as CIVITASConfig };
export type { CIVITASPluginApi, PluginRuntime } from "civitas/plugin-sdk/core";
export type { ChannelPlugin } from "civitas/plugin-sdk/core";
export {
  DEFAULT_ACCOUNT_ID,
  applyAccountNameToChannelSection,
  deleteAccountFromConfigSection,
  emptyPluginConfigSchema,
  formatPairingApproveHint,
  getChatChannelMeta,
  migrateBaseNameToDefaultAccount,
  normalizeAccountId,
  setAccountEnabledInConfigSection,
} from "civitas/plugin-sdk/core";
export { resolveChannelMediaMaxBytes } from "civitas/plugin-sdk/media-runtime";
export { formatCliCommand, formatDocsLink } from "civitas/plugin-sdk/setup-tools";
export { chunkText } from "civitas/plugin-sdk/reply-runtime";
export { detectBinary } from "civitas/plugin-sdk/setup-tools";
export {
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
} from "civitas/plugin-sdk/config-runtime";
export {
  buildBaseAccountStatusSnapshot,
  buildBaseChannelStatusSummary,
  collectStatusIssuesFromLastError,
  createDefaultChannelRuntimeState,
} from "civitas/plugin-sdk/status-helpers";
export { normalizeE164 } from "civitas/plugin-sdk/text-runtime";
export { looksLikeSignalTargetId, normalizeSignalMessagingTarget } from "./normalize.js";
export {
  listEnabledSignalAccounts,
  listSignalAccountIds,
  resolveDefaultSignalAccountId,
  resolveSignalAccount,
} from "./accounts.js";
export { monitorSignalProvider } from "./monitor.js";
export { installSignalCli } from "./install-signal-cli.js";
export { probeSignal } from "./probe.js";
export { resolveSignalReactionLevel } from "./reaction-level.js";
export { removeReactionSignal, sendReactionSignal } from "./send-reactions.js";
export { sendMessageSignal } from "./send.js";
export { signalMessageActions } from "./message-actions.js";
export type { ResolvedSignalAccount } from "./accounts.js";
export type SignalAccountConfig = Omit<
  Exclude<NonNullable<RuntimeCIVITASConfig["channels"]>["signal"], undefined>,
  "accounts"
>;
