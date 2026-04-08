import type { BumpVersionOptions } from "../types.js";
import { logSection } from "../utils/runner.js";
import { validateVersion } from "../utils/validators.js";
import { bumpVersionInFiles } from "../utils/version.js";

export function runBumpVersion(options: BumpVersionOptions): void {
  validateVersion(options.version);
  logSection(`📝 Обновляю версию до ${options.version}`);
  bumpVersionInFiles(options.version, options.bumpCode);
}
