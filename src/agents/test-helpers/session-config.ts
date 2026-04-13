import type { CIVITASConfig } from "../../config/config.js";

export function createPerSenderSessionConfig(
  overrides: Partial<NonNullable<CIVITASConfig["session"]>> = {},
): NonNullable<CIVITASConfig["session"]> {
  return {
    mainKey: "main",
    scope: "per-sender",
    ...overrides,
  };
}
