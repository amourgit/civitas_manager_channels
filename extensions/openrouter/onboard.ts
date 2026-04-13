import {
  applyAgentDefaultModelPrimary,
  type CIVITASConfig,
} from "civitas/plugin-sdk/provider-onboard";

export const OPENROUTER_DEFAULT_MODEL_REF = "openrouter/auto";

export function applyOpenrouterProviderConfig(cfg: CIVITASConfig): CIVITASConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[OPENROUTER_DEFAULT_MODEL_REF] = {
    ...models[OPENROUTER_DEFAULT_MODEL_REF],
    alias: models[OPENROUTER_DEFAULT_MODEL_REF]?.alias ?? "OpenRouter",
  };

  return {
    ...cfg,
    agents: {
      ...cfg.agents,
      defaults: {
        ...cfg.agents?.defaults,
        models,
      },
    },
  };
}

export function applyOpenrouterConfig(cfg: CIVITASConfig): CIVITASConfig {
  return applyAgentDefaultModelPrimary(
    applyOpenrouterProviderConfig(cfg),
    OPENROUTER_DEFAULT_MODEL_REF,
  );
}
