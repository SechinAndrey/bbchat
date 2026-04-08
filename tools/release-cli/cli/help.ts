import chalk from "chalk";

export function showHelp(): void {
  const cmd = (value: string) => chalk.cyan(value);
  const arg = (value: string) => chalk.yellow(value);
  const opt = (value: string) => chalk.gray(value);

  console.log(`
${chalk.bold("release-cli команды:")}

1) ${cmd("release prepare")} ${arg("<version>")} ${opt("[--skip-changelog]")}
2) ${cmd("release apply")} ${arg("<version>")} ${opt("[--push]")} ${opt("[--yes]")}
3) ${cmd("release rollback-prepare")} ${opt("[--yes]")}
4) ${cmd("deploy-web")} ${opt("[--host user@server]")} ${opt("[--path /var/www/bb-chat]")} ${opt("[--mode stable|production]")} ${opt("[--keep 5]")}
5) ${cmd("build-apk")} ${arg("<stable|prod>")} ${opt("[--no-upload]")} ${opt("[--upload-url URL]")}
6) ${cmd("rollback")} ${opt("[version]")} ${opt("[--host user@server]")} ${opt("[--path /var/www/bb-chat]")}
7) ${cmd("bump-version")} ${arg("<version>")} ${opt("[--bump-code]")}
8) ${cmd("tui")}
`);
}
