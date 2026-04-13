import { readStringParam } from "civitas/plugin-sdk/channel-actions";
import type { CIVITASConfig } from "civitas/plugin-sdk/config-runtime";

export { resolveReactionMessageId } from "civitas/plugin-sdk/channel-actions";
export { handleWhatsAppAction } from "./action-runtime.js";
export { normalizeWhatsAppTarget } from "./normalize.js";
export { readStringParam, type CIVITASConfig };
