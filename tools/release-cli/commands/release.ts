import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import {
  RELEASE_STATE_PATH,
  RELEASE_WHITELIST,
  RELEASE_EXPECTED_CHANGED_FILES,
} from "../constants.js";
import type {
  ReleasePrepareOptions,
  ReleaseApplyOptions,
  ReleaseRollbackPrepareOptions,
  ReleaseState,
} from "../types.js";
import {
  logSection,
  runRead,
  runWrite,
  fail,
  logSuccess,
  logInfo,
  logWarning,
} from "../utils/runner.js";
import { validateVersion } from "../utils/validators.js";
import { bumpVersionInFiles } from "../utils/version.js";
import {
  getCurrentBranch,
  warnIfWorktreeNotClean,
  ensureTagDoesNotExist,
  getChangedWhitelistFiles,
  ensureNoStagedChangesOutsideWhitelist,
} from "../utils/git.js";
import { askYesNo } from "../utils/prompts.js";

function generateChangelogForVersion(version: string): void {
  const tempTag = `v${version}`;
  logSection(`Генерация changelog для v${version}`);

  runWrite("git", ["tag", tempTag]);
  try {
    runWrite("yarn", ["changelog"]);
  } finally {
    runWrite("git", ["tag", "-d", tempTag]);
  }
}

function printReleasePreview(version: string): void {
  logSection("Preview релиза");
  logInfo(`Версия: ${version}`);
  logInfo(`Commit message: chore: release version ${version}`);
  console.log("\nWhitelist релиз-файлов:");
  for (const file of RELEASE_WHITELIST) {
    console.log(`  • ${file}`);
  }

  const changedFiles = getChangedWhitelistFiles();
  console.log("\nФайлы из whitelist с изменениями:");
  if (changedFiles.length === 0) {
    console.log("  (нет изменений)");
  } else {
    for (const file of changedFiles) {
      console.log(`  • ${file}`);
    }
  }

  logSection("git diff --stat");
  runRead("git", ["--no-pager", "diff", "--stat", "--", ...RELEASE_WHITELIST]);

  logSection("git diff (whitelist)");
  runRead("git", ["--no-pager", "diff", "--", ...RELEASE_WHITELIST]);
}

function saveReleaseState(version: string): void {
  const state: ReleaseState = {
    version,
    createdAt: new Date().toISOString(),
    whitelist: RELEASE_WHITELIST,
  };

  writeFileSync(
    RELEASE_STATE_PATH,
    `${JSON.stringify(state, null, 2)}\n`,
    "utf-8",
  );
  logSuccess("Release state сохранён");
}

function warnIfExpectedFilesMissing(changedFiles: string[]): void {
  const missing = RELEASE_EXPECTED_CHANGED_FILES.filter(
    (file) => !changedFiles.includes(file),
  );

  if (missing.length === 0) {
    return;
  }

  logWarning("Для релиза ожидаются изменения файлов:");
  for (const file of missing) {
    logInfo(file);
  }
}

export function loadReleaseState(): ReleaseState | null {
  if (!existsSync(RELEASE_STATE_PATH)) {
    return null;
  }

  try {
    return JSON.parse(
      readFileSync(RELEASE_STATE_PATH, "utf-8"),
    ) as ReleaseState;
  } catch {
    return null;
  }
}

function clearReleaseState(): void {
  if (!existsSync(RELEASE_STATE_PATH)) {
    return;
  }
  unlinkSync(RELEASE_STATE_PATH);
  logSuccess("Release state очищен");
}

export function runReleasePrepare(options: ReleasePrepareOptions): void {
  validateVersion(options.version);

  logSection("Проверки");
  ensureTagDoesNotExist(options.version);
  warnIfWorktreeNotClean("release prepare");
  const branch = getCurrentBranch();
  logInfo(`Ветка: ${branch}`);

  if (!options.skipChangelog) {
    generateChangelogForVersion(options.version);
  }

  bumpVersionInFiles(options.version, true);
  printReleasePreview(options.version);
  saveReleaseState(options.version);

  logSection("✅ Готово");
  logSuccess("release prepare завершён");
  logInfo(`Следующий шаг: yarn release apply ${options.version}`);
}

export async function runReleaseApply(
  options: ReleaseApplyOptions,
): Promise<void> {
  validateVersion(options.version);

  logSection("Проверки");
  ensureTagDoesNotExist(options.version);
  ensureNoStagedChangesOutsideWhitelist();
  warnIfWorktreeNotClean("release apply");
  const state = loadReleaseState();
  if (state && state.version !== options.version) {
    fail(
      `release apply ожидает версию ${state.version}, получено ${options.version}`,
    );
  }

  const changed = getChangedWhitelistFiles();
  if (changed.length === 0) {
    fail("Нет изменений в whitelist-файлах. Сначала запусти release prepare.");
  }
  warnIfExpectedFilesMissing(changed);

  printReleasePreview(options.version);

  let confirmCommit = options.yes;
  if (!confirmCommit) {
    confirmCommit = await askYesNo("Продолжить: создать commit и tag?");
  }
  if (!confirmCommit) {
    logInfo("Операция отменена");
    return;
  }

  logSection("Commit и tag");
  runWrite("git", ["add", "--", ...RELEASE_WHITELIST]);
  runWrite("git", [
    "commit",
    "-m",
    `chore: release version ${options.version}`,
  ]);
  runWrite("git", ["tag", `v${options.version}`]);

  let shouldPush = options.push;
  if (!shouldPush) {
    shouldPush = await askYesNo("Запушить branch и tag в origin?");
  }

  if (shouldPush) {
    const branch = getCurrentBranch();
    runWrite("git", [
      "push",
      "--atomic",
      "origin",
      branch,
      `v${options.version}`,
    ]);
  } else {
    logInfo("Push пропущен");
  }

  clearReleaseState();

  logSection("✅ Готово");
  logSuccess(`Релиз ${options.version} завершён`);
}

export async function runReleaseRollbackPrepare(
  options: ReleaseRollbackPrepareOptions,
): Promise<void> {
  logSection("↩ Rollback release prepare");

  const state = loadReleaseState();
  const changed = getChangedWhitelistFiles();

  if (changed.length === 0) {
    logInfo("Изменений в release whitelist нет");

    if (state) {
      clearReleaseState();
    }

    return;
  }

  logInfo("Будут откатаны локальные изменения файлов:");
  for (const file of changed) {
    logInfo(file);
  }

  let shouldRollback = options.yes;
  if (!shouldRollback) {
    shouldRollback = await askYesNo("Откатить изменения release prepare?");
  }

  if (!shouldRollback) {
    logInfo("Операция отменена");
    return;
  }

  runWrite("git", ["restore", "--staged", "--worktree", "--", ...changed]);

  if (state) {
    clearReleaseState();
  }

  logSuccess("Изменения release prepare откатаны");
}
