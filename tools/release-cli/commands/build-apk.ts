import { resolve } from "node:path";
import { getVersion } from "../domain/version.js";
import { loadEnv } from "../infra/env.js";
import { copyFile, ensureDir, fileExists } from "../infra/fs.js";
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

export function runBuildApk(input: BuildApkInput): void {
  logStart("build-apk");

  const env = loadEnv(input.env);
  const version = getVersion();
  const outputDir = resolve(process.cwd(), "apk-output");
  const targetName = `${input.env}_${version}.apk`;
  const sourceApk = resolve(
    process.cwd(),
    "android/app/build/outputs/apk/debug/app-debug.apk",
  );
  const targetApk = resolve(outputDir, targetName);
  const uploadUrl = input.uploadUrl ?? env.APK_UPLOAD_URL;
  const uploadToken = env.APK_UPLOAD_TOKEN;

  logStep("build web + android");
  run("yarn", ["vue-tsc", "--noEmit"]);
  run("yarn", ["vite", "build", "--mode", input.env]);
  run("npx", ["cap", "sync", "android"]);
  run("./gradlew", ["--stop"], {
    cwd: resolve(process.cwd(), "android"),
  });
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
    if (!uploadToken) {
      throw new AppError("APK_UPLOAD_TOKEN is not set");
    }

    logStep("upload apk");
    run("curl", [
      "-sS",
      "-f",
      "-H",
      `Communicator-Upload-Token: ${uploadToken}`,
      "-F",
      `name=${targetName}`,
      "-F",
      `version=${version}`,
      "-F",
      `communicator_file=@${targetApk}`,
      uploadUrl,
    ]);
    logOk("apk uploaded");
  } else if (input.noUpload) {
    logWarn("upload skipped: --no-upload flag");
  } else {
    logWarn("upload skipped: APK_UPLOAD_URL is not set");
  }

  logResult(`apk ready: ${targetName}`);
}
