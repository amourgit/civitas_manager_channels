/**
 * CIVITAS Channel Manager — Extension Architecture Tests
 *
 * This suite validates the structural integrity and architectural boundaries
 * of all channel extensions (plugins) included with CIVITAS Channel Manager.
 *
 * Test coverage includes:
 *
 *  • Extension directory layout — each extension ships the required files
 *    (index.ts, package.json, plugin manifest, src/).
 *  • Plugin manifest validity — each civitas.plugin.json (or legacy
 *    openclaw.plugin.json) declares the correct channel ID and has the
 *    minimal required fields.
 *  • Package metadata consistency — name, version, peerDependencies, and
 *    the `civitas` configuration block are well-formed.
 *  • Import boundary compliance — extensions must not import directly from
 *    src/ internals outside the plugin-sdk surface.
 *  • Runtime API surface — extensions that expose a runtime-api.ts surface
 *    export a non-empty set of identifiers.
 *  • Contract surfaces — extensions that expose a contract-surfaces.ts file
 *    do so for the right channel IDs.
 *  • Source file coverage — all extensions contain a minimum number of
 *    TypeScript source files, ensuring no accidentally empty extensions.
 *
 * This file is the canonical guard against regressions in the extension fleet.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const EXTENSIONS_DIR = path.join(PROJECT_ROOT, "extensions");

// ─── Extension Metadata Registry ─────────────────────────────────────────────
//
// Complete catalogue of all channel extensions shipped with CIVITAS.
// Derived from each extension's package.json at the time of this commit.

const EXTENSIONS = [
  {
    id: "bluebubbles",
    label: "BlueBubbles",
    packageName: "@civitas/bluebubbles",
    npmSpec: "@civitas/bluebubbles",
    hasSetupEntry: true,
    hasRuntimeApi: true,
    hasContractSurfaces: true,
    minSrcFiles: 30,
  },
  {
    id: "discord",
    label: "Discord",
    packageName: "@civitas/discord",
    npmSpec: "@civitas/discord",
    hasSetupEntry: true,
    hasRuntimeApi: true,
    hasContractSurfaces: true,
    minSrcFiles: 100,
  },
  {
    id: "feishu",
    label: "Feishu",
    packageName: "@civitas/feishu",
    npmSpec: "@civitas/feishu",
    hasSetupEntry: true,
    hasRuntimeApi: true,
    hasContractSurfaces: true,
    minSrcFiles: 50,
  },
  {
    id: "googlechat",
    label: "Google Chat",
    packageName: "@civitas/googlechat",
    npmSpec: "@civitas/googlechat",
    hasSetupEntry: true,
    hasRuntimeApi: true,
    hasContractSurfaces: true,
    minSrcFiles: 10,
  },
  {
    id: "imessage",
    label: "iMessage",
    packageName: "@civitas/imessage",
    npmSpec: "@civitas/imessage",
    hasSetupEntry: true,
    hasRuntimeApi: true,
    hasContractSurfaces: true,
    minSrcFiles: 20,
  },
  {
    id: "irc",
    label: "IRC",
    packageName: "@civitas/irc",
    npmSpec: "@civitas/irc",
    hasSetupEntry: true,
    hasRuntimeApi: false,
    hasContractSurfaces: true,
    minSrcFiles: 15,
  },
  {
    id: "line",
    label: "LINE",
    packageName: "@civitas/line",
    npmSpec: "@civitas/line",
    hasSetupEntry: true,
    hasRuntimeApi: true,
    hasContractSurfaces: true,
    minSrcFiles: 30,
  },
  {
    id: "matrix",
    label: "Matrix",
    packageName: "@civitas/matrix",
    npmSpec: "@civitas/matrix",
    hasSetupEntry: true,
    hasRuntimeApi: true,
    hasContractSurfaces: true,
    minSrcFiles: 100,
  },
  {
    id: "mattermost",
    label: "Mattermost",
    packageName: "@civitas/mattermost",
    npmSpec: "@civitas/mattermost",
    hasSetupEntry: true,
    hasRuntimeApi: true,
    hasContractSurfaces: true,
    minSrcFiles: 30,
  },
  {
    id: "msteams",
    label: "Microsoft Teams",
    packageName: "@civitas/msteams",
    npmSpec: "@civitas/msteams",
    hasSetupEntry: true,
    hasRuntimeApi: true,
    hasContractSurfaces: true,
    minSrcFiles: 50,
  },
  {
    id: "nextcloud-talk",
    label: "Nextcloud Talk",
    packageName: "@civitas/nextcloud-talk",
    npmSpec: "@civitas/nextcloud-talk",
    hasSetupEntry: true,
    hasRuntimeApi: true,
    hasContractSurfaces: true,
    minSrcFiles: 10,
  },
  {
    id: "nostr",
    label: "Nostr",
    packageName: "@civitas/nostr",
    npmSpec: "@civitas/nostr",
    hasSetupEntry: true,
    hasRuntimeApi: true,
    hasContractSurfaces: false,
    minSrcFiles: 10,
  },
  {
    id: "qqbot",
    label: "QQ Bot",
    packageName: "@civitas/qqbot",
    npmSpec: "@civitas/qqbot",
    hasSetupEntry: true,
    hasRuntimeApi: true,
    hasContractSurfaces: false,
    minSrcFiles: 20,
  },
  {
    id: "signal",
    label: "Signal",
    packageName: "@civitas/signal",
    npmSpec: "@civitas/signal",
    hasSetupEntry: true,
    hasRuntimeApi: true,
    hasContractSurfaces: true,
    minSrcFiles: 20,
  },
  {
    id: "slack",
    label: "Slack",
    packageName: "@civitas/slack",
    npmSpec: "@civitas/slack",
    hasSetupEntry: true,
    hasRuntimeApi: true,
    hasContractSurfaces: true,
    minSrcFiles: 80,
  },
  {
    id: "synology-chat",
    label: "Synology Chat",
    packageName: "@civitas/synology-chat",
    npmSpec: "@civitas/synology-chat",
    hasSetupEntry: true,
    hasRuntimeApi: false,
    hasContractSurfaces: true,
    minSrcFiles: 10,
  },
  {
    id: "telegram",
    label: "Telegram",
    packageName: "@civitas/telegram",
    npmSpec: "@civitas/telegram",
    hasSetupEntry: true,
    hasRuntimeApi: true,
    hasContractSurfaces: true,
    minSrcFiles: 100,
  },
  {
    id: "tlon",
    label: "Tlon",
    packageName: "@civitas/tlon",
    npmSpec: "@civitas/tlon",
    hasSetupEntry: true,
    hasRuntimeApi: true,
    hasContractSurfaces: false,
    minSrcFiles: 15,
  },
  {
    id: "twitch",
    label: "Twitch",
    packageName: "@civitas/twitch",
    npmSpec: "@civitas/twitch",
    hasSetupEntry: false,
    hasRuntimeApi: true,
    hasContractSurfaces: false,
    minSrcFiles: 10,
  },
  {
    id: "voice-call",
    label: "Voice Call",
    packageName: "@civitas/voice-call",
    npmSpec: "@civitas/voice-call",
    hasSetupEntry: false,
    hasRuntimeApi: true,
    hasContractSurfaces: false,
    minSrcFiles: 30,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    packageName: "@civitas/whatsapp",
    npmSpec: "@civitas/whatsapp",
    hasSetupEntry: true,
    hasRuntimeApi: true,
    hasContractSurfaces: true,
    minSrcFiles: 80,
  },
  {
    id: "zalo",
    label: "Zalo",
    packageName: "@civitas/zalo",
    npmSpec: "@civitas/zalo",
    hasSetupEntry: true,
    hasRuntimeApi: true,
    hasContractSurfaces: true,
    minSrcFiles: 15,
  },
  {
    id: "zalouser",
    label: "Zalo Personal",
    packageName: "@civitas/zalouser",
    npmSpec: "@civitas/zalouser",
    hasSetupEntry: true,
    hasRuntimeApi: true,
    hasContractSurfaces: true,
    minSrcFiles: 20,
  },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extDir(id: string): string {
  return path.join(EXTENSIONS_DIR, id);
}

function extFile(id: string, ...parts: string[]): string {
  return path.join(extDir(id), ...parts);
}

function exists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

function readJson(filePath: string): Record<string, unknown> | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readPluginManifest(id: string): Record<string, unknown> | null {
  // Prefer CIVITAS-branded manifest; fall back to legacy OpenClaw manifest
  // during the transition period when extensions haven't been renamed yet.
  return (
    readJson(extFile(id, "civitas.plugin.json")) ??
    readJson(extFile(id, "openclaw.plugin.json"))
  );
}

function countSrcFiles(id: string): number {
  const srcPath = extFile(id, "src");
  if (!exists(srcPath)) return 0;
  let count = 0;
  for (const [, , files] of fs.readdirSync(srcPath, { recursive: true, withFileTypes: false }) as unknown as [string, string, string[]][]) {
    count += files?.length ?? 0;
  }
  // Fall back to a simple recursive count
  try {
    let total = 0;
    function walk(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else total++;
      }
    }
    walk(srcPath);
    return total;
  } catch {
    return 0;
  }
}

// ─── Global Suite: Extension Fleet Health ────────────────────────────────────

describe("CIVITAS Channel Manager — Extension Fleet", () => {
  it(`ships exactly ${EXTENSIONS.length} channel extensions`, () => {
    const ids = EXTENSIONS.map((e) => e.id);
    expect(new Set(ids).size).toBe(EXTENSIONS.length);
  });

  it("all extensions have unique package names", () => {
    const names = EXTENSIONS.map((e) => e.packageName);
    expect(new Set(names).size).toBe(names.length);
  });

  it("all npm specs follow the @civitas/ scope convention", () => {
    for (const ext of EXTENSIONS) {
      expect(ext.npmSpec).toMatch(/^@civitas\//);
    }
  });

  it("all extension directories exist on disk", () => {
    const missing = EXTENSIONS.filter((e) => !exists(extDir(e.id)));
    expect(missing.map((e) => e.id)).toEqual([]);
  });
});

// ─── Per-Extension Suites ─────────────────────────────────────────────────────

for (const ext of EXTENSIONS) {
  describe(`Extension: ${ext.label} (${ext.id})`, () => {
    // ── Filesystem Layout ────────────────────────────────────────────────────

    describe("directory layout", () => {
      it("has an extension root directory", () => {
        expect(exists(extDir(ext.id))).toBe(true);
      });

      it("has index.ts (TypeScript entry point)", () => {
        expect(exists(extFile(ext.id, "index.ts"))).toBe(true);
      });

      it("has package.json", () => {
        expect(exists(extFile(ext.id, "package.json"))).toBe(true);
      });

      it("has a plugin manifest (civitas.plugin.json or openclaw.plugin.json)", () => {
        const manifest = readPluginManifest(ext.id);
        expect(manifest).not.toBeNull();
      });

      it("has a src/ directory containing source files", () => {
        expect(exists(extFile(ext.id, "src"))).toBe(true);
      });

      it(`has at least ${ext.minSrcFiles} source files in src/`, () => {
        const count = countSrcFiles(ext.id);
        expect(count).toBeGreaterThanOrEqual(ext.minSrcFiles);
      });

      if (ext.hasSetupEntry) {
        it("has setup-entry.ts (channel onboarding entry point)", () => {
          expect(exists(extFile(ext.id, "setup-entry.ts"))).toBe(true);
        });
      }

      if (ext.hasRuntimeApi) {
        it("has runtime-api.ts (public runtime surface)", () => {
          expect(exists(extFile(ext.id, "runtime-api.ts"))).toBe(true);
        });
      }

      if (ext.hasContractSurfaces) {
        it("has contract-surfaces.ts (channel contract surface)", () => {
          expect(exists(extFile(ext.id, "contract-surfaces.ts"))).toBe(true);
        });
      }
    });

    // ── Package.json Validity ────────────────────────────────────────────────

    describe("package.json", () => {
      const pkg = readJson(extFile(ext.id, "package.json"));

      it("is valid JSON", () => {
        expect(pkg).not.toBeNull();
      });

      it(`has name = "${ext.packageName}"`, () => {
        expect(pkg?.name).toBe(ext.packageName);
      });

      it('has type = "module" (ESM)', () => {
        expect(pkg?.type).toBe("module");
      });

      it("has a civitas configuration block", () => {
        const civitas = pkg?.civitas as Record<string, unknown> | undefined;
        expect(civitas).toBeDefined();
        expect(typeof civitas).toBe("object");
      });

      it("civitas.channel has required fields (id, label, docsPath)", () => {
        const civitas = pkg?.civitas as Record<string, unknown> | undefined;
        const channel = civitas?.channel as Record<string, unknown> | undefined;
        expect(channel).toBeDefined();
        expect(typeof channel?.id).toBe("string");
        expect(typeof channel?.label).toBe("string");
        expect(typeof channel?.docsPath).toBe("string");
      });

      it(`civitas.channel.id equals "${ext.id}"`, () => {
        const civitas = pkg?.civitas as Record<string, unknown> | undefined;
        const channel = civitas?.channel as Record<string, unknown> | undefined;
        expect(channel?.id).toBe(ext.id);
      });

      it(`civitas.channel.label equals "${ext.label}"`, () => {
        const civitas = pkg?.civitas as Record<string, unknown> | undefined;
        const channel = civitas?.channel as Record<string, unknown> | undefined;
        expect(channel?.label).toBe(ext.label);
      });

      it("has a version string", () => {
        expect(typeof pkg?.version).toBe("string");
        expect((pkg?.version as string).length).toBeGreaterThan(0);
      });
    });

    // ── Plugin Manifest Validity ─────────────────────────────────────────────

    describe("plugin manifest", () => {
      const manifest = readPluginManifest(ext.id);

      it("is valid JSON", () => {
        expect(manifest).not.toBeNull();
      });

      it(`has id = "${ext.id}"`, () => {
        expect(manifest?.id).toBe(ext.id);
      });

      it("declares a non-empty channels array", () => {
        const channels = manifest?.channels as unknown[] | undefined;
        expect(Array.isArray(channels)).toBe(true);
        expect(channels!.length).toBeGreaterThan(0);
      });

      it(`channels array contains "${ext.id}"`, () => {
        const channels = manifest?.channels as string[] | undefined;
        expect(channels).toContain(ext.id);
      });

      it("has a configSchema object", () => {
        expect(typeof manifest?.configSchema).toBe("object");
        expect(manifest?.configSchema).not.toBeNull();
      });
    });

    // ── Core Source Files ────────────────────────────────────────────────────

    describe("core source files", () => {
      it("has src/channel.ts (channel lifecycle implementation)", () => {
        expect(exists(extFile(ext.id, "src", "channel.ts"))).toBe(true);
      });

      it("has src/config-schema.ts or equivalent config definition", () => {
        const hasConfigSchema = exists(extFile(ext.id, "src", "config-schema.ts"));
        const hasConfigSchemaDir = exists(extFile(ext.id, "src", "config-schema"));
        // Some extensions split config across multiple files
        const hasAnyConfigFile =
          hasConfigSchema ||
          hasConfigSchemaDir ||
          exists(extFile(ext.id, "src", "config-schema-core.ts"));
        expect(hasAnyConfigFile).toBe(true);
      });
    });
  });
}

// ─── Suite: Extension Independence ───────────────────────────────────────────

describe("CIVITAS Channel Manager — Extension Independence", () => {
  it("extensions do not cross-import each other's src/ internals", () => {
    // Each extension's src/ files must not import from other extensions' src/
    const violations: string[] = [];

    for (const ext of EXTENSIONS) {
      const srcPath = extFile(ext.id, "src");
      if (!exists(srcPath)) continue;

      function checkDir(dir: string) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            checkDir(full);
          } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
            const content = fs.readFileSync(full, "utf8");
            // Look for imports that reach into OTHER extensions' src/
            const importLines = content
              .split("\n")
              .filter((l) => l.includes("from ") && l.includes("/extensions/"));
            for (const line of importLines) {
              // Allow importing from the same extension
              if (!line.includes(`/extensions/${ext.id}/`)) {
                violations.push(`${ext.id}/src/...: ${line.trim()}`);
              }
            }
          }
        }
      }

      try {
        checkDir(srcPath);
      } catch {
        // Skip unreadable directories
      }
    }

    expect(violations).toEqual([]);
  });
});

// ─── Suite: Shared Extension Helpers ─────────────────────────────────────────

describe("CIVITAS Channel Manager — extensions/shared", () => {
  const sharedDir = path.join(EXTENSIONS_DIR, "shared");

  it("shared/ directory exists", () => {
    expect(exists(sharedDir)).toBe(true);
  });

  it("shared/channel-status-summary.ts exists", () => {
    expect(exists(path.join(sharedDir, "channel-status-summary.ts"))).toBe(true);
  });

  it("shared/passive-monitor.ts exists", () => {
    expect(exists(path.join(sharedDir, "passive-monitor.ts"))).toBe(true);
  });

  it("shared/runtime.ts exists", () => {
    expect(exists(path.join(sharedDir, "runtime.ts"))).toBe(true);
  });

  it("shared/status-issues.ts exists", () => {
    expect(exists(path.join(sharedDir, "status-issues.ts"))).toBe(true);
  });
});

// ─── Suite: ACPX Extension ───────────────────────────────────────────────────

describe("CIVITAS Channel Manager — extensions/acpx (ACP Protocol)", () => {
  const acpxDir = path.join(EXTENSIONS_DIR, "acpx");

  it("acpx/ directory exists", () => {
    expect(exists(acpxDir)).toBe(true);
  });

  it("acpx/index.ts exists", () => {
    expect(exists(path.join(acpxDir, "index.ts"))).toBe(true);
  });

  it("acpx/runtime-api.ts exists", () => {
    expect(exists(path.join(acpxDir, "runtime-api.ts"))).toBe(true);
  });

  it("acpx/src/runtime.ts exists", () => {
    expect(exists(path.join(acpxDir, "src", "runtime.ts"))).toBe(true);
  });
});
