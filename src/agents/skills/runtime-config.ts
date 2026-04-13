import { getRuntimeConfigSnapshot, type CIVITASConfig } from "../../config/config.js";

export function resolveSkillRuntimeConfig(config?: CIVITASConfig): CIVITASConfig | undefined {
  return getRuntimeConfigSnapshot() ?? config;
}
