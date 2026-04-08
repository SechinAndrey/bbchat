import { spawnSync } from "node:child_process";
import chalk from "chalk";
import { PROJECT_ROOT } from "../constants.js";
import type { RunReadOptions, RunWriteOptions } from "../types.js";

export function logSection(title: string): void {
  console.log(`\n${chalk.bgBlueBright.black(` ${title} `)}`);
}

export function logSuccess(message: string): void {
  console.log(chalk.green(`✓ ${message}`));
}

export function logWarning(message: string): void {
  console.log(chalk.yellow(`⚠ ${message}`));
}

export function logInfo(message: string): void {
  console.log(chalk.blue(`ℹ ${message}`));
}

export function fail(message: string): never {
  console.error(chalk.red.bold(`✗ Ошибка: ${message}`));
  process.exit(1);
}

function execute(
  command: string,
  args: string[],
  options: RunReadOptions | RunWriteOptions = {},
): string {
  const cmdString = [command, ...args].join(" ");

  const result = spawnSync(command, args, {
    cwd: options.cwd ?? PROJECT_ROOT,
    stdio: options.capture ? "pipe" : "inherit",
    encoding: "utf-8",
    input: options.inputText,
  });

  if (result.status !== 0) {
    fail(`Команда завершилась с ошибкой (${result.status}): ${cmdString}`);
  }

  return options.capture ? (result.stdout ?? "").trim() : "";
}

export function runRead(
  command: string,
  args: string[],
  options: RunReadOptions = {},
): string {
  return execute(command, args, options);
}

export function runWrite(
  command: string,
  args: string[],
  options: RunWriteOptions = {},
): string {
  return execute(command, args, options);
}
