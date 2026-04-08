export type RunReadOptions = {
  cwd?: string;
  capture?: boolean;
  inputText?: string;
};

export type RunWriteOptions = {
  cwd?: string;
  capture?: boolean;
  inputText?: string;
};

export type ReleasePrepareOptions = {
  version: string;
  skipChangelog: boolean;
};

export type ReleaseApplyOptions = {
  version: string;
  push: boolean;
  yes: boolean;
};

export type ReleaseRollbackPrepareOptions = {
  yes: boolean;
};

export type DeployOptions = {
  host?: string;
  path?: string;
  mode: string;
  keep: number;
};

export type BuildApkOptions = {
  env: "stable" | "prod";
  noUpload: boolean;
  uploadUrl?: string;
};

export type RollbackOptions = {
  version?: string;
  host?: string;
  path?: string;
};

export type BumpVersionOptions = {
  version: string;
  bumpCode: boolean;
};

export type ReleaseState = {
  version: string;
  createdAt: string;
  whitelist: string[];
};
