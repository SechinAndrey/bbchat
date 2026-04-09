import { resolve } from "node:path";
import { ENV_PATH, PACKAGE_JSON_PATH } from "../config.js";
import { parseEnvFile } from "../infra/env.js";
import { copyFile, ensureDir, fileExists, readText } from "../infra/fs.js";
import { run } from "../infra/run.js";
import { AppError } from "../shared/errors.js";
import {
  logOk,
  logResult,
  logStart,
  logStep,
  logWarn,
} from "../shared/logger.js";
import type { BuildApkInput } from "../types.js";

function getVersion(): string {
  const pkg = JSON.parse(readText(PACKAGE_JSON_PATH)) as { version: string };
  return pkg.version;
}

export function runBuildApk(input: BuildApkInput): void {
  logStart("build-apk");

  const env = parseEnvFile(ENV_PATH);
  const mode = input.env === "stable" ? "stable" : "production";
  const version = getVersion();
  const outputDir = resolve(process.cwd(), "apk-output");
  const targetName = `${input.env}-${version}.apk`;
  const sourceApk = resolve(
    process.cwd(),
    "android/app/build/outputs/apk/debug/app-debug.apk",
  );
  const targetApk = resolve(outputDir, targetName);
  const uploadUrl = input.uploadUrl ?? env.APK_UPLOAD_URL;

  logStep("build web + android");
  run("yarn", ["vue-tsc", "--noEmit"]);
  run("yarn", ["vite", "build", "--mode", mode]);
  run("npx", ["cap", "sync", "android"]);
  run("./gradlew", ["clean", "assembleDebug"], {
    cwd: resolve(process.cwd(), "android"),
  });
  logOk("android build completed");

  if (!fileExists(sourceApk)) {
    throw new AppError(`APK file not found: ${sourceApk}`);
  }

  logStep("archive apk");
  ensureDir(outputDir);
  copyFile(sourceApk, targetApk);
  logOk(`apk saved to ${targetApk}`);

  if (!input.noUpload && uploadUrl) {
    logStep("upload apk");
    run("curl", ["-sS", "-f", "-F", `file=@${targetApk}`, uploadUrl]);
    logOk("apk uploaded");
  } else if (input.noUpload) {
    logWarn("upload skipped: --no-upload flag");
  } else {
    logWarn("upload skipped: APK_UPLOAD_URL is not set");
  }

  logResult(`apk ready: ${targetName}`);
}
