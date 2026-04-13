import { defineSetupPluginEntry } from "civitas/plugin-sdk/core";
import { mattermostPlugin } from "./src/channel.js";

export default defineSetupPluginEntry(mattermostPlugin);
