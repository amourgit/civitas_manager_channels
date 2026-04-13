import { definePluginEntry, type AnyAgentTool, type CIVITASPluginApi } from "./api.js";
import { createLlmTaskTool } from "./src/llm-task-tool.js";

export default definePluginEntry({
  id: "llm-task",
  name: "LLM Task",
  description: "Optional tool for structured subtask execution",
  register(api: CIVITASPluginApi) {
    api.registerTool(createLlmTaskTool(api) as unknown as AnyAgentTool, { optional: true });
  },
});
