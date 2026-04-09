import { resolve } from "node:path";

export const PROJECT_ROOT = resolve(process.cwd());
export const PACKAGE_JSON_PATH = resolve(PROJECT_ROOT, "package.json");
export const GRADLE_PATH = resolve(PROJECT_ROOT, "android/app/build.gradle");
export const ENV_PATH = resolve(PROJECT_ROOT, ".env");
export const RELEASE_STATE_PATH = resolve(
  PROJECT_ROOT,
  ".git/release-cli-state.json",
);

export const RELEASE_FILES = [
  "package.json",
  "android/app/build.gradle",
  "CHANGELOG.md",
];
