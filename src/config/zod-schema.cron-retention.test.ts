import { describe, expect, it } from "vitest";
import { CIVITASSchema } from "./zod-schema.js";

describe("CIVITASSchema cron retention and run-log validation", () => {
  it("accepts valid cron.sessionRetention and runLog values", () => {
    expect(() =>
      CIVITASSchema.parse({
        cron: {
          sessionRetention: "1h30m",
          runLog: {
            maxBytes: "5mb",
            keepLines: 2500,
          },
        },
      }),
    ).not.toThrow();
  });

  it("rejects invalid cron.sessionRetention", () => {
    expect(() =>
      CIVITASSchema.parse({
        cron: {
          sessionRetention: "abc",
        },
      }),
    ).toThrow(/sessionRetention|duration/i);
  });

  it("rejects invalid cron.runLog.maxBytes", () => {
    expect(() =>
      CIVITASSchema.parse({
        cron: {
          runLog: {
            maxBytes: "wat",
          },
        },
      }),
    ).toThrow(/runLog|maxBytes|size/i);
  });
});
