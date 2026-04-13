import { createConfigIO, getRuntimeConfigSnapshot, type CIVITASConfig } from "../config/config.js";

export function loadBrowserConfigForRuntimeRefresh(): CIVITASConfig {
  return getRuntimeConfigSnapshot() ?? createConfigIO().loadConfig();
}
