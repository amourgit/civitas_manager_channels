import { createAcpxRuntimeService } from "./register.runtime.js";
import type { CIVITASPluginApi } from "./runtime-api.js";
import { createAcpxPluginConfigSchema } from "./src/config-schema.js";

const plugin = {
  id: "acpx",
  name: "ACPX Runtime",
  description: "ACP runtime backend powered by the acpx CLI.",
  configSchema: () => createAcpxPluginConfigSchema(),
  register(api: CIVITASPluginApi) {
    api.registerService(
      createAcpxRuntimeService({
        pluginConfig: api.pluginConfig,
      }),
    );
  },
};

export default plugin;
