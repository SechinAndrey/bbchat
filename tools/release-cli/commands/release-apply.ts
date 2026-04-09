import prompts from "prompts";
import {
  clearReleaseState,
  loadReleaseState,
} from "../domain/release-state.js";
import { assertSemver } from "../domain/version.js";
import {
  addFiles,
  commitOnly,
  createTag,
  ensureTagMissing,
  getChangedFiles,
  getCurrentBranch,
  pushBranchAndTag,
} from "../infra/git.js";
import { AppError } from "../shared/errors.js";
import {
  logInfo,
  logOk,
  logResult,
  logStart,
  logStep,
} from "../shared/logger.js";
import type { ReleaseApplyInput } from "../types.js";

async function askConfirmation(message: string): Promise<boolean> {
  const answer = await prompts({
    type: "confirm",
    name: "ok",
    message,
    initial: false,
  });

  return Boolean(answer.ok);
}

export async function runReleaseApply(input: ReleaseApplyInput): Promise<void> {
  logStart("release apply");

  logStep("validate release state");
  const state = loadReleaseState();
  if (!state) {
    throw new AppError(
      "Release prepare state is missing. Run release prepare first.",
    );
  }

  logStep("resolve target version");
  const version = input.version ?? state.version;
  assertSemver(version);
  ensureTagMissing(version);

  if (input.version && state.version !== input.version) {
    throw new AppError(
      `State version mismatch. Expected ${state.version}, got ${input.version}`,
    );
  }

  const changed = getChangedFiles(state.files);
  if (changed.length === 0) {
    throw new AppError("No changes found in release files. Nothing to apply.");
  }

  logInfo(`will commit files: ${state.files.join(", ")}`);

  if (!input.yes) {
    const allowed = await askConfirmation(
      `Create commit and tag for ${version}?`,
    );
    if (!allowed) {
      throw new AppError("Operation cancelled by user.");
    }
  }

  logStep("create commit and tag");
  addFiles(state.files);
  commitOnly(`chore: release version ${version}`, state.files);
  createTag(version);
  logOk("release commit/tag created");

  if (input.push) {
    logStep("push branch and tag");
    const branch = getCurrentBranch();
    pushBranchAndTag(branch, version);
    logOk(`pushed ${branch} + v${version}`);
  }

  clearReleaseState();
  logResult(`release ${version} applied`);
}
