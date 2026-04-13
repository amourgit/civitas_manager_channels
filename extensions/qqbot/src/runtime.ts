import type { PluginRuntime } from "civitas/plugin-sdk/core";
import { createPluginRuntimeStore } from "civitas/plugin-sdk/runtime-store";

const { setRuntime: setQQBotRuntime, getRuntime: getQQBotRuntime } =
  createPluginRuntimeStore<PluginRuntime>("QQBot runtime not initialized");
export { getQQBotRuntime, setQQBotRuntime };
