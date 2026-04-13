import type { CIVITASConfig } from "../config/config.js";
import type { WizardPrompter } from "../wizard/prompts.js";
import { ensureModelAllowlistEntry } from "./model-allowlist.js";

export async function applyDefaultModelChoice(params: {
  config: CIVITASConfig;
  setDefaultModel: boolean;
  defaultModel: string;
  applyDefaultConfig: (config: CIVITASConfig) => CIVITASConfig;
  applyProviderConfig: (config: CIVITASConfig) => CIVITASConfig;
  noteDefault?: string;
  noteAgentModel: (model: string) => Promise<void>;
  prompter: WizardPrompter;
}): Promise<{ config: CIVITASConfig; agentModelOverride?: string }> {
  if (params.setDefaultModel) {
    const next = params.applyDefaultConfig(params.config);
    if (params.noteDefault) {
      await params.prompter.note(`Default model set to ${params.noteDefault}`, "Model configured");
    }
    return { config: next };
  }

  const next = params.applyProviderConfig(params.config);
  const nextWithModel = ensureModelAllowlistEntry({
    cfg: next,
    modelRef: params.defaultModel,
  });
  await params.noteAgentModel(params.defaultModel);
  return { config: nextWithModel, agentModelOverride: params.defaultModel };
}
