import { run } from "./run.js";

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}

export function runRemote(host: string, command: string): void {
  run("ssh", [host, command]);
}

export function runRemoteCapture(host: string, command: string): string {
  return run("ssh", [host, command], { capture: true });
}

export function canWriteRemote(host: string, path: string): boolean {
  try {
    run("ssh", [host, `test -w ${shellQuote(path)}`], { capture: true });
    return true;
  } catch {
    return false;
  }
}

export function q(value: string): string {
  return shellQuote(value);
}
