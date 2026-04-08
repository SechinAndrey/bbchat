#!/usr/bin/env node
import {
  runReleasePrepare,
  runReleaseApply,
  runReleaseRollbackPrepare,
} from "./release-cli/commands/release.js";
import { runDeployWeb } from "./release-cli/commands/deploy-web.js";
import { runBuildApk } from "./release-cli/commands/build-apk.js";
import { runRollback } from "./release-cli/commands/rollback.js";
import { runBumpVersion } from "./release-cli/commands/bump-version.js";
import { runTui } from "./release-cli/cli/tui.js";
import { showHelp } from "./release-cli/cli/help.js";
import {
  normalizeDeployOptions,
  normalizeBuildApkOptions,
  normalizeRollbackOptions,
  normalizeReleasePrepare,
  normalizeReleaseApply,
  normalizeReleaseRollbackPrepare,
  normalizeBumpVersion,
} from "./release-cli/cli/arg-parser.js";
import { fail } from "./release-cli/utils/runner.js";

async function main(): Promise<void> {
  const [, , command, subcommand, ...rest] = process.argv;

  if (
    !command ||
    command === "help" ||
    command === "--help" ||
    command === "-h"
  ) {
    showHelp();
    return;
  }

  if (command === "release") {
    if (subcommand === "prepare") {
      runReleasePrepare(normalizeReleasePrepare(rest));
      return;
    }

    if (subcommand === "apply") {
      await runReleaseApply(normalizeReleaseApply(rest));
      return;
    }

    if (subcommand === "rollback-prepare") {
      await runReleaseRollbackPrepare(normalizeReleaseRollbackPrepare(rest));
      return;
    }

    fail("Использование: release <prepare|apply|rollback-prepare> ...");
  }

  if (command === "deploy-web") {
    runDeployWeb(
      normalizeDeployOptions([subcommand, ...rest].filter(Boolean) as string[]),
    );
    return;
  }

  if (command === "build-apk") {
    runBuildApk(
      normalizeBuildApkOptions(
        [subcommand, ...rest].filter(Boolean) as string[],
      ),
    );
    return;
  }

  if (command === "rollback") {
    runRollback(
      normalizeRollbackOptions(
        [subcommand, ...rest].filter(Boolean) as string[],
      ),
    );
    return;
  }

  if (command === "bump-version") {
    runBumpVersion(
      normalizeBumpVersion([subcommand, ...rest].filter(Boolean) as string[]),
    );
    return;
  }

  if (command === "tui") {
    await runTui();
    return;
  }

  fail(`Неизвестная команда: ${command}`);
}

main().catch((error: unknown) => {
  console.error("Необработанная ошибка:", error);
  process.exit(1);
});
