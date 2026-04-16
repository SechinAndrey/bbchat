import { dirname } from "node:path";
import { RELEASE_STATE_PATH } from "../config.js";
import {
  deleteFile,
  ensureDir,
  fileExists,
  readText,
  writeText,
} from "../infra/fs.js";
import type { ReleaseState } from "../types.js";

export function saveReleaseState(
  version: string,
  files: string[],
  baseline: Record<string, string | null>,
): void {
  const state: ReleaseState = {
    version,
    files,
    baseline,
    createdAt: new Date().toISOString(),
  };
  ensureDir(dirname(RELEASE_STATE_PATH));
  writeText(RELEASE_STATE_PATH, `${JSON.stringify(state, null, 2)}\n`);
}

export function loadReleaseState(): ReleaseState | null {
  if (!fileExists(RELEASE_STATE_PATH)) {
    return null;
  }

  try {
    return JSON.parse(readText(RELEASE_STATE_PATH)) as ReleaseState;
  } catch {
    return null;
  }
}

export function clearReleaseState(): void {
  deleteFile(RELEASE_STATE_PATH);
}
