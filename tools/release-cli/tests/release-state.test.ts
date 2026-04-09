import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const tempDirs: string[] = [];

afterEach(() => {
  vi.restoreAllMocks();
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("release state", () => {
  it("saves, loads and clears state", async () => {
    const dir = mkdtempSync(join(tmpdir(), "release-state-"));
    tempDirs.push(dir);
    const statePath = join(dir, ".git", "release-cli-state.json");

    vi.doMock("../config.js", () => ({
      RELEASE_STATE_PATH: statePath,
    }));

    const module = await import("../domain/release-state.js");

    module.saveReleaseState("1.2.3", ["package.json"], {
      "package.json": '{"version":"1.2.3"}\n',
    });
    const loaded = module.loadReleaseState();
    expect(loaded?.version).toBe("1.2.3");
    expect(loaded?.files).toEqual(["package.json"]);
    expect(loaded?.baseline["package.json"]).toContain("1.2.3");

    module.clearReleaseState();
    expect(module.loadReleaseState()).toBeNull();
  });
});
