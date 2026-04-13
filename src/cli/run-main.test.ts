import { describe, expect, it } from "vitest";
import {
  rewriteUpdateFlagArgv,
  resolveMissingBrowserCommandMessage,
  shouldEnsureCliPath,
  shouldRegisterPrimarySubcommand,
  shouldSkipPluginCommandRegistration,
  shouldUseRootHelpFastPath,
} from "./run-main.js";

describe("rewriteUpdateFlagArgv", () => {
  it("leaves argv unchanged when --update is absent", () => {
    const argv = ["node", "entry.js", "status"];
    expect(rewriteUpdateFlagArgv(argv)).toBe(argv);
  });

  it("rewrites --update into the update command", () => {
    expect(rewriteUpdateFlagArgv(["node", "entry.js", "--update"])).toEqual([
      "node",
      "entry.js",
      "update",
    ]);
  });

  it("preserves global flags that appear before --update", () => {
    expect(rewriteUpdateFlagArgv(["node", "entry.js", "--profile", "p", "--update"])).toEqual([
      "node",
      "entry.js",
      "--profile",
      "p",
      "update",
    ]);
  });

  it("keeps update options after the rewritten command", () => {
    expect(rewriteUpdateFlagArgv(["node", "entry.js", "--update", "--json"])).toEqual([
      "node",
      "entry.js",
      "update",
      "--json",
    ]);
  });
});

describe("shouldRegisterPrimarySubcommand", () => {
  it("skips eager primary registration for help/version invocations", () => {
    expect(shouldRegisterPrimarySubcommand(["node", "civitas", "status", "--help"])).toBe(false);
    expect(shouldRegisterPrimarySubcommand(["node", "civitas", "-V"])).toBe(false);
    expect(shouldRegisterPrimarySubcommand(["node", "civitas", "-v"])).toBe(false);
  });

  it("keeps eager primary registration for regular command runs", () => {
    expect(shouldRegisterPrimarySubcommand(["node", "civitas", "status"])).toBe(true);
    expect(shouldRegisterPrimarySubcommand(["node", "civitas", "acp", "-v"])).toBe(true);
  });
});

describe("shouldSkipPluginCommandRegistration", () => {
  it("skips plugin registration for root help/version", () => {
    expect(
      shouldSkipPluginCommandRegistration({
        argv: ["node", "civitas", "--help"],
        primary: null,
        hasBuiltinPrimary: false,
      }),
    ).toBe(true);
  });

  it("skips plugin registration for builtin subcommand help", () => {
    expect(
      shouldSkipPluginCommandRegistration({
        argv: ["node", "civitas", "config", "--help"],
        primary: "config",
        hasBuiltinPrimary: true,
      }),
    ).toBe(true);
  });

  it("skips plugin registration for builtin command runs", () => {
    expect(
      shouldSkipPluginCommandRegistration({
        argv: ["node", "civitas", "sessions", "--json"],
        primary: "sessions",
        hasBuiltinPrimary: true,
      }),
    ).toBe(true);
  });

  it("keeps plugin registration for non-builtin help", () => {
    expect(
      shouldSkipPluginCommandRegistration({
        argv: ["node", "civitas", "voicecall", "--help"],
        primary: "voicecall",
        hasBuiltinPrimary: false,
      }),
    ).toBe(false);
  });

  it("keeps plugin registration for non-builtin command runs", () => {
    expect(
      shouldSkipPluginCommandRegistration({
        argv: ["node", "civitas", "voicecall", "status"],
        primary: "voicecall",
        hasBuiltinPrimary: false,
      }),
    ).toBe(false);
  });
});

describe("shouldEnsureCliPath", () => {
  it("skips path bootstrap for help/version invocations", () => {
    expect(shouldEnsureCliPath(["node", "civitas", "--help"])).toBe(false);
    expect(shouldEnsureCliPath(["node", "civitas", "-V"])).toBe(false);
    expect(shouldEnsureCliPath(["node", "civitas", "-v"])).toBe(false);
  });

  it("skips path bootstrap for read-only fast paths", () => {
    expect(shouldEnsureCliPath(["node", "civitas", "status"])).toBe(false);
    expect(shouldEnsureCliPath(["node", "civitas", "--log-level", "debug", "status"])).toBe(false);
    expect(shouldEnsureCliPath(["node", "civitas", "sessions", "--json"])).toBe(false);
    expect(shouldEnsureCliPath(["node", "civitas", "config", "get", "update"])).toBe(false);
    expect(shouldEnsureCliPath(["node", "civitas", "models", "status", "--json"])).toBe(false);
  });

  it("keeps path bootstrap for mutating or unknown commands", () => {
    expect(shouldEnsureCliPath(["node", "civitas", "message", "send"])).toBe(true);
    expect(shouldEnsureCliPath(["node", "civitas", "voicecall", "status"])).toBe(true);
    expect(shouldEnsureCliPath(["node", "civitas", "acp", "-v"])).toBe(true);
  });
});

describe("shouldUseRootHelpFastPath", () => {
  it("uses the fast path for root help only", () => {
    expect(shouldUseRootHelpFastPath(["node", "civitas", "--help"])).toBe(true);
    expect(shouldUseRootHelpFastPath(["node", "civitas", "--profile", "work", "-h"])).toBe(true);
    expect(shouldUseRootHelpFastPath(["node", "civitas", "status", "--help"])).toBe(false);
    expect(shouldUseRootHelpFastPath(["node", "civitas", "--help", "status"])).toBe(false);
  });
});

describe("resolveMissingBrowserCommandMessage", () => {
  it("explains plugins.allow misses for the browser command", () => {
    expect(
      resolveMissingBrowserCommandMessage({
        plugins: {
          allow: ["telegram"],
        },
      }),
    ).toContain('`plugins.allow` excludes "browser"');
  });

  it("explains explicit bundled browser disablement", () => {
    expect(
      resolveMissingBrowserCommandMessage({
        plugins: {
          entries: {
            browser: {
              enabled: false,
            },
          },
        },
      }),
    ).toContain("plugins.entries.browser.enabled=false");
  });

  it("returns null when browser is already allowed", () => {
    expect(
      resolveMissingBrowserCommandMessage({
        plugins: {
          allow: ["browser"],
        },
      }),
    ).toBeNull();
  });
});
