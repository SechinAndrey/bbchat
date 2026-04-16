import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";

export function fileExists(path: string): boolean {
  return existsSync(path);
}

export function readText(path: string): string {
  return readFileSync(path, "utf-8");
}

export function writeText(path: string, content: string): void {
  writeFileSync(path, content, "utf-8");
}

export function deleteFile(path: string): void {
  if (existsSync(path)) {
    unlinkSync(path);
  }
}

export function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

export function copyFile(source: string, target: string): void {
  cpSync(source, target);
}
