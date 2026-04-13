import { defineSetupPluginEntry } from "civitas/plugin-sdk/core";
import { zaloPlugin } from "./src/channel.js";

export default defineSetupPluginEntry(zaloPlugin);
