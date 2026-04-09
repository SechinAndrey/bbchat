import { describe, expect, it } from "vitest";
import {
  assertSemver,
  updateGradleVersion,
  updatePackageVersion,
} from "../domain/version.js";

describe("version domain", () => {
  it("updates package version", () => {
    const content = '{\n  "name": "bb-chat",\n  "version": "0.8.3"\n}\n';
    expect(updatePackageVersion(content, "0.9.0")).toContain(
      '"version": "0.9.0"',
    );
  });

  it("updates gradle version and increments versionCode", () => {
    const gradle = 'versionCode 11\nversionName "0.8.3"';
    const updated = updateGradleVersion(gradle, "0.9.0");
    expect(updated.versionCode).toBe(12);
    expect(updated.content).toContain('versionName "0.9.0"');
  });

  it("accepts valid semver", () => {
    expect(() => assertSemver("1.2.3")).not.toThrow();
  });

  it("rejects invalid semver", () => {
    expect(() => assertSemver("1.2")).toThrow();
  });
});
