import { fail } from "./runner.js";

export function validateVersion(version: string): void {
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    fail(`Версия должна быть в формате X.Y.Z, получено: ${version}`);
  }
}
