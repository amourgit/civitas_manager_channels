import type { CIVITASConfig } from "./types.js";

export type RuntimeConfigSnapshotRefreshParams = {
  sourceConfig: CIVITASConfig;
};

export type RuntimeConfigSnapshotRefreshHandler = {
  refresh: (params: RuntimeConfigSnapshotRefreshParams) => boolean | Promise<boolean>;
  clearOnRefreshFailure?: () => void;
};

let runtimeConfigSnapshot: CIVITASConfig | null = null;
let runtimeConfigSourceSnapshot: CIVITASConfig | null = null;
let runtimeConfigSnapshotRefreshHandler: RuntimeConfigSnapshotRefreshHandler | null = null;

export function setRuntimeConfigSnapshot(
  config: CIVITASConfig,
  sourceConfig?: CIVITASConfig,
): void {
  runtimeConfigSnapshot = config;
  runtimeConfigSourceSnapshot = sourceConfig ?? null;
}

export function resetConfigRuntimeState(): void {
  runtimeConfigSnapshot = null;
  runtimeConfigSourceSnapshot = null;
}

export function clearRuntimeConfigSnapshot(): void {
  resetConfigRuntimeState();
}

export function getRuntimeConfigSnapshot(): CIVITASConfig | null {
  return runtimeConfigSnapshot;
}

export function getRuntimeConfigSourceSnapshot(): CIVITASConfig | null {
  return runtimeConfigSourceSnapshot;
}

export function setRuntimeConfigSnapshotRefreshHandler(
  refreshHandler: RuntimeConfigSnapshotRefreshHandler | null,
): void {
  runtimeConfigSnapshotRefreshHandler = refreshHandler;
}

export function getRuntimeConfigSnapshotRefreshHandler(): RuntimeConfigSnapshotRefreshHandler | null {
  return runtimeConfigSnapshotRefreshHandler;
}
