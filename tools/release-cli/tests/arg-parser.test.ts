import { afterEach, describe, expect, it, vi } from "vitest";
import {
  normalizeBuildApkOptions,
  normalizeDeployOptions,
  normalizeReleaseApply,
  normalizeReleaseRollbackPrepare,
} from "../cli/arg-parser.js";

function mockProcessExit(): void {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(process, "exit").mockImplementation((() => {
    throw new Error("process.exit");
  }) as never);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("normalizeDeployOptions", () => {
  it("parses validated deploy flags", () => {
    expect(
      normalizeDeployOptions([
        "--host",
        "user@example.com",
        "--path",
        "/var/www/bb-chat",
        "--mode",
        "stable",
        "--keep",
        "10",
      ]),
    ).toEqual({
      host: "user@example.com",
      path: "/var/www/bb-chat",
      mode: "stable",
      keep: 10,
    });
  });

  it("fails when option value is missing", () => {
    mockProcessExit();

    expect(() =>
      normalizeDeployOptions(["--host", "--mode", "production"]),
    ).toThrow("process.exit");
  });

  it("fails for invalid keep value", () => {
    mockProcessExit();

    expect(() => normalizeDeployOptions(["--keep", "0"])).toThrow(
      "process.exit",
    );
  });

  it("fails for invalid mode value", () => {
    mockProcessExit();

    expect(() => normalizeDeployOptions(["--mode", "qa"])).toThrow(
      "process.exit",
    );
  });

  it("fails when path value is missing", () => {
    mockProcessExit();

    expect(() =>
      normalizeDeployOptions(["--path", "--mode", "stable"]),
    ).toThrow("process.exit");
  });

  it("fails for non-numeric keep value", () => {
    mockProcessExit();

    expect(() => normalizeDeployOptions(["--keep", "abc"])).toThrow(
      "process.exit",
    );
  });

  it("fails for unknown flag", () => {
    mockProcessExit();

    expect(() => normalizeDeployOptions(["--unknown", "x"])).toThrow(
      "process.exit",
    );
  });
});

describe("normalizeBuildApkOptions", () => {
  it("normalizes production alias to prod", () => {
    expect(normalizeBuildApkOptions(["production", "--no-upload"])).toEqual({
      env: "prod",
      noUpload: true,
      uploadUrl: undefined,
    });
  });
});

describe("normalizeReleaseApply", () => {
  it("parses push and yes flags", () => {
    expect(normalizeReleaseApply(["1.2.3", "--push", "--yes"])).toEqual({
      version: "1.2.3",
      push: true,
      yes: true,
    });
  });

  it("fails for unknown flag", () => {
    mockProcessExit();

    expect(() => normalizeReleaseApply(["1.2.3", "--force"])).toThrow(
      "process.exit",
    );
  });
});

describe("normalizeReleaseRollbackPrepare", () => {
  it("parses yes flag", () => {
    expect(normalizeReleaseRollbackPrepare(["--yes"])).toEqual({
      yes: true,
    });
  });

  it("fails when non-option arg is provided", () => {
    mockProcessExit();

    expect(() => normalizeReleaseRollbackPrepare(["1.2.3"])).toThrow(
      "process.exit",
    );
  });
});
