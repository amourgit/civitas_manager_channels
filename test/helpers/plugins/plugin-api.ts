import type { CIVITASPluginApi } from "civitas/plugin-sdk/plugin-runtime";

type TestPluginApiInput = Omit<
  Partial<CIVITASPluginApi>,
  "id" | "name" | "source" | "config" | "runtime"
> &
  Pick<CIVITASPluginApi, "id" | "name" | "source" | "config" | "runtime">;

export function createTestPluginApi(api: TestPluginApiInput): CIVITASPluginApi {
  return {
    registrationMode: "full",
    logger: { info() {}, warn() {}, error() {}, debug() {} },
    registerTool() {},
    registerHook() {},
    registerHttpRoute() {},
    registerChannel() {},
    registerGatewayMethod() {},
    registerCli() {},
    registerService() {},
    registerCliBackend() {},
    registerProvider() {},
    registerSpeechProvider() {},
    registerRealtimeTranscriptionProvider() {},
    registerRealtimeVoiceProvider() {},
    registerMediaUnderstandingProvider() {},
    registerImageGenerationProvider() {},
    registerVideoGenerationProvider() {},
    registerWebFetchProvider() {},
    registerWebSearchProvider() {},
    registerInteractiveHandler() {},
    onConversationBindingResolved() {},
    registerCommand() {},
    registerContextEngine() {},
    registerMemoryPromptSection() {},
    registerMemoryFlushPlan() {},
    registerMemoryRuntime() {},
    registerMemoryEmbeddingProvider() {},
    resolvePath(input: string) {
      return input;
    },
    on() {},
    ...api,
  };
}
