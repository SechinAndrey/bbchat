import { readFileSync } from "node:fs";
import { PACKAGE_JSON_PATH, GRADLE_PATH } from "../constants.js";
import { fail, logSuccess } from "./runner.js";
import { writeTextFile } from "./file-writer.js";

export function getPackageVersion(): string {
  const pkg = JSON.parse(readFileSync(PACKAGE_JSON_PATH, "utf-8")) as {
    version: string;
  };
  return pkg.version;
}

export function updatePackageVersionContent(
  content: string,
  version: string,
): string {
  const pkg = JSON.parse(content) as Record<string, unknown>;
  pkg.version = version;

  return `${JSON.stringify(pkg, null, 2)}\n`;
}

export function updateGradleVersionContent(
  content: string,
  version: string,
  bumpCode: boolean,
): { content: string; versionCode?: number } {
  if (!/versionName\s+"[^"]*"/.test(content)) {
    fail("Не удалось найти versionName в android/app/build.gradle");
  }

  let nextContent = content.replace(
    /versionName\s+"[^"]*"/,
    `versionName "${version}"`,
  );

  if (!bumpCode) {
    return { content: nextContent };
  }

  const match = nextContent.match(/versionCode\s+(\d+)/);
  if (!match) {
    fail("Не удалось найти versionCode в android/app/build.gradle");
  }

  const versionCode = Number(match[1]) + 1;
  nextContent = nextContent.replace(
    /versionCode\s+\d+/,
    `versionCode ${versionCode}`,
  );

  return { content: nextContent, versionCode };
}

export function bumpVersionInFiles(version: string, bumpCode: boolean): void {
  writeTextFile(
    PACKAGE_JSON_PATH,
    updatePackageVersionContent(
      readFileSync(PACKAGE_JSON_PATH, "utf-8"),
      version,
    ),
  );
  logSuccess("Обновлён package.json");

  const gradleUpdate = updateGradleVersionContent(
    readFileSync(GRADLE_PATH, "utf-8"),
    version,
    bumpCode,
  );

  if (typeof gradleUpdate.versionCode === "number") {
    logSuccess(
      `Обновлён android/app/build.gradle (versionCode=${gradleUpdate.versionCode})`,
    );
  } else {
    logSuccess("Обновлён android/app/build.gradle");
  }

  writeTextFile(GRADLE_PATH, gradleUpdate.content);
}
