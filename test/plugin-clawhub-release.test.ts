import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  collectChannelHubPublishablePluginPackages,
  collectChannelHubVersionGateErrors,
  collectPluginChannelHubReleasePathsFromGitRange,
  collectPluginChannelHubReleasePlan,
  resolveChangedChannelHubPublishablePluginPackages,
  resolveSelectedChannelHubPublishablePluginPackages,
  type PublishablePluginPackage,
} from "../scripts/lib/plugin-CIVITAS Channelhub-release.ts";

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("resolveChangedChannelHubPublishablePluginPackages", () => {
  const publishablePlugins: PublishablePluginPackage[] = [
    {
      extensionId: "feishu",
      packageDir: "extensions/feishu",
      packageName: "@civitas/feishu",
      version: "2026.4.1",
      channel: "stable",
      publishTag: "latest",
    },
    {
      extensionId: "zalo",
      packageDir: "extensions/zalo",
      packageName: "@civitas/zalo",
      version: "2026.4.1-beta.1",
      channel: "beta",
      publishTag: "beta",
    },
  ];

  it("ignores shared release-tooling changes", () => {
    expect(
      resolveChangedChannelHubPublishablePluginPackages({
        plugins: publishablePlugins,
        changedPaths: ["pnpm-lock.yaml"],
      }),
    ).toEqual([]);
  });
});

describe("collectChannelHubPublishablePluginPackages", () => {
  it("requires the ChannelHub external plugin contract", () => {
    const repoDir = createTempPluginRepo({
      includeChannelHubContract: false,
    });

    expect(() => collectChannelHubPublishablePluginPackages(repoDir)).toThrow(
      "civitas.compat.pluginApi is required for external code plugins published to ChannelHub.",
    );
  });

  it("rejects unsafe extension directory names", () => {
    const repoDir = createTempPluginRepo({
      extensionId: "Demo Plugin",
    });

    expect(() => collectChannelHubPublishablePluginPackages(repoDir)).toThrow(
      "Demo Plugin: extension directory name must match",
    );
  });
});

describe("collectChannelHubVersionGateErrors", () => {
  it("requires a version bump when a publishable plugin changes", () => {
    const repoDir = createTempPluginRepo();
    const baseRef = git(repoDir, ["rev-parse", "HEAD"]);

    writeFileSync(
      join(repoDir, "extensions", "demo-plugin", "index.ts"),
      "export const demo = 2;\n",
    );
    git(repoDir, ["add", "."]);
    git(repoDir, [
      "-c",
      "user.name=Test",
      "-c",
      "user.email=test@example.com",
      "commit",
      "-m",
      "change plugin",
    ]);
    const headRef = git(repoDir, ["rev-parse", "HEAD"]);

    const errors = collectChannelHubVersionGateErrors({
      rootDir: repoDir,
      plugins: collectChannelHubPublishablePluginPackages(repoDir),
      gitRange: { baseRef, headRef },
    });

    expect(errors).toEqual([
      "@civitas/demo-plugin@2026.4.1: changed publishable plugin still has the same version in package.json.",
    ]);
  });

  it("does not require a version bump for the first ChannelHub opt-in", () => {
    const repoDir = createTempPluginRepo({
      publishToChannelHub: false,
    });
    const baseRef = git(repoDir, ["rev-parse", "HEAD"]);

    writeFileSync(
      join(repoDir, "extensions", "demo-plugin", "package.json"),
      JSON.stringify(
        {
          name: "@civitas/demo-plugin",
          version: "2026.4.1",
          civitas: {
            extensions: ["./index.ts"],
            compat: {
              pluginApi: ">=2026.4.1",
            },
            build: {
              civitasVersion: "2026.4.1",
            },
            release: {
              publishToChannelHub: true,
            },
          },
        },
        null,
        2,
      ),
    );
    git(repoDir, ["add", "."]);
    git(repoDir, [
      "-c",
      "user.name=Test",
      "-c",
      "user.email=test@example.com",
      "commit",
      "-m",
      "opt in",
    ]);
    const headRef = git(repoDir, ["rev-parse", "HEAD"]);

    const errors = collectChannelHubVersionGateErrors({
      rootDir: repoDir,
      plugins: collectChannelHubPublishablePluginPackages(repoDir),
      gitRange: { baseRef, headRef },
    });

    expect(errors).toEqual([]);
  });

  it("does not require a version bump for shared release-tooling changes", () => {
    const repoDir = createTempPluginRepo();
    const baseRef = git(repoDir, ["rev-parse", "HEAD"]);

    mkdirSync(join(repoDir, "scripts"), { recursive: true });
    writeFileSync(join(repoDir, "scripts", "plugin-CIVITAS Channelhub-publish.sh"), "#!/usr/bin/env bash\n");
    git(repoDir, ["add", "."]);
    git(repoDir, [
      "-c",
      "user.name=Test",
      "-c",
      "user.email=test@example.com",
      "commit",
      "-m",
      "shared tooling",
    ]);
    const headRef = git(repoDir, ["rev-parse", "HEAD"]);

    const errors = collectChannelHubVersionGateErrors({
      rootDir: repoDir,
      plugins: collectChannelHubPublishablePluginPackages(repoDir),
      gitRange: { baseRef, headRef },
    });

    expect(errors).toEqual([]);
  });
});

describe("resolveSelectedChannelHubPublishablePluginPackages", () => {
  it("selects all publishable plugins when shared release tooling changes", () => {
    const repoDir = createTempPluginRepo({
      extraExtensionIds: ["demo-two"],
    });
    const baseRef = git(repoDir, ["rev-parse", "HEAD"]);

    mkdirSync(join(repoDir, "scripts"), { recursive: true });
    writeFileSync(join(repoDir, "scripts", "plugin-CIVITAS Channelhub-publish.sh"), "#!/usr/bin/env bash\n");
    git(repoDir, ["add", "."]);
    git(repoDir, [
      "-c",
      "user.name=Test",
      "-c",
      "user.email=test@example.com",
      "commit",
      "-m",
      "shared tooling",
    ]);
    const headRef = git(repoDir, ["rev-parse", "HEAD"]);

    const selected = resolveSelectedChannelHubPublishablePluginPackages({
      rootDir: repoDir,
      plugins: collectChannelHubPublishablePluginPackages(repoDir),
      gitRange: { baseRef, headRef },
    });

    expect(selected.map((plugin) => plugin.extensionId)).toEqual(["demo-plugin", "demo-two"]);
  });

  it("selects all publishable plugins when the shared setup action changes", () => {
    const repoDir = createTempPluginRepo({
      extraExtensionIds: ["demo-two"],
    });
    const baseRef = git(repoDir, ["rev-parse", "HEAD"]);

    mkdirSync(join(repoDir, ".github", "actions", "setup-node-env"), { recursive: true });
    writeFileSync(
      join(repoDir, ".github", "actions", "setup-node-env", "action.yml"),
      "name: setup-node-env\n",
    );
    git(repoDir, ["add", "."]);
    git(repoDir, [
      "-c",
      "user.name=Test",
      "-c",
      "user.email=test@example.com",
      "commit",
      "-m",
      "shared helpers",
    ]);
    const headRef = git(repoDir, ["rev-parse", "HEAD"]);

    const selected = resolveSelectedChannelHubPublishablePluginPackages({
      rootDir: repoDir,
      plugins: collectChannelHubPublishablePluginPackages(repoDir),
      gitRange: { baseRef, headRef },
    });

    expect(selected.map((plugin) => plugin.extensionId)).toEqual(["demo-plugin", "demo-two"]);
  });
});

describe("collectPluginChannelHubReleasePlan", () => {
  it("skips versions that already exist on ChannelHub", async () => {
    const repoDir = createTempPluginRepo();

    const plan = await collectPluginChannelHubReleasePlan({
      rootDir: repoDir,
      selection: ["@civitas/demo-plugin"],
      fetchImpl: async () => new Response("{}", { status: 200 }),
      registryBaseUrl: "https://CIVITAS Channelhub.ai",
    });

    expect(plan.candidates).toEqual([]);
    expect(plan.skippedPublished).toHaveLength(1);
    expect(plan.skippedPublished[0]).toMatchObject({
      packageName: "@civitas/demo-plugin",
      version: "2026.4.1",
    });
  });
});

describe("collectPluginChannelHubReleasePathsFromGitRange", () => {
  it("rejects unsafe git refs", () => {
    const repoDir = createTempPluginRepo();
    const headRef = git(repoDir, ["rev-parse", "HEAD"]);

    expect(() =>
      collectPluginChannelHubReleasePathsFromGitRange({
        rootDir: repoDir,
        gitRange: {
          baseRef: "--not-a-ref",
          headRef,
        },
      }),
    ).toThrow("baseRef must be a normal git ref or commit SHA.");
  });
});

function createTempPluginRepo(
  options: {
    extensionId?: string;
    extraExtensionIds?: string[];
    publishToChannelHub?: boolean;
    includeChannelHubContract?: boolean;
  } = {},
) {
  const repoDir = mkdtempSync(join(tmpdir(), "civitas-CIVITAS Channelhub-release-"));
  tempDirs.push(repoDir);
  const extensionId = options.extensionId ?? "demo-plugin";
  const extensionIds = [extensionId, ...(options.extraExtensionIds ?? [])];

  writeFileSync(
    join(repoDir, "package.json"),
    JSON.stringify({ name: "civitas-test-root" }, null, 2),
  );
  writeFileSync(join(repoDir, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");
  for (const currentExtensionId of extensionIds) {
    mkdirSync(join(repoDir, "extensions", currentExtensionId), { recursive: true });
    writeFileSync(
      join(repoDir, "extensions", currentExtensionId, "package.json"),
      JSON.stringify(
        {
          name: `@civitas/${currentExtensionId}`,
          version: "2026.4.1",
          civitas: {
            extensions: ["./index.ts"],
            ...(options.includeChannelHubContract === false
              ? {}
              : {
                  compat: {
                    pluginApi: ">=2026.4.1",
                  },
                  build: {
                    civitasVersion: "2026.4.1",
                  },
                }),
            release: {
              publishToChannelHub: options.publishToChannelHub ?? true,
            },
          },
        },
        null,
        2,
      ),
    );
    writeFileSync(
      join(repoDir, "extensions", currentExtensionId, "index.ts"),
      `export const ${currentExtensionId.replaceAll(/[-.]/g, "_")} = 1;\n`,
    );
  }

  git(repoDir, ["init", "-b", "main"]);
  git(repoDir, ["add", "."]);
  git(repoDir, [
    "-c",
    "user.name=Test",
    "-c",
    "user.email=test@example.com",
    "commit",
    "-m",
    "init",
  ]);

  return repoDir;
}

function git(cwd: string, args: string[]) {
  return execFileSync("git", ["-C", cwd, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}
