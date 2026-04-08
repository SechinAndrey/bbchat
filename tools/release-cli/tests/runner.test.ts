import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  return {
    spawnSync: vi.fn(),
  };
});

vi.mock("node:child_process", () => ({
  spawnSync: mocks.spawnSync,
}));

import { runRead } from "../utils/runner.js";

afterEach(() => {
  vi.clearAllMocks();
});

describe("runRead", () => {
  it("preserves leading spaces in captured output", () => {
    mocks.spawnSync.mockReturnValue({
      status: 0,
      stdout: " M CHANGELOG.md\n",
    });

    const output = runRead("git", ["status", "--porcelain"], {
      capture: true,
    });

    expect(output).toBe(" M CHANGELOG.md");
  });

  it("removes trailing new lines only", () => {
    mocks.spawnSync.mockReturnValue({
      status: 0,
      stdout: "  value\n\n",
    });

    const output = runRead("echo", ["value"], { capture: true });

    expect(output).toBe("  value");
  });
});
