import chalk from "chalk";

export function showHelp(): void {
  const cmd = (value: string) => chalk.cyanBright(value);
  const arg = (value: string) => chalk.yellow(value);
  const opt = (value: string) => chalk.gray(value);
  const section = (value: string) => chalk.bold.white(value);
  const line = chalk.gray(
    "─".repeat(Math.max((process.stdout.columns ?? 100) - 2, 20)),
  );

  console.log(`\n${section("Release CLI")}`);
  console.log(
    chalk.gray(
      "Interactive and scriptable workflow for release, deploy and rollback.",
    ),
  );
  console.log(line);

  console.log(`\n${section("Release Flow")}`);
  console.log(
    `1) ${cmd("release prepare")} ${arg("<version>")} ${opt("[--skip-changelog]")}`,
  );
  console.log(chalk.gray("   Prepare release files and save release state."));
  console.log(
    `2) ${cmd("release apply")} ${arg("<version>")} ${opt("[--push]")} ${opt("[--yes]")}`,
  );
  console.log(
    chalk.gray("   Create commit/tag and optionally push to origin."),
  );
  console.log(`3) ${cmd("release rollback-prepare")} ${opt("[--yes]")}`);
  console.log(chalk.gray("   Restore local files changed by prepare step."));

  console.log(`\n${section("Delivery")}`);
  console.log(
    `4) ${cmd("deploy-web")} ${opt("[--host user@server]")} ${opt("[--path /var/www/bb-chat]")} ${opt("[--mode stable|production]")} ${opt("[--keep 5]")}`,
  );
  console.log(
    chalk.gray("   Build web app and publish release to remote server."),
  );
  console.log(
    `5) ${cmd("build-apk")} ${arg("<stable|prod>")} ${opt("[--no-upload]")} ${opt("[--upload-url URL]")}`,
  );
  console.log(chalk.gray("   Build Android APK and optionally upload it."));

  console.log(`\n${section("Recovery And Utilities")}`);
  console.log(
    `6) ${cmd("rollback")} ${opt("[version]")} ${opt("[--host user@server]")} ${opt("[--path /var/www/bb-chat]")}`,
  );
  console.log(
    chalk.gray(
      "   Switch active deploy symlink to previous or selected release.",
    ),
  );
  console.log(
    `7) ${cmd("bump-version")} ${arg("<version>")} ${opt("[--bump-code]")}`,
  );
  console.log(
    chalk.gray("   Update release version values without git operations."),
  );
  console.log(`8) ${cmd("tui")}`);
  console.log(chalk.gray("   Start interactive release console."));

  console.log(`\n${section("Examples")}`);
  console.log(`${cmd("yarn release prepare 1.4.0")}`);
  console.log(`${cmd("yarn release apply 1.4.0 --push")}`);
  console.log(`${cmd("yarn deploy:web --mode production --keep 7")}`);
  console.log(`${cmd("yarn rollback 1.3.9")}`);
}
