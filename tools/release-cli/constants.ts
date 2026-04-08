import { resolve } from "node:path";

export const PROJECT_ROOT = resolve(process.cwd());
export const PACKAGE_JSON_PATH = resolve(PROJECT_ROOT, "package.json");
export const GRADLE_PATH = resolve(PROJECT_ROOT, "android/app/build.gradle");
export const RELEASE_STATE_PATH = resolve(
  PROJECT_ROOT,
  ".git/release-prepare-state.json",
);

export const RELEASE_WHITELIST = [
  "package.json",
  "android/app/build.gradle",
  "CHANGELOG.md",
];

export const RELEASE_EXPECTED_CHANGED_FILES = [
  "package.json",
  "android/app/build.gradle",
  "CHANGELOG.md",
];
