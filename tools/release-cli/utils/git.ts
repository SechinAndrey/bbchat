import { RELEASE_WHITELIST } from "../constants.js";
import { runRead, fail, logWarning, logInfo } from "./runner.js";

function parsePorcelainPath(line: string): string {
  const path = line.slice(3).trim();

  if (path.includes(" -> ")) {
    return path.split(" -> ").pop()?.trim() ?? path;
  }

  return path;
}

function getPorcelainEntries(): string[] {
  const status = runRead("git", ["status", "--porcelain"], {
    capture: true,
  });

  if (!status) {
    return [];
  }

  return status.split("\n").filter(Boolean);
}

function formatFileList(files: string[]): void {
  for (const file of files) {
    logInfo(`Изменён файл: ${file}`);
  }
}

export function getCurrentBranch(): string {
  const branch = runRead("git", ["branch", "--show-current"], {
    capture: true,
  });
  if (!branch) {
    fail("detached HEAD. Переключись на ветку.");
  }
  return branch;
}

export function warnIfWorktreeNotClean(messagePrefix: string): void {
  const entries = getPorcelainEntries();
  if (entries.length === 0) {
    return;
  }

  logWarning(
    `${messagePrefix}: есть локальные изменения. Они не попадут в релизный commit, если не входят в whitelist.`,
  );
  formatFileList(entries.map(parsePorcelainPath));
}

export function tagExists(tag: string): boolean {
  const result = runRead("git", ["tag", "--list", tag], { capture: true });
  return result.trim() === tag;
}

export function ensureTagDoesNotExist(version: string): void {
  const tag = `v${version}`;
  if (tagExists(tag)) {
    fail(`Тег ${tag} уже существует`);
  }
}

export function getChangedWhitelistFiles(): string[] {
  const changed = runRead(
    "git",
    ["status", "--porcelain", "--", ...RELEASE_WHITELIST],
    {
      capture: true,
    },
  );

  if (!changed) {
    return [];
  }

  const files = changed.split("\n").map(parsePorcelainPath).filter(Boolean);

  return Array.from(new Set(files));
}

export function ensureNoStagedChangesOutsideWhitelist(): void {
  const staged = runRead("git", ["diff", "--cached", "--name-only"], {
    capture: true,
  })
    .split("\n")
    .map((file) => file.trim())
    .filter(Boolean);

  const whitelist = new Set(RELEASE_WHITELIST);
  const unrelated = staged.filter((file) => !whitelist.has(file));

  if (unrelated.length === 0) {
    return;
  }

  logWarning("В индексе есть изменения вне release whitelist.");
  formatFileList(unrelated);
  fail("Сними лишние staged-файлы из индекса перед release apply.");
}
