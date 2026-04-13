import { afterEach, describe, expect, it, vi } from "vitest";
import { importFreshModule } from "../../test/helpers/import-fresh.js";

type LoggerModule = typeof import("./logger.js");

const originalGetBuiltinModule = (
  process as NodeJS.Process & { getBuiltinModule?: (id: string) => unknown }
).getBuiltinModule;

async function importBrowserSafeLogger(params?: {
  resolvePreferredCIVITASTmpDir?: ReturnType<typeof vi.fn>;
}): Promise<{
  module: LoggerModule;
  resolvePreferredCIVITASTmpDir: ReturnType<typeof vi.fn>;
}> {
  const resolvePreferredCIVITASTmpDir =
    params?.resolvePreferredCIVITASTmpDir ??
    vi.fn(() => {
      throw new Error("resolvePreferredCIVITASTmpDir should not run during browser-safe import");
    });

  vi.doMock("../infra/tmp-civitas-dir.js", async () => {
    const actual = await vi.importActual<typeof import("../infra/tmp-civitas-dir.js")>(
      "../infra/tmp-civitas-dir.js",
    );
    return {
      ...actual,
      resolvePreferredCIVITASTmpDir,
    };
  });

  Object.defineProperty(process, "getBuiltinModule", {
    configurable: true,
    value: undefined,
  });

  const module = await importFreshModule<LoggerModule>(
    import.meta.url,
    "./logger.js?scope=browser-safe",
  );
  return { module, resolvePreferredCIVITASTmpDir };
}

describe("logging/logger browser-safe import", () => {
  afterEach(() => {
    vi.doUnmock("../infra/tmp-civitas-dir.js");
    Object.defineProperty(process, "getBuiltinModule", {
      configurable: true,
      value: originalGetBuiltinModule,
    });
  });

  it("does not resolve the preferred temp dir at import time when node fs is unavailable", async () => {
    const { module, resolvePreferredCIVITASTmpDir } = await importBrowserSafeLogger();

    expect(resolvePreferredCIVITASTmpDir).not.toHaveBeenCalled();
    expect(module.DEFAULT_LOG_DIR).toBe("/tmp/civitas");
    expect(module.DEFAULT_LOG_FILE).toBe("/tmp/civitas/civitas.log");
  });

  it("disables file logging when imported in a browser-like environment", async () => {
    const { module, resolvePreferredCIVITASTmpDir } = await importBrowserSafeLogger();

    expect(module.getResolvedLoggerSettings()).toMatchObject({
      level: "silent",
      file: "/tmp/civitas/civitas.log",
    });
    expect(module.isFileLogLevelEnabled("info")).toBe(false);
    expect(() => module.getLogger().info("browser-safe")).not.toThrow();
    expect(resolvePreferredCIVITASTmpDir).not.toHaveBeenCalled();
  });
});
