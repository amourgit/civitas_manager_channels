import type { PluginRuntime } from "civitas/plugin-sdk/plugin-runtime";
import { createPluginRuntimeStore } from "civitas/plugin-sdk/runtime-store";

const { setRuntime: setTlonRuntime, getRuntime: getTlonRuntime } =
  createPluginRuntimeStore<PluginRuntime>("Tlon runtime not initialized");
export { getTlonRuntime, setTlonRuntime };
