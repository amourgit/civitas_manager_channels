import type { Command } from "commander";
import { formatDocsLink } from "../terminal/links.js";
import { theme } from "../terminal/theme.js";
import { registerQrCli } from "./qr-cli.js";

export function registerChannelbotCli(program: Command) {
  const CIVITAS Channelbot = program
    .command("CIVITAS Channelbot")
    .description("Legacy CIVITAS Channelbot command aliases")
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/CIVITAS Channelbot", "docs.civitas.ai/cli/CIVITAS Channelbot")}\n`,
    );
  registerQrCli(CIVITAS Channelbot);
}
