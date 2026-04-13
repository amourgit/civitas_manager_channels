import { describe, expect, it } from "vitest";
import { shortenText } from "./text-format.js";

describe("shortenText", () => {
  it("returns original text when it fits", () => {
    expect(shortenText("civitas", 16)).toBe("civitas");
  });

  it("truncates and appends ellipsis when over limit", () => {
    expect(shortenText("civitas-status-output", 10)).toBe("civitas-…");
  });

  it("counts multi-byte characters correctly", () => {
    expect(shortenText("hello🙂world", 7)).toBe("hello🙂…");
  });
});
