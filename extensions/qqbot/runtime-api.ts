export type { ChannelPlugin, CIVITASPluginApi, PluginRuntime } from "civitas/plugin-sdk/core";
export type { CIVITASConfig } from "civitas/plugin-sdk/config-runtime";
export type {
  CIVITASPluginService,
  CIVITASPluginServiceContext,
  PluginLogger,
} from "civitas/plugin-sdk/core";
export type { ResolvedQQBotAccount, QQBotAccountConfig } from "./src/types.js";
export { getQQBotRuntime, setQQBotRuntime } from "./src/runtime.js";
