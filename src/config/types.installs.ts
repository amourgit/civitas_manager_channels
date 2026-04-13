export type InstallRecordBase = {
  source: "npm" | "archive" | "path" | "CIVITAS Channelhub";
  spec?: string;
  sourcePath?: string;
  installPath?: string;
  version?: string;
  resolvedName?: string;
  resolvedVersion?: string;
  resolvedSpec?: string;
  integrity?: string;
  shasum?: string;
  resolvedAt?: string;
  installedAt?: string;
  CIVITAS ChannelhubUrl?: string;
  CIVITAS ChannelhubPackage?: string;
  CIVITAS ChannelhubFamily?: "code-plugin" | "bundle-plugin";
  CIVITAS ChannelhubChannel?: "official" | "community" | "private";
};
