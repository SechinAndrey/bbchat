import { AppError } from "../shared/errors.js";
import type {
  BuildApkInput,
  DeployWebInput,
  ReleaseApplyInput,
  ReleasePrepareInput,
  ReleasePrepareRevertInput,
  RollbackInput,
} from "../types.js";

function ensureNoUnknownFlags(args: string[], allowed: string[]): void {
  const allowedSet = new Set(allowed);
  for (const arg of args) {
    if (!arg.startsWith("-")) {
      continue;
    }
    if (!allowedSet.has(arg)) {
      throw new AppError(`Unknown flag: ${arg}`);
    }
  }
}

function getFlag(args: string[], name: string): boolean {
  return args.includes(name);
}

function getOption(args: string[], name: string): string | undefined {
  const idx = args.indexOf(name);
  if (idx === -1) {
    return undefined;
  }

  const next = args[idx + 1];
  if (!next || next.startsWith("-")) {
    throw new AppError(`Missing value for ${name}`);
  }

  return next;
}

export function parseReleasePrepare(args: string[]): ReleasePrepareInput {
  ensureNoUnknownFlags(args, []);
  const version = args.find((value) => !value.startsWith("-"));
  if (!version) {
    throw new AppError("Usage: release prepare <version>");
  }

  return { version };
}

export function parseReleasePrepareRevert(
  args: string[],
): ReleasePrepareRevertInput {
  ensureNoUnknownFlags(args, []);
  const version = args.find((value) => !value.startsWith("-"));
  if (!version) {
    throw new AppError("Usage: release prepare-revert <version>");
  }

  return { version };
}

export function parseReleaseApply(args: string[]): ReleaseApplyInput {
  ensureNoUnknownFlags(args, ["--push", "--yes"]);
  const version = args.find((value) => !value.startsWith("-"));
  if (!version) {
    throw new AppError("Usage: release apply <version> [--push] [--yes]");
  }

  return {
    version,
    push: getFlag(args, "--push"),
    yes: getFlag(args, "--yes"),
  };
}

export function parseDeployWeb(args: string[]): DeployWebInput {
  ensureNoUnknownFlags(args, ["--host", "--path", "--mode", "--keep"]);
  const modeRaw = getOption(args, "--mode");
  if (!modeRaw || (modeRaw !== "stable" && modeRaw !== "production")) {
    throw new AppError(
      "Usage: deploy-web --mode stable|production [--host ...] [--path ...] [--keep ...]",
    );
  }

  const keepRaw = getOption(args, "--keep");
  const keep = keepRaw ? Number(keepRaw) : 5;
  if (!Number.isInteger(keep) || keep <= 0) {
    throw new AppError("--keep must be a positive integer");
  }

  return {
    mode: modeRaw,
    host: getOption(args, "--host"),
    path: getOption(args, "--path"),
    keep,
  };
}

export function parseBuildApk(args: string[]): BuildApkInput {
  ensureNoUnknownFlags(args, ["--no-upload", "--upload-url"]);
  const envRaw = args.find((value) => value === "stable" || value === "prod");
  if (!envRaw) {
    throw new AppError(
      "Usage: build-apk stable|prod [--no-upload] [--upload-url ...]",
    );
  }

  return {
    env: envRaw,
    noUpload: getFlag(args, "--no-upload"),
    uploadUrl: getOption(args, "--upload-url"),
  };
}

export function parseRollback(args: string[]): RollbackInput {
  ensureNoUnknownFlags(args, ["--host", "--path"]);
  return {
    version: args.find((value) => !value.startsWith("-")),
    host: getOption(args, "--host"),
    path: getOption(args, "--path"),
  };
}
