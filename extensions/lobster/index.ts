import { definePluginEntry } from "civitas/plugin-sdk/plugin-entry";
import type { AnyAgentTool, CIVITASPluginApi, CIVITASPluginToolFactory } from "./runtime-api.js";
import { createLobsterTool } from "./src/lobster-tool.js";

export default definePluginEntry({
  id: "lobster",
  name: "Lobster",
  description: "Optional local shell helper tools",
  register(api: CIVITASPluginApi) {
    api.registerTool(
      ((ctx) => {
        if (ctx.sandboxed) {
          return null;
        }
        return createLobsterTool(api) as AnyAgentTool;
      }) as CIVITASPluginToolFactory,
      { optional: true },
    );
  },
});
