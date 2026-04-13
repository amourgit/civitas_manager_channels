import { expect } from "vitest";
import type { CIVITASConfig } from "../api.js";
import { createMemoryGetTool, createMemorySearchTool } from "./tools.js";

export function asCIVITASConfig(config: Partial<CIVITASConfig>): CIVITASConfig {
  return config as CIVITASConfig;
}

export function createDefaultMemoryToolConfig(): CIVITASConfig {
  return asCIVITASConfig({ agents: { list: [{ id: "main", default: true }] } });
}

export function createMemorySearchToolOrThrow(params?: {
  config?: CIVITASConfig;
  agentSessionKey?: string;
}) {
  const tool = createMemorySearchTool({
    config: params?.config ?? createDefaultMemoryToolConfig(),
    ...(params?.agentSessionKey ? { agentSessionKey: params.agentSessionKey } : {}),
  });
  if (!tool) {
    throw new Error("tool missing");
  }
  return tool;
}

export function createMemoryGetToolOrThrow(
  config: CIVITASConfig = createDefaultMemoryToolConfig(),
) {
  const tool = createMemoryGetTool({ config });
  if (!tool) {
    throw new Error("tool missing");
  }
  return tool;
}

export function createAutoCitationsMemorySearchTool(agentSessionKey: string) {
  return createMemorySearchToolOrThrow({
    config: asCIVITASConfig({
      memory: { citations: "auto" },
      agents: { list: [{ id: "main", default: true }] },
    }),
    agentSessionKey,
  });
}

export function expectUnavailableMemorySearchDetails(
  details: unknown,
  params: {
    error: string;
    warning: string;
    action: string;
  },
) {
  expect(details).toEqual({
    results: [],
    disabled: true,
    unavailable: true,
    error: params.error,
    warning: params.warning,
    action: params.action,
  });
}
