import type { BumpVersionOptions } from "../types.js";
import { logSection, logKeyValue, logSuccess } from "../utils/runner.js";
import { validateVersion } from "../utils/validators.js";
import { bumpVersionInFiles } from "../utils/version.js";

export function runBumpVersion(options: BumpVersionOptions): void {
  validateVersion(options.version);
  logSection("Bump version");
  logKeyValue("Version", options.version);
  logKeyValue("Bump Android code", options.bumpCode ? "yes" : "no");
  bumpVersionInFiles(options.version, options.bumpCode);
  logSuccess("Версия обновлена");
}
