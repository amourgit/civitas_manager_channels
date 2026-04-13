import type { LegacyConfigRule } from "../../config/legacy.shared.js";
import type { CIVITASConfig } from "../../config/types.js";
import { getBundledChannelContractSurfaces } from "./contract-surfaces.js";

type ChannelLegacyConfigSurface = {
  legacyConfigRules?: LegacyConfigRule[];
  normalizeCompatibilityConfig?: (params: { cfg: CIVITASConfig }) => {
    config: CIVITASConfig;
    changes: string[];
    warnings?: string[];
  };
};

function getChannelLegacyConfigSurfaces(): ChannelLegacyConfigSurface[] {
  return getBundledChannelContractSurfaces() as ChannelLegacyConfigSurface[];
}

export function collectChannelLegacyConfigRules(): LegacyConfigRule[] {
  return getChannelLegacyConfigSurfaces().flatMap((surface) => surface.legacyConfigRules ?? []);
}

export function applyChannelDoctorCompatibilityMigrations(cfg: Record<string, unknown>): {
  next: Record<string, unknown>;
  changes: string[];
} {
  let nextCfg = cfg as CIVITASConfig & Record<string, unknown>;
  const changes: string[] = [];
  for (const surface of getChannelLegacyConfigSurfaces()) {
    const mutation = surface.normalizeCompatibilityConfig?.({ cfg: nextCfg });
    if (!mutation || mutation.changes.length === 0) {
      continue;
    }
    nextCfg = mutation.config as CIVITASConfig & Record<string, unknown>;
    changes.push(...mutation.changes);
  }
  return { next: nextCfg, changes };
}
