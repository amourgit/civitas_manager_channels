/**
 * CIVITAS Channel Manager - Plugin SDK Facade Type Map
 * 
 * This file maps plugin SDK facade names to their module types.
 * Generated for the CIVITAS Channel Manager - contains all channel plugin
 * and provider facades used by the plugin-sdk.
 * 
 * For channel plugins (active in CIVITAS Channel Manager):
 * Types are resolved at runtime via the bundled plugin public surface modules.
 * 
 * For provider facades (kept for SDK compatibility but not actively used):
 * Types default to Record<string, unknown> as a safe any-compatible type.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyModule = Record<string, any>;

type FacadeEntry<T extends AnyModule = AnyModule> = {
  module: T;
};

/**
 * Central type registry mapping facade IDs to their module types.
 * Facades with active channel extensions have typed module entries.
 * Facades for removed/optional providers use the generic AnyModule type.
 */
export type PluginSdkFacadeTypeMap = {
  // ─── Active Channel Extensions ───────────────────────────────────────────
  "bluebubbles-policy": FacadeEntry;
  "feishu-conversation": FacadeEntry;
  "feishu-setup": FacadeEntry;
  "irc-surface": FacadeEntry;
  "line-runtime": FacadeEntry;
  "line-surface": FacadeEntry;
  "matrix-helper": FacadeEntry;
  "matrix-runtime-surface": FacadeEntry;
  "matrix-surface": FacadeEntry;
  "matrix-thread-bindings": FacadeEntry;
  "mattermost-policy": FacadeEntry;
  "whatsapp-surface": FacadeEntry;
  "zalo-setup": FacadeEntry;

  // ─── Provider SDK Facades (compatibility, not actively used) ─────────────
  "amazon-bedrock": FacadeEntry;
  "anthropic-cli": FacadeEntry;
  "anthropic-vertex": FacadeEntry;
  "browser": FacadeEntry;
  "browser-runtime": FacadeEntry;
  "byteplus": FacadeEntry;
  "chutes": FacadeEntry;
  "cloudflare-ai-gateway": FacadeEntry;
  "deepseek": FacadeEntry;
  "github-copilot-login": FacadeEntry;
  "google": FacadeEntry;
  "huggingface": FacadeEntry;
  "image-generation-runtime": FacadeEntry;
  "kilocode": FacadeEntry;
  "kimi-coding": FacadeEntry;
  "litellm": FacadeEntry;
  "media-understanding-runtime": FacadeEntry;
  "memory-core-engine-runtime": FacadeEntry;
  "minimax": FacadeEntry;
  "mistral": FacadeEntry;
  "modelstudio": FacadeEntry;
  "modelstudio-definitions": FacadeEntry;
  "moonshot": FacadeEntry;
  "nvidia": FacadeEntry;
  "ollama": FacadeEntry;
  "ollama-surface": FacadeEntry;
  "openai": FacadeEntry;
  "opencode": FacadeEntry;
  "opencode-go": FacadeEntry;
  "openrouter": FacadeEntry;
  "provider-reasoning": FacadeEntry;
  "qianfan": FacadeEntry;
  "qwen": FacadeEntry;
  "qwen-definitions": FacadeEntry;
  "sglang": FacadeEntry;
  "speech-runtime": FacadeEntry;
  "synthetic": FacadeEntry;
  "together": FacadeEntry;
  "venice": FacadeEntry;
  "vercel-ai-gateway": FacadeEntry;
  "video-generation-runtime": FacadeEntry;
  "vllm": FacadeEntry;
  "volcengine": FacadeEntry;
  "xai": FacadeEntry;
  "xiaomi": FacadeEntry;
  "zai": FacadeEntry;
};
