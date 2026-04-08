import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { parseEnvFile } from "../utils/env.js";

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("parseEnvFile", () => {
  it("parses plain and quoted values", () => {
    const dir = mkdtempSync(join(tmpdir(), "bb-chat-env-"));
    tempDirs.push(dir);

    const envPath = join(dir, ".env");
    writeFileSync(
      envPath,
      [
        "DEPLOY_HOST=user@example.com",
        'DEPLOY_PATH="/var/www/bb-chat"',
        "APK_UPLOAD_URL='https://example.com/upload'",
        "# comment",
        "",
      ].join("\n"),
      "utf-8",
    );

    expect(parseEnvFile(envPath)).toEqual({
      DEPLOY_HOST: "user@example.com",
      DEPLOY_PATH: "/var/www/bb-chat",
      APK_UPLOAD_URL: "https://example.com/upload",
    });
  });
});