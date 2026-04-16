import { resolve } from "node:path";
import { GRADLE_PATH, PACKAGE_JSON_PATH, RELEASE_FILES } from "../config.js";
import { saveReleaseState } from "../domain/release-state.js";
import {
  assertSemver,
  getVersion,
  updateGradleVersion,
  updatePackageVersion,
} from "../domain/version.js";
import { readText, writeText } from "../infra/fs.js";
import {
  ensureTagMissing,
  getChangedFiles,
  getCurrentBranch,
} from "../infra/git.js";
import { run } from "../infra/run.js";
import {
  tuiDone,
  tuiList,
  tuiStatus,
  tuiStep,
  tuiBanner,
  ICONS,
} from "../shared/tui.js";
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
  tuiBanner("Release CLI", "release prepare", {
    from: getVersion(),
    to: input.version,
    branch: getCurrentBranch(),
  });

  tuiStep("inspect current working tree state");
  const preExistingChanges = getChangedFiles();
  if (preExistingChanges.length > 0) {
    tuiStatus(
      "pre-existing changes detected (not blocking):",
      "warning",
      ICONS.fileChanged,
    );
    tuiList(preExistingChanges);
  }

  tuiStep("validate input");
  assertSemver(input.version);
  ensureTagMissing(input.version);
  tuiStatus(`version ${input.version} is valid`, "success");

  const baseline = getReleaseBaseline();

  tuiStep("update versions in files");
  const packageContent = readText(PACKAGE_JSON_PATH);
  const gradleContent = readText(GRADLE_PATH);

  writeText(
    PACKAGE_JSON_PATH,
    updatePackageVersion(packageContent, input.version),
  );
  const gradleUpdate = updateGradleVersion(gradleContent, input.version);
  writeText(GRADLE_PATH, gradleUpdate.content);
  tuiStatus(`android versionCode -> ${gradleUpdate.versionCode}`, "success");

  tuiStep("generate changelog");
  run("npx", [
    "git-cliff",
    "--unreleased",
    "--tag",
    input.version,
    "--prepend",
    "CHANGELOG.md",
  ]);
  tuiStatus("changelog updated", "success");

  tuiStep("build release draft state");
  const changedReleaseFiles = getChangedFiles(RELEASE_FILES);
  saveReleaseState(input.version, RELEASE_FILES, baseline);
  tuiStatus("state saved", "success");

  if (changedReleaseFiles.length > 0) {
    tuiStatus("changed files:", "accent", ICONS.fileDone);
    tuiList(changedReleaseFiles);
  } else {
    tuiStatus("no changed files detected in release scope", "accent");
  }

  tuiDone(`prepared ${input.version}`, `yarn release apply ${input.version}`);
}
