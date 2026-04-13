import type { PluginRuntime } from "civitas/plugin-sdk/core";
import { createPluginRuntimeStore } from "civitas/plugin-sdk/runtime-store";

const { setRuntime: setIMessageRuntime, getRuntime: getIMessageRuntime } =
  createPluginRuntimeStore<PluginRuntime>("iMessage runtime not initialized");
export { getIMessageRuntime, setIMessageRuntime };
