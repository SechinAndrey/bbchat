import { resolve } from "node:path";
import { GRADLE_PATH, PACKAGE_JSON_PATH, RELEASE_FILES } from "../config.js";
import { saveReleaseState } from "../domain/release-state.js";
import {
  assertSemver,
  updateGradleVersion,
  updatePackageVersion,
} from "../domain/version.js";
import { readText, writeText } from "../infra/fs.js";
import { ensureTagMissing, getChangedFiles } from "../infra/git.js";
import { run } from "../infra/run.js";
import {
  logInfo,
  logOk,
  logResult,
  logStart,
  logStep,
  logWarn,
} from "../shared/logger.js";
import type { ReleasePrepareInput } from "../types.js";

function getReleaseBaseline(): Record<string, string | null> {
  const baseline: Record<string, string | null> = {};

  for (const file of RELEASE_FILES) {
    const absolutePath = resolve(process.cwd(), file);
    try {
      baseline[file] = readText(absolutePath);
    } catch {
      baseline[file] = null;
    }
  }

  return baseline;
}

export function runReleasePrepare(input: ReleasePrepareInput): void {
  logStart("release prepare");

  logStep("inspect current working tree state");
  const preExistingChanges = getChangedFiles();
  if (preExistingChanges.length > 0) {
    logWarn(
      `pre-existing changes detected (not blocking): ${preExistingChanges.join(", ")}`,
    );
  }

  logStep("validate input");
  assertSemver(input.version);
  ensureTagMissing(input.version);
  logOk(`version ${input.version} is valid`);

  const baseline = getReleaseBaseline();

  logStep("update versions in files");
  const packageContent = readText(PACKAGE_JSON_PATH);
  const gradleContent = readText(GRADLE_PATH);

  writeText(
    PACKAGE_JSON_PATH,
    updatePackageVersion(packageContent, input.version),
  );
  const gradleUpdate = updateGradleVersion(gradleContent, input.version);
  writeText(GRADLE_PATH, gradleUpdate.content);
  logOk(`android versionCode -> ${gradleUpdate.versionCode}`);

  logStep("generate changelog");
  run("npx", [
    "git-cliff",
    "--unreleased",
    "--tag",
    input.version,
    "--prepend",
    "CHANGELOG.md",
  ]);
  logOk("changelog updated");

  logStep("build release draft state");
  const changedReleaseFiles = getChangedFiles(RELEASE_FILES);
  saveReleaseState(input.version, RELEASE_FILES, baseline);
  logOk("state saved");

  if (changedReleaseFiles.length > 0) {
    logInfo(`changed files: ${changedReleaseFiles.join(", ")}`);
  } else {
    logInfo("no changed files detected in release scope");
  }

  logResult(
    `prepared ${input.version}; next: yarn release apply ${input.version}`,
  );
}
