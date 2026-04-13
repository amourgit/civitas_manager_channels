import { describe, expect, it } from "vitest";
import { CIVITASSchema } from "./zod-schema.js";

describe("CIVITASSchema logging levels", () => {
  it("accepts valid logging level values for level and consoleLevel", () => {
    expect(() =>
      CIVITASSchema.parse({
        logging: {
          level: "debug",
          consoleLevel: "warn",
        },
      }),
    ).not.toThrow();
  });

  it("rejects invalid logging level values", () => {
    expect(() =>
      CIVITASSchema.parse({
        logging: {
          level: "loud",
        },
      }),
    ).toThrow();
    expect(() =>
      CIVITASSchema.parse({
        logging: {
          consoleLevel: "verbose",
        },
      }),
    ).toThrow();
  });
});
