import { runWrite } from "./runner.js";

export function runRemoteScript(
  host: string,
  script: string,
  args: string[] = [],
): void {
  runWrite("ssh", [host, "bash", "-s", "--", ...args], {
    inputText: script,
  });
}
