import type {
  DeployOptions,
  BuildApkOptions,
  RollbackOptions,
  ReleasePrepareOptions,
  ReleaseApplyOptions,
  ReleaseRollbackPrepareOptions,
  BumpVersionOptions,
} from "../types.js";
import { fail } from "../utils/runner.js";

export function parseFlag(args: string[], name: string): boolean {
  return args.includes(name);
}

function ensureValue(name: string, value: string | undefined): string {
  if (!value || value.startsWith("-")) {
    fail(`Для ${name} нужно передать значение`);
  }

  return value;
}

function parseEnumValue<T extends string>(
  optionName: string,
  value: string,
  allowed: readonly T[],
): T {
  if (!allowed.includes(value as T)) {
    fail(`${optionName}: недопустимое значение '${value}'`);
  }

  return value as T;
}

function parsePositiveInteger(optionName: string, value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    fail(`${optionName}: ожидается положительное целое число`);
  }

  return parsed;
}

export function parseValueArg(
  args: string[],
  name: string,
): string | undefined {
  const idx = args.indexOf(name);
  if (idx === -1) {
    return undefined;
  }

  return ensureValue(name, args[idx + 1]);
}

function ensureNoUnknownFlags(args: string[], allowedFlags: string[]): void {
  const allowed = new Set(allowedFlags);

  for (const arg of args) {
    if (!arg.startsWith("-")) {
      continue;
    }

    if (!allowed.has(arg)) {
      fail(`Неизвестный флаг: ${arg}`);
    }
  }
}

export function normalizeDeployOptions(args: string[]): DeployOptions {
  ensureNoUnknownFlags(args, ["--host", "--path", "--mode", "--keep"]);
  const mode = parseValueArg(args, "--mode") ?? "production";
  const keep = parseValueArg(args, "--keep");

  return {
    host: parseValueArg(args, "--host"),
    path: parseValueArg(args, "--path"),
    mode: parseEnumValue("--mode", mode, ["stable", "production"]),
    keep: keep ? parsePositiveInteger("--keep", keep) : 5,
  };
}

export function normalizeBuildApkOptions(args: string[]): BuildApkOptions {
  ensureNoUnknownFlags(args, ["--no-upload", "--upload-url"]);
  const envArg = args.find(
    (arg) => arg === "stable" || arg === "prod" || arg === "production",
  );
  if (!envArg) {
    fail(
      "Использование: build-apk <stable|prod> [--no-upload] [--upload-url URL]",
    );
  }

  const env = envArg === "stable" ? "stable" : "prod";
  return {
    env,
    noUpload: parseFlag(args, "--no-upload"),
    uploadUrl: parseValueArg(args, "--upload-url"),
  };
}

export function normalizeRollbackOptions(args: string[]): RollbackOptions {
  ensureNoUnknownFlags(args, ["--host", "--path"]);
  const nonOption = args.find((arg) => !arg.startsWith("-"));
  return {
    version: nonOption,
    host: parseValueArg(args, "--host"),
    path: parseValueArg(args, "--path"),
  };
}

export function normalizeReleasePrepare(args: string[]): ReleasePrepareOptions {
  ensureNoUnknownFlags(args, ["--skip-changelog"]);
  const version = args.find((arg) => !arg.startsWith("-"));
  if (!version) {
    fail("Использование: release prepare <version> [--skip-changelog]");
  }

  return {
    version,
    skipChangelog: parseFlag(args, "--skip-changelog"),
  };
}

export function normalizeReleaseApply(args: string[]): ReleaseApplyOptions {
  ensureNoUnknownFlags(args, ["--push", "--yes"]);
  const version = args.find((arg) => !arg.startsWith("-"));
  if (!version) {
    fail("Использование: release apply <version> [--push] [--yes]");
  }

  return {
    version,
    push: parseFlag(args, "--push"),
    yes: parseFlag(args, "--yes"),
  };
}

export function normalizeReleaseRollbackPrepare(
  args: string[],
): ReleaseRollbackPrepareOptions {
  ensureNoUnknownFlags(args, ["--yes"]);

  const nonOption = args.find((arg) => !arg.startsWith("-"));
  if (nonOption) {
    fail("Использование: release rollback-prepare [--yes]");
  }

  return {
    yes: parseFlag(args, "--yes"),
  };
}

export function normalizeBumpVersion(args: string[]): BumpVersionOptions {
  ensureNoUnknownFlags(args, ["--bump-code"]);
  const version = args.find((arg) => !arg.startsWith("-"));
  if (!version) {
    fail("Использование: bump-version <version> [--bump-code]");
  }

  return {
    version,
    bumpCode: parseFlag(args, "--bump-code"),
  };
}
