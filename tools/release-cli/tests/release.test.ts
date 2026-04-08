import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  return {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    unlinkSync: vi.fn(),
    runRead: vi.fn(),
    runWrite: vi.fn(),
    logSection: vi.fn(),
    logSuccess: vi.fn(),
    logInfo: vi.fn(),
    logWarning: vi.fn(),
    warnIfWorktreeNotClean: vi.fn(),
    ensureTagDoesNotExist: vi.fn(),
    getCurrentBranch: vi.fn(),
    getChangedWhitelistFiles: vi.fn(),
    ensureNoStagedChangesOutsideWhitelist: vi.fn(),
    askYesNo: vi.fn(),
    bumpVersionInFiles: vi.fn(),
    getPackageVersion: vi.fn(),
    validateVersion: vi.fn(),
    fail: vi.fn((message: string) => {
      throw new Error(message);
    }),
  };
});

vi.mock("node:fs", () => ({
  existsSync: mocks.existsSync,
  readFileSync: mocks.readFileSync,
  writeFileSync: mocks.writeFileSync,
  unlinkSync: mocks.unlinkSync,
}));

vi.mock("../utils/runner.js", () => ({
  runRead: mocks.runRead,
  runWrite: mocks.runWrite,
  logSection: mocks.logSection,
  logSuccess: mocks.logSuccess,
  logInfo: mocks.logInfo,
  logWarning: mocks.logWarning,
  fail: mocks.fail,
}));

vi.mock("../utils/git.js", () => ({
  warnIfWorktreeNotClean: mocks.warnIfWorktreeNotClean,
  ensureTagDoesNotExist: mocks.ensureTagDoesNotExist,
  getCurrentBranch: mocks.getCurrentBranch,
  getChangedWhitelistFiles: mocks.getChangedWhitelistFiles,
  ensureNoStagedChangesOutsideWhitelist:
    mocks.ensureNoStagedChangesOutsideWhitelist,
}));

vi.mock("../utils/prompts.js", () => ({
  askYesNo: mocks.askYesNo,
}));

vi.mock("../utils/version.js", () => ({
  bumpVersionInFiles: mocks.bumpVersionInFiles,
  getPackageVersion: mocks.getPackageVersion,
}));

vi.mock("../utils/validators.js", () => ({
  validateVersion: mocks.validateVersion,
}));

import {
  runReleasePrepare,
  runReleaseApply,
  runReleaseRollbackPrepare,
} from "../commands/release.js";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getCurrentBranch.mockReturnValue("main");
  mocks.getChangedWhitelistFiles.mockReturnValue(["package.json"]);
  mocks.askYesNo.mockResolvedValue(false);
  mocks.existsSync.mockReturnValue(false);
  mocks.readFileSync.mockReturnValue("");
  mocks.getPackageVersion.mockReturnValue("1.2.2");
  mocks.runRead.mockImplementation((command: string, args: string[]) => {
    if (command !== "git") {
      return "";
    }

    if (args[0] === "tag") {
      return "v1.2.2\n";
    }

    if (args[0] === "rev-list") {
      return "3\n";
    }

    if (args[0] === "log") {
      return "abc1111 feat: one\ndef2222 fix: two\n";
    }

    return "";
  });
});

describe("runReleasePrepare", () => {
  it("runs changelog + bump + preview + state save", () => {
    runReleasePrepare({ version: "1.2.3", skipChangelog: false });

    expect(mocks.ensureTagDoesNotExist).toHaveBeenCalledWith("1.2.3");
    expect(mocks.warnIfWorktreeNotClean).toHaveBeenCalledWith(
      "release prepare",
    );
    expect(mocks.bumpVersionInFiles).toHaveBeenCalledWith("1.2.3", true);
    expect(mocks.writeFileSync).toHaveBeenCalledTimes(1);

    expect(mocks.runWrite).toHaveBeenNthCalledWith(1, "git", ["tag", "v1.2.3"]);
    expect(mocks.runWrite).toHaveBeenNthCalledWith(2, "yarn", ["changelog"]);
    expect(mocks.runWrite).toHaveBeenNthCalledWith(3, "git", [
      "tag",
      "-d",
      "v1.2.3",
    ]);
  });

  it("skips changelog when flag is enabled", () => {
    runReleasePrepare({ version: "1.2.3", skipChangelog: true });

    expect(mocks.runWrite).not.toHaveBeenCalledWith("yarn", ["changelog"]);
  });
});

describe("runReleaseApply", () => {
  it("creates commit and tag without push when push is declined", async () => {
    await runReleaseApply({ version: "1.2.3", yes: true, push: false });

    expect(mocks.ensureNoStagedChangesOutsideWhitelist).toHaveBeenCalledTimes(
      1,
    );
    expect(mocks.runWrite).toHaveBeenCalledWith("git", [
      "add",
      "--",
      "package.json",
      "android/app/build.gradle",
      "CHANGELOG.md",
    ]);
    expect(mocks.runWrite).toHaveBeenCalledWith("git", [
      "commit",
      "-m",
      "chore: release version 1.2.3",
    ]);
    expect(mocks.runWrite).toHaveBeenCalledWith("git", ["tag", "v1.2.3"]);
    expect(mocks.runWrite).not.toHaveBeenCalledWith(
      "git",
      expect.arrayContaining(["push"]),
    );
  });

  it("pushes when push flag is enabled", async () => {
    await runReleaseApply({ version: "1.2.3", yes: true, push: true });

    expect(mocks.runWrite).toHaveBeenCalledWith("git", [
      "push",
      "--atomic",
      "origin",
      "main",
      "v1.2.3",
    ]);
  });

  it("fails when state version mismatches requested version", async () => {
    mocks.existsSync.mockReturnValue(true);
    mocks.readFileSync.mockReturnValue(
      JSON.stringify({ version: "9.9.9", createdAt: "", whitelist: [] }),
    );

    await expect(
      runReleaseApply({ version: "1.2.3", yes: true, push: false }),
    ).rejects.toThrow("release apply ожидает версию 9.9.9");
  });

  it("fails when whitelist changes are missing", async () => {
    mocks.getChangedWhitelistFiles.mockReturnValue([]);

    await expect(
      runReleaseApply({ version: "1.2.3", yes: true, push: false }),
    ).rejects.toThrow(
      "Нет изменений в whitelist-файлах. Сначала запусти release prepare.",
    );
  });

  it("warns when expected release files are missing", async () => {
    mocks.getChangedWhitelistFiles.mockReturnValue(["package.json"]);

    await runReleaseApply({ version: "1.2.3", yes: true, push: false });

    expect(mocks.logWarning).toHaveBeenCalledWith(
      "Для релиза ожидаются изменения файлов:",
    );
    expect(mocks.logInfo).toHaveBeenCalledWith("android/app/build.gradle");
    expect(mocks.logInfo).toHaveBeenCalledWith("CHANGELOG.md");
  });
});

describe("runReleaseRollbackPrepare", () => {
  it("restores changed whitelist files and clears state", async () => {
    mocks.existsSync.mockReturnValue(true);
    mocks.readFileSync.mockReturnValue(
      JSON.stringify({ version: "1.2.3", createdAt: "", whitelist: [] }),
    );
    mocks.getChangedWhitelistFiles.mockReturnValue([
      "package.json",
      "CHANGELOG.md",
    ]);

    await runReleaseRollbackPrepare({ yes: true });

    expect(mocks.runWrite).toHaveBeenCalledWith("git", [
      "restore",
      "--staged",
      "--worktree",
      "--",
      "package.json",
      "CHANGELOG.md",
    ]);
    expect(mocks.unlinkSync).toHaveBeenCalledTimes(1);
  });

  it("does not restore files when rollback was declined", async () => {
    mocks.getChangedWhitelistFiles.mockReturnValue(["package.json"]);
    mocks.askYesNo.mockResolvedValue(false);

    await runReleaseRollbackPrepare({ yes: false });

    expect(mocks.runWrite).not.toHaveBeenCalledWith(
      "git",
      expect.arrayContaining(["restore"]),
    );
  });

  it("clears stale state when whitelist is clean", async () => {
    mocks.existsSync.mockReturnValue(true);
    mocks.readFileSync.mockReturnValue(
      JSON.stringify({ version: "1.2.3", createdAt: "", whitelist: [] }),
    );
    mocks.getChangedWhitelistFiles.mockReturnValue([]);

    await runReleaseRollbackPrepare({ yes: true });

    expect(mocks.unlinkSync).toHaveBeenCalledTimes(1);
  });
});
