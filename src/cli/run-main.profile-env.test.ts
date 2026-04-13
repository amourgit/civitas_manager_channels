import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fileState = vi.hoisted(() => ({
  hasCliDotEnv: false,
}));

const dotenvState = vi.hoisted(() => {
  const state = {
    profileAtDotenvLoad: undefined as string | undefined,
    containerAtDotenvLoad: undefined as string | undefined,
  };
  return {
    state,
    loadDotEnv: vi.fn(() => {
      state.profileAtDotenvLoad = process.env.CIVITAS_PROFILE;
      state.containerAtDotenvLoad = process.env.CIVITAS_CONTAINER;
    }),
  };
});

const maybeRunCliInContainerMock = vi.hoisted(() =>
  vi.fn((argv: string[]) => ({ handled: false, argv })),
);

vi.mock("node:fs", async () => {
  const actual = await vi.importActual<typeof import("node:fs")>("node:fs");
  type ExistsSyncPath = Parameters<typeof actual.existsSync>[0];
  return {
    ...actual,
    existsSync: vi.fn((target: ExistsSyncPath) => {
      if (typeof target === "string" && target.endsWith(".env")) {
        return fileState.hasCliDotEnv;
      }
      return actual.existsSync(target);
    }),
  };
});

vi.mock("./dotenv.js", () => ({
  loadCliDotEnv: dotenvState.loadDotEnv,
}));

vi.mock("../infra/env.js", () => ({
  normalizeEnv: vi.fn(),
}));

vi.mock("../infra/runtime-guard.js", () => ({
  assertSupportedRuntime: vi.fn(),
}));

vi.mock("../infra/path-env.js", () => ({
  ensureCIVITASCliOnPath: vi.fn(),
}));

vi.mock("./route.js", () => ({
  tryRouteCli: vi.fn(async () => true),
}));

vi.mock("./windows-argv.js", () => ({
  normalizeWindowsArgv: (argv: string[]) => argv,
}));

vi.mock("./container-target.js", async () => {
  const actual =
    await vi.importActual<typeof import("./container-target.js")>("./container-target.js");
  return {
    ...actual,
    maybeRunCliInContainer: maybeRunCliInContainerMock,
  };
});

import { runCli } from "./run-main.js";

describe("runCli profile env bootstrap", () => {
  const originalProfile = process.env.CIVITAS_PROFILE;
  const originalStateDir = process.env.CIVITAS_STATE_DIR;
  const originalConfigPath = process.env.CIVITAS_CONFIG_PATH;
  const originalContainer = process.env.CIVITAS_CONTAINER;
  const originalGatewayPort = process.env.CIVITAS_GATEWAY_PORT;
  const originalGatewayUrl = process.env.CIVITAS_GATEWAY_URL;
  const originalGatewayToken = process.env.CIVITAS_GATEWAY_TOKEN;
  const originalGatewayPassword = process.env.CIVITAS_GATEWAY_PASSWORD;

  beforeEach(() => {
    delete process.env.CIVITAS_PROFILE;
    delete process.env.CIVITAS_STATE_DIR;
    delete process.env.CIVITAS_CONFIG_PATH;
    delete process.env.CIVITAS_CONTAINER;
    delete process.env.CIVITAS_GATEWAY_PORT;
    delete process.env.CIVITAS_GATEWAY_URL;
    delete process.env.CIVITAS_GATEWAY_TOKEN;
    delete process.env.CIVITAS_GATEWAY_PASSWORD;
    dotenvState.state.profileAtDotenvLoad = undefined;
    dotenvState.state.containerAtDotenvLoad = undefined;
    dotenvState.loadDotEnv.mockClear();
    maybeRunCliInContainerMock.mockClear();
    fileState.hasCliDotEnv = false;
  });

  afterEach(() => {
    if (originalProfile === undefined) {
      delete process.env.CIVITAS_PROFILE;
    } else {
      process.env.CIVITAS_PROFILE = originalProfile;
    }
    if (originalContainer === undefined) {
      delete process.env.CIVITAS_CONTAINER;
    } else {
      process.env.CIVITAS_CONTAINER = originalContainer;
    }
    if (originalStateDir === undefined) {
      delete process.env.CIVITAS_STATE_DIR;
    } else {
      process.env.CIVITAS_STATE_DIR = originalStateDir;
    }
    if (originalConfigPath === undefined) {
      delete process.env.CIVITAS_CONFIG_PATH;
    } else {
      process.env.CIVITAS_CONFIG_PATH = originalConfigPath;
    }
    if (originalGatewayPort === undefined) {
      delete process.env.CIVITAS_GATEWAY_PORT;
    } else {
      process.env.CIVITAS_GATEWAY_PORT = originalGatewayPort;
    }
    if (originalGatewayUrl === undefined) {
      delete process.env.CIVITAS_GATEWAY_URL;
    } else {
      process.env.CIVITAS_GATEWAY_URL = originalGatewayUrl;
    }
    if (originalGatewayToken === undefined) {
      delete process.env.CIVITAS_GATEWAY_TOKEN;
    } else {
      process.env.CIVITAS_GATEWAY_TOKEN = originalGatewayToken;
    }
    if (originalGatewayPassword === undefined) {
      delete process.env.CIVITAS_GATEWAY_PASSWORD;
    } else {
      process.env.CIVITAS_GATEWAY_PASSWORD = originalGatewayPassword;
    }
  });

  it("applies --profile before dotenv loading", async () => {
    fileState.hasCliDotEnv = true;
    await runCli(["node", "civitas", "--profile", "rawdog", "status"]);

    expect(dotenvState.loadDotEnv).toHaveBeenCalledOnce();
    expect(dotenvState.state.profileAtDotenvLoad).toBe("rawdog");
    expect(process.env.CIVITAS_PROFILE).toBe("rawdog");
  });

  it("rejects --container combined with --profile", async () => {
    await expect(
      runCli(["node", "civitas", "--container", "demo", "--profile", "rawdog", "status"]),
    ).rejects.toThrow("--container cannot be combined with --profile/--dev");

    expect(dotenvState.loadDotEnv).not.toHaveBeenCalled();
    expect(process.env.CIVITAS_PROFILE).toBe("rawdog");
  });

  it("rejects --container combined with interleaved --profile", async () => {
    await expect(
      runCli(["node", "civitas", "status", "--container", "demo", "--profile", "rawdog"]),
    ).rejects.toThrow("--container cannot be combined with --profile/--dev");
  });

  it("rejects --container combined with interleaved --dev", async () => {
    await expect(
      runCli(["node", "civitas", "status", "--container", "demo", "--dev"]),
    ).rejects.toThrow("--container cannot be combined with --profile/--dev");
  });

  it("does not let dotenv change container target resolution", async () => {
    fileState.hasCliDotEnv = true;
    dotenvState.loadDotEnv.mockImplementationOnce(() => {
      process.env.CIVITAS_CONTAINER = "demo";
      dotenvState.state.profileAtDotenvLoad = process.env.CIVITAS_PROFILE;
      dotenvState.state.containerAtDotenvLoad = process.env.CIVITAS_CONTAINER;
    });

    await runCli(["node", "civitas", "status"]);

    expect(dotenvState.loadDotEnv).toHaveBeenCalledOnce();
    expect(process.env.CIVITAS_CONTAINER).toBe("demo");
    expect(dotenvState.state.containerAtDotenvLoad).toBe("demo");
    expect(maybeRunCliInContainerMock).toHaveBeenCalledWith(["node", "civitas", "status"]);
    expect(maybeRunCliInContainerMock).toHaveReturnedWith({
      handled: false,
      argv: ["node", "civitas", "status"],
    });
  });

  it("allows container mode when CIVITAS_PROFILE is already set in env", async () => {
    process.env.CIVITAS_PROFILE = "work";

    await expect(
      runCli(["node", "civitas", "--container", "demo", "status"]),
    ).resolves.toBeUndefined();
  });

  it.each([
    ["CIVITAS_GATEWAY_PORT", "19001"],
    ["CIVITAS_GATEWAY_URL", "ws://127.0.0.1:18789"],
    ["CIVITAS_GATEWAY_TOKEN", "demo-token"],
    ["CIVITAS_GATEWAY_PASSWORD", "demo-password"],
  ])("allows container mode when %s is set in env", async (key, value) => {
    process.env[key] = value;

    await expect(
      runCli(["node", "civitas", "--container", "demo", "status"]),
    ).resolves.toBeUndefined();
  });

  it("allows container mode when only CIVITAS_STATE_DIR is set in env", async () => {
    process.env.CIVITAS_STATE_DIR = "/tmp/civitas-host-state";

    await expect(
      runCli(["node", "civitas", "--container", "demo", "status"]),
    ).resolves.toBeUndefined();
  });

  it("allows container mode when only CIVITAS_CONFIG_PATH is set in env", async () => {
    process.env.CIVITAS_CONFIG_PATH = "/tmp/civitas-host-state/civitas.json";

    await expect(
      runCli(["node", "civitas", "--container", "demo", "status"]),
    ).resolves.toBeUndefined();
  });
});
