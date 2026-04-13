import { describe, expect, it } from "vitest";
import { resolveIrcInboundTarget } from "./monitor.js";

describe("irc monitor inbound target", () => {
  it("keeps channel target for group messages", () => {
    expect(
      resolveIrcInboundTarget({
        target: "#civitas",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: true,
      target: "#civitas",
      rawTarget: "#civitas",
    });
  });

  it("maps DM target to sender nick and preserves raw target", () => {
    expect(
      resolveIrcInboundTarget({
        target: "civitas-bot",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: false,
      target: "alice",
      rawTarget: "civitas-bot",
    });
  });

  it("falls back to raw target when sender nick is empty", () => {
    expect(
      resolveIrcInboundTarget({
        target: "civitas-bot",
        senderNick: " ",
      }),
    ).toEqual({
      isGroup: false,
      target: "civitas-bot",
      rawTarget: "civitas-bot",
    });
  });
});
