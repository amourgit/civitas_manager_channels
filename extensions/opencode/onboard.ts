import {
  applyAgentDefaultModelPrimary,
  withAgentModelAliases,
  type CIVITASConfig,
} from "civitas/plugin-sdk/provider-onboard";

export const OPENCODE_ZEN_DEFAULT_MODEL_REF = "opencode/claude-opus-4-6";

export function applyOpencodeZenProviderConfig(cfg: CIVITASConfig): CIVITASConfig {
  return {
    ...cfg,
    agents: {
      ...cfg.agents,
      defaults: {
        ...cfg.agents?.defaults,
        models: withAgentModelAliases(cfg.agents?.defaults?.models, [
          { modelRef: OPENCODE_ZEN_DEFAULT_MODEL_REF, alias: "Opus" },
        ]),
      },
    },
  };
}

export function applyOpencodeZenConfig(cfg: CIVITASConfig): CIVITASConfig {
  return applyAgentDefaultModelPrimary(
    applyOpencodeZenProviderConfig(cfg),
    OPENCODE_ZEN_DEFAULT_MODEL_REF,
  );
}
