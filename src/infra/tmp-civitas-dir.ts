// Shim: re-exports from tmp-openclaw-dir to satisfy plugin-sdk imports
// that reference the civitas-renamed path.
export * from "./tmp-openclaw-dir.js";
export { resolvePreferredOpenClawTmpDir as resolvePreferredCIVITASTmpDir } from "./tmp-openclaw-dir.js";
