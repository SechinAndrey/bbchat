export type CliGlobalOptions = {
  verbose: boolean;
};

export type ReleasePrepareInput = {
  version: string;
};

export type ReleasePrepareRevertInput = {
  version: string;
};

export type ReleaseApplyInput = {
  version?: string;
  push: boolean;
  yes: boolean;
};

export type DeployWebInput = {
  mode: "stable" | "production";
  host?: string;
  path?: string;
  keep: number;
};

export type BuildApkInput = {
  env: "stable" | "prod";
  noUpload: boolean;
  uploadUrl?: string;
};

export type RollbackInput = {
  version?: string;
  host?: string;
  path?: string;
};

export type ReleaseState = {
  version: string;
  files: string[];
  baseline: Record<string, string | null>;
  createdAt: string;
};
