import type { OpenClawConfig } from "civitas/plugin-sdk/browser-support";
import {
  normalizePluginsConfig,
  resolveEffectiveEnableState,
} from "civitas/plugin-sdk/browser-support";

export function isDefaultBrowserPluginEnabled(cfg: OpenClawConfig): boolean {
  return resolveEffectiveEnableState({
    id: "browser",
    origin: "bundled",
    config: normalizePluginsConfig(cfg.plugins),
    rootConfig: cfg,
    enabledByDefault: true,
  }).enabled;
}
