import { resolve } from "node:path";
import {
  clearReleaseState,
  loadReleaseState,
} from "../domain/release-state.js";
import { assertSemver } from "../domain/version.js";
import { deleteFile, writeText } from "../infra/fs.js";
import { AppError } from "../shared/errors.js";
import { logOk, logResult, logStart, logStep } from "../shared/logger.js";
import type { ReleasePrepareRevertInput } from "../types.js";

export function runReleasePrepareRevert(
  input: ReleasePrepareRevertInput,
): void {
  logStart("release prepare-revert");

  logStep("validate input");
  assertSemver(input.version);

  logStep("load prepare state");
  const state = loadReleaseState();
  if (!state) {
    throw new AppError("Release prepare state is missing. Nothing to revert.");
  }

  if (state.version !== input.version) {
    throw new AppError(
      `State version mismatch. Expected ${state.version}, got ${input.version}`,
    );
  }

  if (!state.baseline) {
    throw new AppError(
      "Release prepare state has no baseline snapshot and cannot be safely reverted.",
    );
  }

  logStep("restore prepared files");
  for (const file of state.files) {
    const absolutePath = resolve(process.cwd(), file);
    const baselineContent = state.baseline[file];
    if (baselineContent === null || baselineContent === undefined) {
      deleteFile(absolutePath);
      continue;
    }

    writeText(absolutePath, baselineContent);
  }

  clearReleaseState();
  logOk("prepare state cleared");

  logResult(`prepare reverted for ${input.version}`);
}
