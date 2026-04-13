import { defineSetupPluginEntry } from "civitas/plugin-sdk/core";
import { tlonPlugin } from "./src/channel.js";

export default defineSetupPluginEntry(tlonPlugin);
