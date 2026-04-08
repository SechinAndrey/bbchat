import { spawnSync } from "node:child_process";
import chalk from "chalk";
import { PROJECT_ROOT } from "../constants.js";
import type { RunReadOptions, RunWriteOptions } from "../types.js";

function getWidth(): number {
  return Math.max(process.stdout.columns ?? 96, 72);
}

function trimByWidth(value: string, maxLen: number): string {
  if (value.length <= maxLen) {
    return value;
  }

  if (maxLen <= 1) {
    return value.slice(0, maxLen);
  }

  return `${value.slice(0, maxLen - 1)}…`;
}

function drawLine(color = chalk.hex("#4f5d7a")): string {
  return color("─".repeat(Math.max(getWidth() - 2, 20)));
}

export function logSection(title: string): void {
  console.log(`\n${drawLine(chalk.hex("#2f6df6"))}`);
  console.log(chalk.bold.white(` ${title}`));
  console.log(drawLine(chalk.hex("#2f6df6")));
}

export function logSuccess(message: string): void {
  console.log(`${chalk.green("✔")} ${chalk.greenBright(message)}`);
}

export function logWarning(message: string): void {
  console.log(`${chalk.yellow("▲")} ${chalk.yellowBright(message)}`);
}

export function logInfo(message: string): void {
  console.log(`${chalk.cyan("•")} ${chalk.white(message)}`);
}

export function logKeyValue(label: string, value: string): void {
  const labelMax = 18;
  const paddedLabel = `${label}:`.padEnd(labelMax, " ");
  const maxValueLen = Math.max(getWidth() - labelMax - 6, 20);
  const normalized = trimByWidth(value, maxValueLen);
  console.log(`  ${chalk.gray(paddedLabel)} ${chalk.white(normalized)}`);
}

export function fail(message: string): never {
  const line = drawLine(chalk.red);
  console.error(`\n${line}`);
  console.error(chalk.red.bold(` Ошибка: ${message}`));
  console.error(line);
  process.exit(1);
}

function execute(
  command: string,
  args: string[],
  options: RunReadOptions | RunWriteOptions = {},
): string {
  const cmdString = [command, ...args].join(" ");
  const workingDir = options.cwd ?? PROJECT_ROOT;

  if (!options.capture) {
    const relCwd = workingDir === PROJECT_ROOT ? "." : workingDir;
    console.log(chalk.gray(`$ ${cmdString}`));
    console.log(chalk.gray(`  cwd: ${relCwd}`));
  }

  const result = spawnSync(command, args, {
    cwd: workingDir,
    stdio: options.capture ? "pipe" : "inherit",
    encoding: "utf-8",
    input: options.inputText,
  });

  if (result.status !== 0) {
    fail(`Команда завершилась с ошибкой (${result.status}): ${cmdString}`);
  }

  if (!options.capture) {
    return "";
  }

  // Keep leading spaces intact because git porcelain output uses them as status markers.
  return (result.stdout ?? "").replace(/[\r\n]+$/, "");
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
