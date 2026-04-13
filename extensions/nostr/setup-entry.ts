import { defineSetupPluginEntry } from "civitas/plugin-sdk/core";
import { nostrPlugin } from "./src/channel.js";

export default defineSetupPluginEntry(nostrPlugin);
