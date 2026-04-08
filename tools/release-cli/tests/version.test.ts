import { describe, expect, it } from "vitest";
import { vi, afterEach } from "vitest";
import {
  updateGradleVersionContent,
  updatePackageVersionContent,
} from "../utils/version.js";

afterEach(() => {
  vi.restoreAllMocks();
});

function mockProcessExit(): void {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(process, "exit").mockImplementation((() => {
    throw new Error("process.exit");
  }) as never);
}

describe("updatePackageVersionContent", () => {
  it("updates package version and keeps pretty JSON", () => {
    const content = JSON.stringify(
      { name: "bb-chat", version: "0.8.1" },
      null,
      2,
    );

    expect(updatePackageVersionContent(content, "0.9.0")).toBe(
      '{\n  "name": "bb-chat",\n  "version": "0.9.0"\n}\n',
    );
  });
});

describe("updateGradleVersionContent", () => {
  it("updates versionName and increments versionCode", () => {
    const gradle = [
      "defaultConfig {",
      "    versionCode 42",
      '    versionName "0.8.1"',
      "}",
    ].join("\n");

    expect(updateGradleVersionContent(gradle, "0.9.0", true)).toEqual({
      content: [
        "defaultConfig {",
        "    versionCode 43",
        '    versionName "0.9.0"',
        "}",
      ].join("\n"),
      versionCode: 43,
    });
  });

  it("updates only versionName when bumpCode is disabled", () => {
    const gradle = 'versionCode 5\nversionName "0.8.1"';

    expect(updateGradleVersionContent(gradle, "0.9.0", false)).toEqual({
      content: 'versionCode 5\nversionName "0.9.0"',
    });
  });

  it("fails when versionName is missing", () => {
    mockProcessExit();

    expect(() =>
      updateGradleVersionContent("versionCode 5", "0.9.0", false),
    ).toThrow("process.exit");
  });

  it("fails when versionCode is missing and bumpCode is enabled", () => {
    mockProcessExit();

    expect(() =>
      updateGradleVersionContent('versionName "0.8.1"', "0.9.0", true),
    ).toThrow("process.exit");
  });
});