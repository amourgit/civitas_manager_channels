import { defineSetupPluginEntry } from "civitas/plugin-sdk/channel-core";
import { discordSetupPlugin } from "./src/channel.setup.js";

export { discordSetupPlugin } from "./src/channel.setup.js";

export default defineSetupPluginEntry(discordSetupPlugin);
