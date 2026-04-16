import { resolve } from "node:path";
import { getVersion } from "../domain/version.js";
import { loadEnv } from "../infra/env.js";
import { copyFile, ensureDir, fileExists } from "../infra/fs.js";
import { getCurrentBranch } from "../infra/git.js";
import { run } from "../infra/run.js";
import { AppError } from "../shared/errors.js";
import { tuiDone, tuiStatus, tuiStep, tuiBanner } from "../shared/tui.js";
import type { BuildApkInput } from "../types.js";

export function runBuildApk(input: BuildApkInput): void {
  tuiBanner("Release CLI", "build-apk", {
    version: getVersion(),
    branch: getCurrentBranch(),
  });

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

  tuiStep("build web + android");
  run("yarn", ["vue-tsc", "--noEmit"]);
  run("yarn", ["vite", "build", "--mode", input.env]);
  run("npx", ["cap", "sync", "android"]);
  run("./gradlew", ["--stop"], {
    cwd: resolve(process.cwd(), "android"),
  });
  run("./gradlew", ["clean", "assembleDebug"], {
    cwd: resolve(process.cwd(), "android"),
  });
  tuiStatus("android build completed", "success");

  if (!fileExists(sourceApk)) {
    throw new AppError(`APK file not found: ${sourceApk}`);
  }

  tuiStep("archive apk");
  ensureDir(outputDir);
  copyFile(sourceApk, targetApk);
  tuiStatus(`apk saved to ${targetApk}`, "success");

  if (!input.noUpload && uploadUrl) {
    if (!uploadToken) {
      throw new AppError("APK_UPLOAD_TOKEN is not set");
    }

    tuiStep("upload apk");
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
    tuiStatus("apk uploaded", "success");
  } else if (input.noUpload) {
    tuiStatus("upload skipped: --no-upload flag", "warning");
  } else {
    tuiStatus("upload skipped: APK_UPLOAD_URL is not set", "warning");
  }

  tuiDone(`apk ready: ${targetName}`);
}
