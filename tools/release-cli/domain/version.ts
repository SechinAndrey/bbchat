import { PACKAGE_JSON_PATH } from "../config.js";
import { readText } from "../infra/fs.js";
import { AppError } from "../shared/errors.js";

export function getVersion(): string {
  const pkg = JSON.parse(readText(PACKAGE_JSON_PATH)) as { version: string };
  return pkg.version;
}

export function assertSemver(version: string): void {
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new AppError(`Invalid version format: ${version}. Expected X.Y.Z`);
  }
}

export function updatePackageVersion(content: string, version: string): string {
  const pkg = JSON.parse(content) as Record<string, unknown>;
  pkg.version = version;
  return `${JSON.stringify(pkg, null, 2)}\n`;
}

export function updateGradleVersion(
  content: string,
  version: string,
): { content: string; versionCode: number } {
  if (!/versionName\s+"[^"]*"/.test(content)) {
    throw new AppError("versionName was not found in android/app/build.gradle");
  }

  const withVersionName = content.replace(
    /versionName\s+"[^"]*"/,
    `versionName "${version}"`,
  );

  const match = withVersionName.match(/versionCode\s+(\d+)/);
  if (!match) {
    throw new AppError("versionCode was not found in android/app/build.gradle");
  }

  const nextCode = Number(match[1]) + 1;
  const nextContent = withVersionName.replace(
    /versionCode\s+\d+/,
    `versionCode ${nextCode}`,
  );

  return {
    content: nextContent,
    versionCode: nextCode,
  };
}
