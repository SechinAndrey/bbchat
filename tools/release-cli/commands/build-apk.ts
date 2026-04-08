import { resolve } from "node:path";
import { existsSync } from "node:fs";
import type { BuildApkOptions } from "../types.js";
import {
  logSection,
  runWrite,
  fail,
  logSuccess,
  logKeyValue,
  logWarning,
} from "../utils/runner.js";
import { parseEnvFile } from "../utils/env.js";
import { getPackageVersion } from "../utils/version.js";
import { ensureDirectory, copyFile } from "../utils/file-writer.js";

export function runBuildApk(options: BuildApkOptions): void {
  const envVars = parseEnvFile(resolve(process.cwd(), ".env"));
  const version = getPackageVersion();
  const viteMode = options.env === "stable" ? "stable" : "production";
  const outputDir = resolve(process.cwd(), "apk-output");
  const apkName = `${options.env}-${version}.apk`;
  const sourceApk = resolve(
    process.cwd(),
    "android/app/build/outputs/apk/debug/app-debug.apk",
  );
  const targetApk = resolve(outputDir, apkName);
  const uploadUrl = options.uploadUrl ?? envVars.APK_UPLOAD_URL;

  logSection("Сборка APK");
  logKeyValue("Окружение", options.env);
  logKeyValue("Vite mode", viteMode);
  logKeyValue("APK output", targetApk);

  runWrite("yarn", ["vue-tsc", "--noEmit"]);
  runWrite("yarn", ["vite", "build", "--mode", viteMode]);
  runWrite("npx", ["cap", "sync", "android"]);
  runWrite("./gradlew", ["clean", "assembleDebug"], {
    cwd: resolve(process.cwd(), "android"),
  });

  if (!existsSync(sourceApk)) {
    fail(`APK не найден: ${sourceApk}`);
  }

  ensureDirectory(outputDir);
  copyFile(sourceApk, targetApk);

  if (!options.noUpload && uploadUrl) {
    runWrite("curl", ["-sS", "-f", "-F", `file=@${targetApk}`, uploadUrl]);
    logSuccess("APK загружен");
  } else if (options.noUpload) {
    logWarning("Загрузка пропущена (флаг --no-upload)");
  } else {
    logWarning("APK_UPLOAD_URL не задан, загрузка пропущена");
  }
}
