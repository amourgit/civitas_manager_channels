import { defineSetupPluginEntry } from "civitas/plugin-sdk/core";
import { nextcloudTalkPlugin } from "./src/channel.js";

export default defineSetupPluginEntry(nextcloudTalkPlugin);
