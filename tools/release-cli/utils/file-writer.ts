import { writeFileSync, mkdirSync, cpSync } from "node:fs";

export function writeTextFile(filePath: string, content: string): void {
  writeFileSync(filePath, content, "utf-8");
}

export function ensureDirectory(dirPath: string): void {
  mkdirSync(dirPath, { recursive: true });
}

export function copyFile(sourcePath: string, targetPath: string): void {
  cpSync(sourcePath, targetPath);
}
