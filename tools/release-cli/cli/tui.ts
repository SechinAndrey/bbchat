import prompts from "prompts";
import chalk from "chalk";
import { showHelp } from "./help.js";
import {
  runReleasePrepare,
  runReleaseApply,
  runReleaseRollbackPrepare,
  loadReleaseState,
} from "../commands/release.js";
import { runDeployWeb } from "../commands/deploy-web.js";
import { runBuildApk } from "../commands/build-apk.js";
import { runRollback } from "../commands/rollback.js";
import { runBumpVersion } from "../commands/bump-version.js";
import { getPackageVersion } from "../utils/version.js";
import { parseEnvFile } from "../utils/env.js";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

type RiskLevel = "low" | "medium" | "high";

type ActionType =
  | "help"
  | "prepare"
  | "apply"
  | "rollback-prepare"
  | "deploy"
  | "build"
  | "rollback"
  | "bump-version"
  | "exit";

type CommandSummary = {
  title: string;
  commandPreview: string;
  notes: string[];
  risk: RiskLevel;
};

function terminalWidth(): number {
  return Math.max(process.stdout.columns ?? 100, 80);
}

function divider(width = terminalWidth(), color = chalk.gray): string {
  return color("─".repeat(Math.max(width - 2, 20)));
}

function padRight(value: string, length: number): string {
  return value.length >= length
    ? value
    : `${value}${" ".repeat(length - value.length)}`;
}

function cut(value: string, limit: number): string {
  if (value.length <= limit) {
    return value;
  }

  if (limit <= 1) {
    return value.slice(0, limit);
  }

  return `${value.slice(0, limit - 1)}…`;
}

function statusBadge(
  value: string,
  tone: "green" | "yellow" | "red" | "cyan",
): string {
  const painter =
    tone === "green"
      ? chalk.bgGreen.black
      : tone === "yellow"
        ? chalk.bgYellow.black
        : tone === "red"
          ? chalk.bgRed.white
          : chalk.bgCyan.black;

  return painter(` ${value} `);
}

function riskBadge(level: RiskLevel): string {
  if (level === "high") {
    return statusBadge("HIGH RISK", "red");
  }

  if (level === "medium") {
    return statusBadge("MEDIUM RISK", "yellow");
  }

  return statusBadge("LOW RISK", "green");
}

function safeGit(args: string[]): string | null {
  const result = spawnSync("git", args, {
    cwd: process.cwd(),
    stdio: "pipe",
    encoding: "utf-8",
  });

  if (result.status !== 0) {
    return null;
  }

  return (result.stdout ?? "").trim();
}

function getGitBranch(): string {
  return safeGit(["branch", "--show-current"]) ?? "n/a";
}

function getGitDirtyStatus(): { dirty: boolean; details: string } {
  const status = safeGit(["status", "--porcelain"]);
  if (status === null) {
    return { dirty: false, details: "n/a" };
  }

  if (!status) {
    return { dirty: false, details: "clean" };
  }

  const lines = status.split("\n").filter(Boolean);
  return { dirty: true, details: `${lines.length} changed file(s)` };
}

function readDeployDefaults(): { host: string; path: string } {
  const env = parseEnvFile(resolve(process.cwd(), ".env"));
  return {
    host: env.DEPLOY_HOST ?? "not set",
    path: env.DEPLOY_PATH ?? "/var/www/bb-chat",
  };
}

function renderHeader(): void {
  const width = terminalWidth();
  const title = "BB Chat Release Console";
  const subtitle = "interactive deployment and release workflow";
  const line = divider(width, chalk.hex("#335dff"));
  const titlePadding = Math.max(Math.floor((width - title.length) / 2), 0);
  const subtitlePadding = Math.max(
    Math.floor((width - subtitle.length) / 2),
    0,
  );

  console.clear();
  console.log(line);
  console.log(`${" ".repeat(titlePadding)}${chalk.bold.white(title)}`);
  console.log(`${" ".repeat(subtitlePadding)}${chalk.gray(subtitle)}`);
  console.log(line);
}

function renderStatusBoard(lastActionMessage?: string): void {
  const version = getPackageVersion();
  const branch = getGitBranch();
  const gitState = getGitDirtyStatus();
  const releaseState = loadReleaseState();
  const deployDefaults = readDeployDefaults();
  const width = terminalWidth();
  const keyWidth = 20;
  const valueWidth = Math.max(width - keyWidth - 8, 20);

  console.log(chalk.bold("\nOverview"));
  console.log(divider(width));

  const rows: Array<[string, string]> = [
    ["Version", version],
    ["Branch", branch],
    ["Worktree", gitState.dirty ? gitState.details : "clean"],
    [
      "Release state",
      releaseState
        ? `prepared ${releaseState.version} at ${releaseState.createdAt}`
        : "none",
    ],
    ["Deploy host", deployDefaults.host],
    ["Deploy path", deployDefaults.path],
  ];

  for (const [label, rawValue] of rows) {
    const value = cut(rawValue, valueWidth);
    const labelView = chalk.gray(padRight(`${label}:`, keyWidth));
    console.log(`  ${labelView} ${chalk.white(value)}`);
  }

  if (lastActionMessage) {
    console.log(
      `\n${statusBadge("LAST ACTION", "cyan")} ${chalk.white(lastActionMessage)}`,
    );
  }

  console.log(
    `\n${chalk.gray("Keys: ↑/↓ navigate, Enter select, Esc cancel")}`,
  );
}

async function confirmAction(summary: CommandSummary): Promise<boolean> {
  console.log(`\n${chalk.bold(summary.title)} ${riskBadge(summary.risk)}`);
  console.log(chalk.gray(`$ ${summary.commandPreview}`));
  for (const note of summary.notes) {
    console.log(`  ${chalk.gray("•")} ${note}`);
  }

  const response = await prompts({
    type: "confirm",
    name: "proceed",
    message: "Continue?",
    initial: false,
  });

  return Boolean(response.proceed);
}

function isCancelled(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

async function selectAction(): Promise<ActionType> {
  const response = await prompts({
    type: "select",
    name: "action",
    message: "Choose workflow",
    choices: [
      {
        title: "Release prepare",
        description: "update version/changelog and save release state",
        value: "prepare",
      },
      {
        title: "Release apply",
        description: "create commit + tag, optionally push",
        value: "apply",
      },
      {
        title: "Release rollback-prepare",
        description: "discard local prepare changes",
        value: "rollback-prepare",
      },
      {
        title: "Deploy web",
        description: "build web app and publish release on remote host",
        value: "deploy",
      },
      {
        title: "Build APK",
        description: "android build, archive APK and optional upload",
        value: "build",
      },
      {
        title: "Rollback deploy",
        description: "point html symlink to previous or selected release",
        value: "rollback",
      },
      {
        title: "Bump version",
        description: "update version in release files without commit/tag",
        value: "bump-version",
      },
      {
        title: "Show command help",
        description: "print non-interactive command reference",
        value: "help",
      },
      {
        title: "Exit",
        description: "close release console",
        value: "exit",
      },
    ],
  });

  return (response.action as ActionType) ?? "exit";
}

async function handlePrepare(): Promise<string | null> {
  const response = await prompts([
    {
      type: "text",
      name: "version",
      message: "Version (X.Y.Z)",
      validate: (value: string) =>
        /^\d+\.\d+\.\d+$/.test(value) ? true : "Expected format X.Y.Z",
    },
    {
      type: "confirm",
      name: "skipChangelog",
      message: "Skip changelog generation?",
      initial: false,
    },
  ]);

  if (isCancelled(response.version)) {
    return "Cancelled";
  }

  const version = response.version as string;
  const skipChangelog = Boolean(response.skipChangelog);
  const confirmed = await confirmAction({
    title: "Release prepare",
    commandPreview: `yarn release prepare ${version}${skipChangelog ? " --skip-changelog" : ""}`,
    notes: [
      "Updates package.json and Android build version fields",
      skipChangelog
        ? "Changelog generation is skipped"
        : "Generates and prepends changelog",
      "Creates local release state file for apply step",
    ],
    risk: "medium",
  });

  if (!confirmed) {
    return "Release prepare skipped";
  }

  runReleasePrepare({
    version,
    skipChangelog,
  });

  return `Prepared release ${version}`;
}

async function handleApply(): Promise<string | null> {
  const response = await prompts([
    {
      type: "text",
      name: "version",
      message: "Version (X.Y.Z)",
      validate: (value: string) =>
        /^\d+\.\d+\.\d+$/.test(value) ? true : "Expected format X.Y.Z",
    },
    {
      type: "confirm",
      name: "push",
      message: "Push branch and tag to origin?",
      initial: false,
    },
  ]);

  if (isCancelled(response.version)) {
    return "Cancelled";
  }

  const version = response.version as string;
  const push = Boolean(response.push);
  const confirmed = await confirmAction({
    title: "Release apply",
    commandPreview: `yarn release apply ${version}${push ? " --push" : ""}`,
    notes: [
      "Stages release whitelist files and creates commit",
      `Creates git tag v${version}`,
      push ? "Pushes branch and tag atomically" : "Push step is skipped",
    ],
    risk: "high",
  });

  if (!confirmed) {
    return "Release apply skipped";
  }

  await runReleaseApply({
    version,
    push,
    yes: true,
  });

  return `Applied release ${version}${push ? " and pushed" : ""}`;
}

async function handleRollbackPrepare(): Promise<string | null> {
  const response = await prompts({
    type: "confirm",
    name: "yes",
    message: "Rollback local release prepare changes?",
    initial: false,
  });

  const yes = Boolean(response.yes);
  if (!yes) {
    return "Rollback-prepare skipped";
  }

  const confirmed = await confirmAction({
    title: "Release rollback-prepare",
    commandPreview: "yarn release rollback-prepare --yes",
    notes: [
      "Restores changed release files in working tree",
      "Removes saved release state if present",
    ],
    risk: "medium",
  });

  if (!confirmed) {
    return "Rollback-prepare skipped";
  }

  await runReleaseRollbackPrepare({ yes: true });
  return "Rolled back release-prepare changes";
}

async function handleDeploy(): Promise<string | null> {
  const defaults = readDeployDefaults();
  const response = await prompts([
    {
      type: "select",
      name: "mode",
      message: "Deploy mode",
      choices: [
        { title: "Stable", value: "stable" },
        { title: "Production", value: "production" },
      ],
      initial: 1,
    },
    {
      type: "text",
      name: "host",
      message: "Host (user@server)",
      initial: defaults.host === "not set" ? "" : defaults.host,
    },
    {
      type: "text",
      name: "path",
      message: "Deploy path",
      initial: defaults.path,
    },
    {
      type: "number",
      name: "keep",
      message: "How many releases keep on server",
      initial: 5,
      validate: (value: number) =>
        Number.isInteger(value) && value > 0
          ? true
          : "Expected positive integer",
    },
  ]);

  if (isCancelled(response.mode)) {
    return "Cancelled";
  }

  const mode = response.mode as "stable" | "production";
  const host = response.host as string;
  const path = response.path as string;
  const keep = response.keep as number;
  const confirmed = await confirmAction({
    title: "Deploy web",
    commandPreview: `yarn deploy:web --mode ${mode} --host ${host} --path ${path} --keep ${keep}`,
    notes: [
      "Runs typecheck and Vite build before upload",
      "Uploads dist via rsync to remote releases directory",
      "Switches html symlink and prunes old releases",
    ],
    risk: "high",
  });

  if (!confirmed) {
    return "Deploy skipped";
  }

  runDeployWeb({
    mode,
    keep,
    host,
    path,
  });

  return `Deploy completed for ${mode}`;
}

async function handleBuildApk(): Promise<string | null> {
  const response = await prompts([
    {
      type: "select",
      name: "env",
      message: "Build environment",
      choices: [
        { title: "Stable", value: "stable" },
        { title: "Production", value: "prod" },
      ],
    },
    {
      type: "confirm",
      name: "noUpload",
      message: "Skip APK upload?",
      initial: false,
    },
    {
      type: (prev: boolean) => (prev ? null : "text"),
      name: "uploadUrl",
      message: "Upload URL (optional, overrides .env)",
      initial: "",
    },
  ]);

  if (isCancelled(response.env)) {
    return "Cancelled";
  }

  const env = response.env as "stable" | "prod";
  const noUpload = Boolean(response.noUpload);
  const uploadUrl = (response.uploadUrl as string) || undefined;
  const confirmed = await confirmAction({
    title: "Build APK",
    commandPreview: `yarn build:apk ${env}${noUpload ? " --no-upload" : uploadUrl ? ` --upload-url ${uploadUrl}` : ""}`,
    notes: [
      "Runs web build and Capacitor sync",
      "Builds Android debug APK with Gradle",
      noUpload
        ? "Upload is disabled"
        : uploadUrl
          ? "Uploads APK to provided URL"
          : "Tries APK_UPLOAD_URL from .env",
    ],
    risk: "medium",
  });

  if (!confirmed) {
    return "Build APK skipped";
  }

  runBuildApk({ env, noUpload, uploadUrl });
  return `APK build completed for ${env}`;
}

async function handleRollback(): Promise<string | null> {
  const defaults = readDeployDefaults();
  const response = await prompts([
    {
      type: "text",
      name: "version",
      message: "Rollback target version (empty = previous release)",
      initial: "",
    },
    {
      type: "text",
      name: "host",
      message: "Host (user@server)",
      initial: defaults.host === "not set" ? "" : defaults.host,
    },
    {
      type: "text",
      name: "path",
      message: "Deploy path",
      initial: defaults.path,
    },
  ]);

  const version = (response.version as string) || undefined;
  const host = response.host as string;
  const path = response.path as string;

  if (isCancelled(response.host)) {
    return "Cancelled";
  }

  const confirmed = await confirmAction({
    title: "Rollback deploy",
    commandPreview: `yarn rollback${version ? ` ${version}` : ""} --host ${host} --path ${path}`,
    notes: [
      "Updates remote html symlink to previous or selected release",
      "Does not rebuild, only switches active release",
    ],
    risk: "high",
  });

  if (!confirmed) {
    return "Rollback skipped";
  }

  runRollback({ version, host, path });
  return `Rollback completed${version ? ` to ${version}` : ""}`;
}

async function handleBumpVersion(): Promise<string | null> {
  const response = await prompts([
    {
      type: "text",
      name: "version",
      message: "Version (X.Y.Z)",
      validate: (value: string) =>
        /^\d+\.\d+\.\d+$/.test(value) ? true : "Expected format X.Y.Z",
    },
    {
      type: "confirm",
      name: "bumpCode",
      message: "Increase Android versionCode?",
      initial: true,
    },
  ]);

  if (isCancelled(response.version)) {
    return "Cancelled";
  }

  const version = response.version as string;
  const bumpCode = Boolean(response.bumpCode);
  const confirmed = await confirmAction({
    title: "Bump version",
    commandPreview: `yarn bump-version ${version}${bumpCode ? " --bump-code" : ""}`,
    notes: [
      "Updates release version in package.json and Android gradle file",
      bumpCode
        ? "Android versionCode will be incremented"
        : "Android versionCode is unchanged",
      "No git commit or tag is created",
    ],
    risk: "low",
  });

  if (!confirmed) {
    return "Bump version skipped";
  }

  runBumpVersion({ version, bumpCode });
  return `Version bumped to ${version}`;
}

export async function runTui(): Promise<void> {
  let lastActionMessage = "Session started";

  // eslint-disable-next-line no-constant-condition
  while (true) {
    renderHeader();
    renderStatusBoard(lastActionMessage);

    const action = await selectAction();

    if (action === "exit") {
      console.log(`\n${chalk.gray("Release console closed")}`);
      return;
    }

    if (action === "help") {
      renderHeader();
      showHelp();
      lastActionMessage = "Help shown";
      continue;
    }

    if (action === "prepare") {
      const result = await handlePrepare();
      if (result) {
        lastActionMessage = result;
      }
      continue;
    }

    if (action === "apply") {
      const result = await handleApply();
      if (result) {
        lastActionMessage = result;
      }
      continue;
    }

    if (action === "rollback-prepare") {
      const result = await handleRollbackPrepare();
      if (result) {
        lastActionMessage = result;
      }
      continue;
    }

    if (action === "deploy") {
      const result = await handleDeploy();
      if (result) {
        lastActionMessage = result;
      }
      continue;
    }

    if (action === "build") {
      const result = await handleBuildApk();
      if (result) {
        lastActionMessage = result;
      }
      continue;
    }

    if (action === "rollback") {
      const result = await handleRollback();
      if (result) {
        lastActionMessage = result;
      }
      continue;
    }

    if (action === "bump-version") {
      const result = await handleBumpVersion();
      if (result) {
        lastActionMessage = result;
      }
      continue;
    }
  }
}
