import type { CIVITASConfig } from "../../config/types.js";

export type DirectoryConfigParams = {
  cfg: CIVITASConfig;
  accountId?: string | null;
  query?: string | null;
  limit?: number | null;
};
