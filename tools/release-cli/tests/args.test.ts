import { describe, expect, it } from "vitest";
import {
  parseBuildApk,
  parseDeployWeb,
  parseReleaseApply,
  parseReleasePrepare,
  parseReleasePrepareRevert,
} from "../cli/args.js";

describe("cli arg parser", () => {
  it("parses release prepare", () => {
    expect(parseReleasePrepare(["1.2.3"])).toEqual({ version: "1.2.3" });
  });

  it("parses release prepare-revert", () => {
    expect(parseReleasePrepareRevert(["1.2.3"])).toEqual({ version: "1.2.3" });
  });

  it("parses release apply flags", () => {
    expect(parseReleaseApply(["1.2.3", "--push", "--yes"])).toEqual({
      version: "1.2.3",
      push: true,
      yes: true,
    });
  });

  it("parses release apply without version", () => {
    expect(parseReleaseApply(["--push"])).toEqual({
      version: undefined,
      push: true,
      yes: false,
    });
  });

  it("parses deploy-web", () => {
    expect(
      parseDeployWeb([
        "--mode",
        "stable",
        "--host",
        "user@host",
        "--path",
        "/srv/app",
        "--keep",
        "7",
      ]),
    ).toEqual({
      mode: "stable",
      host: "user@host",
      path: "/srv/app",
      keep: 7,
    });
  });

  it("parses build-apk", () => {
    expect(parseBuildApk(["production", "--no-upload"])).toEqual({
      env: "production",
      noUpload: true,
      uploadUrl: undefined,
    });
  });
});
