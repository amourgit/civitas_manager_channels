import { defineSetupPluginEntry } from "civitas/plugin-sdk/channel-core";
import { bluebubblesSetupPlugin } from "./src/channel.setup.js";

export { bluebubblesSetupPlugin } from "./src/channel.setup.js";

export default defineSetupPluginEntry(bluebubblesSetupPlugin);
