import { runBuildApk } from "../commands/build-apk.js";
import { runDeployWeb } from "../commands/deploy-web.js";
import { runReleaseApply } from "../commands/release-apply.js";
import { runReleasePrepare } from "../commands/release-prepare.js";
import { runReleasePrepareRevert } from "../commands/release-prepare-revert.js";
import { runRollback } from "../commands/rollback.js";
import { AppError } from "../shared/errors.js";
import {
  parseBuildApk,
  parseDeployWeb,
  parseReleaseApply,
  parseReleasePrepare,
  parseReleasePrepareRevert,
  parseRollback,
} from "./args.js";
import { printHelp } from "./help.js";

function isHelp(value: string | undefined): boolean {
  return !value || value === "help" || value === "--help" || value === "-h";
}

export async function runCli(argv: string[]): Promise<void> {
  const [command, subcommand, ...rest] = argv;

  if (isHelp(command)) {
    printHelp();
    return;
  }

  if (command === "release") {
    if (subcommand === "prepare") {
      runReleasePrepare(parseReleasePrepare(rest));
      return;
    }

    if (subcommand === "prepare-revert") {
      runReleasePrepareRevert(parseReleasePrepareRevert(rest));
      return;
    }

    if (subcommand === "apply") {
      await runReleaseApply(parseReleaseApply(rest));
      return;
    }

    throw new AppError("Usage: release <prepare|prepare-revert|apply> ...");
  }

  if (command === "deploy-web") {
    runDeployWeb(
      parseDeployWeb([subcommand, ...rest].filter(Boolean) as string[]),
    );
    return;
  }

  if (command === "build-apk") {
    runBuildApk(
      parseBuildApk([subcommand, ...rest].filter(Boolean) as string[]),
    );
    return;
  }

  if (command === "rollback") {
    runRollback(
      parseRollback([subcommand, ...rest].filter(Boolean) as string[]),
    );
    return;
  }

  throw new AppError(`Unknown command: ${command}`);
}
