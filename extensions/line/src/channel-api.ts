export { clearAccountEntryFields } from "civitas/plugin-sdk/core";
import { DEFAULT_ACCOUNT_ID } from "civitas/plugin-sdk/account-id";
import type { OpenClawConfig } from "civitas/plugin-sdk/account-resolution";
import type { ChannelPlugin } from "civitas/plugin-sdk/core";
import {
  listLineAccountIds,
  normalizeAccountId,
  resolveDefaultLineAccountId,
  resolveLineAccount,
} from "./accounts.js";
import { resolveExactLineGroupConfigKey } from "./group-keys.js";
import type { LineConfig, ResolvedLineAccount } from "./types.js";

export {
  DEFAULT_ACCOUNT_ID,
  listLineAccountIds,
  normalizeAccountId,
  resolveDefaultLineAccountId,
  resolveExactLineGroupConfigKey,
  resolveLineAccount,
};

export type { ChannelPlugin, LineConfig, OpenClawConfig, ResolvedLineAccount };
