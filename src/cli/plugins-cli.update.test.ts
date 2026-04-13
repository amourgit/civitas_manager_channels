import { Command } from "commander";
import { beforeEach, describe, expect, it } from "vitest";
import type { CIVITASConfig } from "../config/config.js";
import {
  loadConfig,
  registerPluginsCli,
  resetPluginsCliTestState,
  runPluginsCommand,
  runtimeErrors,
  runtimeLogs,
  updateNpmInstalledHookPacks,
  updateNpmInstalledPlugins,
  writeConfigFile,
} from "./plugins-cli-test-helpers.js";

function createTrackedPluginConfig(params: {
  pluginId: string;
  spec: string;
  resolvedName?: string;
}): CIVITASConfig {
  return {
    plugins: {
      installs: {
        [params.pluginId]: {
          source: "npm",
          spec: params.spec,
          installPath: `/tmp/${params.pluginId}`,
          ...(params.resolvedName ? { resolvedName: params.resolvedName } : {}),
        },
      },
    },
  } as CIVITASConfig;
}

describe("plugins cli update", () => {
  beforeEach(() => {
    resetPluginsCliTestState();
  });

  it("shows the dangerous unsafe install override in update help", () => {
    const program = new Command();
    registerPluginsCli(program);

    const pluginsCommand = program.commands.find((command) => command.name() === "plugins");
    const updateCommand = pluginsCommand?.commands.find((command) => command.name() === "update");
    const helpText = updateCommand?.helpInformation() ?? "";

    expect(helpText).toContain("--dangerously-force-unsafe-install");
    expect(helpText).toContain("Bypass built-in dangerous-code update");
    expect(helpText).toContain("blocking for plugins");
  });

  it("updates tracked hook packs through plugins update", async () => {
    const cfg = {
      hooks: {
        internal: {
          installs: {
            "demo-hooks": {
              source: "npm",
              spec: "@acme/demo-hooks@1.0.0",
              installPath: "/tmp/hooks/demo-hooks",
              resolvedName: "@acme/demo-hooks",
            },
          },
        },
      },
    } as CIVITASConfig;
    const nextConfig = {
      hooks: {
        internal: {
          installs: {
            "demo-hooks": {
              source: "npm",
              spec: "@acme/demo-hooks@1.1.0",
              installPath: "/tmp/hooks/demo-hooks",
            },
          },
        },
      },
    } as CIVITASConfig;

    loadConfig.mockReturnValue(cfg);
    updateNpmInstalledPlugins.mockResolvedValue({
      config: cfg,
      changed: false,
      outcomes: [],
    });
    updateNpmInstalledHookPacks.mockResolvedValue({
      config: nextConfig,
      changed: true,
      outcomes: [
        {
          hookId: "demo-hooks",
          status: "updated",
          message: 'Updated hook pack "demo-hooks": 1.0.0 -> 1.1.0.',
        },
      ],
    });

    await runPluginsCommand(["plugins", "update", "demo-hooks"]);

    expect(updateNpmInstalledHookPacks).toHaveBeenCalledWith(
      expect.objectContaining({
        config: cfg,
        hookIds: ["demo-hooks"],
      }),
    );
    expect(writeConfigFile).toHaveBeenCalledWith(nextConfig);
    expect(
      runtimeLogs.some((line) => line.includes("Restart the gateway to load plugins and hooks.")),
    ).toBe(true);
  });

  it("exits when update is called without id and without --all", async () => {
    loadConfig.mockReturnValue({
      plugins: {
        installs: {},
      },
    } as CIVITASConfig);

    await expect(runPluginsCommand(["plugins", "update"])).rejects.toThrow("__exit__:1");

    expect(runtimeErrors.at(-1)).toContain("Provide a plugin or hook-pack id, or use --all.");
    expect(updateNpmInstalledPlugins).not.toHaveBeenCalled();
  });

  it("reports no tracked plugins or hook packs when update --all has empty install records", async () => {
    loadConfig.mockReturnValue({
      plugins: {
        installs: {},
      },
    } as CIVITASConfig);

    await runPluginsCommand(["plugins", "update", "--all"]);

    expect(updateNpmInstalledPlugins).not.toHaveBeenCalled();
    expect(updateNpmInstalledHookPacks).not.toHaveBeenCalled();
    expect(runtimeLogs.at(-1)).toBe("No tracked plugins or hook packs to update.");
  });

  it("maps an explicit unscoped npm dist-tag update to the tracked plugin id", async () => {
    const config = {
      plugins: {
        installs: {
          "civitas-codex-app-server": {
            source: "npm",
            spec: "civitas-codex-app-server",
            installPath: "/tmp/civitas-codex-app-server",
            resolvedName: "civitas-codex-app-server",
          },
        },
      },
    } as CIVITASConfig;
    loadConfig.mockReturnValue(config);
    updateNpmInstalledPlugins.mockResolvedValue({
      config,
      changed: false,
      outcomes: [],
    });

    await runPluginsCommand(["plugins", "update", "civitas-codex-app-server@beta"]);

    expect(updateNpmInstalledPlugins).toHaveBeenCalledWith(
      expect.objectContaining({
        config,
        pluginIds: ["civitas-codex-app-server"],
        specOverrides: {
          "civitas-codex-app-server": "civitas-codex-app-server@beta",
        },
      }),
    );
  });

  it("maps an explicit scoped npm dist-tag update to the tracked plugin id", async () => {
    const config = {
      plugins: {
        installs: {
          "voice-call": {
            source: "npm",
            spec: "@civitas/voice-call",
            installPath: "/tmp/voice-call",
            resolvedName: "@civitas/voice-call",
          },
        },
      },
    } as CIVITASConfig;
    loadConfig.mockReturnValue(config);
    updateNpmInstalledPlugins.mockResolvedValue({
      config,
      changed: false,
      outcomes: [],
    });

    await runPluginsCommand(["plugins", "update", "@civitas/voice-call@beta"]);

    expect(updateNpmInstalledPlugins).toHaveBeenCalledWith(
      expect.objectContaining({
        config,
        pluginIds: ["voice-call"],
        specOverrides: {
          "voice-call": "@civitas/voice-call@beta",
        },
      }),
    );
  });

  it("maps an explicit npm version update to the tracked plugin id", async () => {
    const config = {
      plugins: {
        installs: {
          "civitas-codex-app-server": {
            source: "npm",
            spec: "civitas-codex-app-server",
            installPath: "/tmp/civitas-codex-app-server",
            resolvedName: "civitas-codex-app-server",
          },
        },
      },
    } as CIVITASConfig;
    loadConfig.mockReturnValue(config);
    updateNpmInstalledPlugins.mockResolvedValue({
      config,
      changed: false,
      outcomes: [],
    });

    await runPluginsCommand(["plugins", "update", "civitas-codex-app-server@0.2.0-beta.4"]);

    expect(updateNpmInstalledPlugins).toHaveBeenCalledWith(
      expect.objectContaining({
        config,
        pluginIds: ["civitas-codex-app-server"],
        specOverrides: {
          "civitas-codex-app-server": "civitas-codex-app-server@0.2.0-beta.4",
        },
      }),
    );
  });

  it("passes dangerous force unsafe install to plugin updates", async () => {
    const config = createTrackedPluginConfig({
      pluginId: "civitas-codex-app-server",
      spec: "civitas-codex-app-server@beta",
    });
    loadConfig.mockReturnValue(config);
    updateNpmInstalledPlugins.mockResolvedValue({
      config,
      changed: false,
      outcomes: [],
    });

    await runPluginsCommand([
      "plugins",
      "update",
      "civitas-codex-app-server",
      "--dangerously-force-unsafe-install",
    ]);

    expect(updateNpmInstalledPlugins).toHaveBeenCalledWith(
      expect.objectContaining({
        config,
        pluginIds: ["civitas-codex-app-server"],
        dangerouslyForceUnsafeInstall: true,
      }),
    );
  });

  it("keeps using the recorded npm tag when update is invoked by plugin id", async () => {
    const config = {
      plugins: {
        installs: {
          "civitas-codex-app-server": {
            source: "npm",
            spec: "civitas-codex-app-server@beta",
            installPath: "/tmp/civitas-codex-app-server",
            resolvedName: "civitas-codex-app-server",
          },
        },
      },
    } as CIVITASConfig;
    loadConfig.mockReturnValue(config);
    updateNpmInstalledPlugins.mockResolvedValue({
      config,
      changed: false,
      outcomes: [],
    });

    await runPluginsCommand(["plugins", "update", "civitas-codex-app-server"]);

    expect(updateNpmInstalledPlugins).toHaveBeenCalledWith(
      expect.objectContaining({
        config,
        pluginIds: ["civitas-codex-app-server"],
      }),
    );
    expect(updateNpmInstalledPlugins).not.toHaveBeenCalledWith(
      expect.objectContaining({
        specOverrides: expect.anything(),
      }),
    );
  });

  it("writes updated config when updater reports changes", async () => {
    const cfg = {
      plugins: {
        installs: {
          alpha: {
            source: "npm",
            spec: "@civitas/alpha@1.0.0",
          },
        },
      },
    } as CIVITASConfig;
    const nextConfig = {
      plugins: {
        installs: {
          alpha: {
            source: "npm",
            spec: "@civitas/alpha@1.1.0",
          },
        },
      },
    } as CIVITASConfig;
    loadConfig.mockReturnValue(cfg);
    updateNpmInstalledPlugins.mockResolvedValue({
      outcomes: [{ status: "ok", message: "Updated alpha -> 1.1.0" }],
      changed: true,
      config: nextConfig,
    });
    updateNpmInstalledHookPacks.mockResolvedValue({
      outcomes: [],
      changed: false,
      config: nextConfig,
    });

    await runPluginsCommand(["plugins", "update", "alpha"]);

    expect(updateNpmInstalledPlugins).toHaveBeenCalledWith(
      expect.objectContaining({
        config: cfg,
        pluginIds: ["alpha"],
        dryRun: false,
      }),
    );
    expect(writeConfigFile).toHaveBeenCalledWith(nextConfig);
    expect(
      runtimeLogs.some((line) => line.includes("Restart the gateway to load plugins and hooks.")),
    ).toBe(true);
  });
});
