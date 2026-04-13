import {
  definePluginEntry,
  type CIVITASPluginToolContext,
  type CIVITASPluginToolFactory,
} from "civitas/plugin-sdk/plugin-entry";
import {
  createBrowserPluginService,
  createBrowserTool,
  handleBrowserGatewayRequest,
  registerBrowserCli,
} from "./register.runtime.js";

export default definePluginEntry({
  id: "browser",
  name: "Browser",
  description: "Default browser tool plugin",
  register(api) {
    api.registerTool(((ctx: CIVITASPluginToolContext) =>
      createBrowserTool({
        sandboxBridgeUrl: ctx.browser?.sandboxBridgeUrl,
        allowHostControl: ctx.browser?.allowHostControl,
        agentSessionKey: ctx.sessionKey,
      })) as CIVITASPluginToolFactory);
    api.registerCli(({ program }) => registerBrowserCli(program), { commands: ["browser"] });
    api.registerGatewayMethod("browser.request", handleBrowserGatewayRequest, {
      scope: "operator.write",
    });
    api.registerService(createBrowserPluginService());
  },
});
