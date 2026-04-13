import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { parseEnvFiles } from "../infra/env.js";

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dirPath = tempDirs.pop();
    if (dirPath) {
      rmSync(dirPath, { recursive: true, force: true });
    }
  }
});

describe("env parser", () => {
  it("merges base and mode env files with mode override", () => {
    const dirPath = mkdtempSync(join(tmpdir(), "bb-chat-release-cli-"));
    tempDirs.push(dirPath);

    const baseEnvPath = join(dirPath, ".env");
    const modeEnvPath = join(dirPath, ".env.stable");

    writeFileSync(
      baseEnvPath,
      "DEPLOY_HOST=base@host\nDEPLOY_PATH=/srv/base\nCOMMON=value\n",
    );
    writeFileSync(
      modeEnvPath,
      "DEPLOY_HOST=stable@host\nDEPLOY_PATH=/srv/stable\n",
    );

    expect(parseEnvFiles([baseEnvPath, modeEnvPath])).toEqual({
      DEPLOY_HOST: "stable@host",
      DEPLOY_PATH: "/srv/stable",
      COMMON: "value",
    });
  });
});
