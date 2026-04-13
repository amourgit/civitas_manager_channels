import { describe, expect, it } from "vitest";
import type { CIVITASConfig } from "../config/config.js";
import { isDefaultBrowserPluginEnabled } from "./plugin-enabled.js";

describe("isDefaultBrowserPluginEnabled", () => {
  it("defaults to enabled", () => {
    expect(isDefaultBrowserPluginEnabled({} as CIVITASConfig)).toBe(true);
  });

  it("respects explicit plugin disablement", () => {
    expect(
      isDefaultBrowserPluginEnabled({
        plugins: {
          entries: {
            browser: {
              enabled: false,
            },
          },
        },
      } as CIVITASConfig),
    ).toBe(false);
  });
});
