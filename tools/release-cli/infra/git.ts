import { run } from "./run.js";
import { AppError } from "../shared/errors.js";

function porcelainPath(line: string): string {
  const value = line.slice(3).trim();
  if (value.includes(" -> ")) {
    return value.split(" -> ").pop()?.trim() ?? value;
  }

  return value;
}

export function getCurrentBranch(): string {
  const branch = run("git", ["branch", "--show-current"], {
    capture: true,
  }).trim();
  if (!branch) {
    throw new AppError("Detached HEAD is not supported for release commands.");
  }

  return branch;
}

export function ensureTagMissing(version: string): void {
  const tag = `v${version}`;
  const exists = run("git", ["tag", "--list", tag], { capture: true }).trim();
  if (exists === tag) {
    throw new AppError(`Tag already exists: ${tag}`);
  }
}

export function getChangedFiles(paths?: string[]): string[] {
  const args = ["status", "--porcelain"];
  if (paths && paths.length > 0) {
    args.push("--", ...paths);
  }

  const output = run("git", args, { capture: true });
  if (!output.trim()) {
    return [];
  }

  return Array.from(
    new Set(
      output
        .split("\n")
        .map((line) => line.trimEnd())
        .filter(Boolean)
        .map(porcelainPath),
    ),
  );
}

export function addFiles(files: string[]): void {
  run("git", ["add", "--", ...files]);
}

export function commit(message: string): void {
  run("git", ["commit", "-m", message]);
}

export function commitOnly(message: string, files: string[]): void {
  run("git", ["commit", "-m", message, "--only", "--", ...files]);
}

export function createTag(version: string): void {
  run("git", ["tag", `v${version}`]);
}

export function pushBranchAndTag(branch: string, version: string): void {
  run("git", ["push", "--atomic", "origin", branch, `v${version}`]);
}

export function restoreFiles(files: string[]): void {
  run("git", ["restore", "--staged", "--worktree", "--", ...files]);
}
