import { spawnSync } from "node:child_process";
import { AppError } from "../shared/errors.js";

type RunOptions = {
  cwd?: string;
  capture?: boolean;
  input?: string;
  verbose?: boolean;
};

function stringifyCommand(command: string, args: string[]): string {
  return [command, ...args].join(" ");
}

export function run(
  command: string,
  args: string[],
  options: RunOptions = {},
): string {
  const commandText = stringifyCommand(command, args);
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: "utf-8",
    stdio: options.capture ? "pipe" : "inherit",
    input: options.input,
  });

  if (result.status !== 0) {
    const details = (result.stderr ?? "").trim();
    const suffix = details ? `\n${details}` : "";
    throw new AppError(`Command failed: ${commandText}${suffix}`);
  }

  if (options.verbose) {
    console.log(`INFO: command ok -> ${commandText}`);
  }

  if (!options.capture) {
    return "";
  }

  return (result.stdout ?? "").replace(/[\r\n]+$/, "");
}
