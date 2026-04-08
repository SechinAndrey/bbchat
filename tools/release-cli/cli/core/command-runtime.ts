import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { RELEASE_STATE_PATH, RELEASE_WHITELIST } from "../../constants.js";
import { getPackageVersion } from "../../utils/version.js";
import { parseEnvFile } from "../../utils/env.js";
import type { CommandMeta, EventBlock, LogEvent, RuntimeStep } from "./types.js";

type RuntimeData = {
  steps: RuntimeStep[];
  blocks: EventBlock[];
  logs: LogEvent[];
  currentStepTitle: string;
  status: "running" | "done" | "failed";
};

function safeGit(args: string[]): string {
  const out = spawnSync("git", args, {
    cwd: process.cwd(),
    stdio: "pipe",
    encoding: "utf-8",
  });

  if (out.status !== 0) {
    return "";
  }

  return (out.stdout ?? "").trim();
}

function getChangedFiles(): string[] {
  const raw = safeGit(["status", "--porcelain"]);
  if (!raw) {
    return [];
  }

  return raw
    .split("\n")
    .map((line) => line.slice(3).trim())
    .filter(Boolean);
}

function getReleaseStateLabel(): string {
  if (!existsSync(RELEASE_STATE_PATH)) {
    return "none";
  }

  try {
    const parsed = JSON.parse(readFileSync(RELEASE_STATE_PATH, "utf-8")) as {
      version?: string;
      createdAt?: string;
    };
    if (parsed.version) {
      return parsed.version;
    }
  } catch {
    return "prepared";
  }

  return "prepared";
}

function getGitContextLines(): string[] {
  const latestTag = safeGit(["tag", "--sort=-creatordate"]).split("\n")[0];
  const commitsSince = latestTag
    ? safeGit(["rev-list", "--count", `${latestTag}..HEAD`]) || "0"
    : safeGit(["rev-list", "--count", "HEAD"]) || "0";
  const recent = (safeGit(["log", "--oneline", "-n", "5"]) || "")
    .split("\n")
    .filter(Boolean);

  const caption = latestTag
    ? `Коммітів з моменту ${latestTag}: ${commitsSince}`
    : `Коммітів у гілці: ${commitsSince}`;

  return [caption, ...recent];
}

function mapSteps(command: CommandMeta): RuntimeStep[] {
  return command.steps.map((title, index) => ({
    id: `s-${index + 1}`,
    title,
    status: "done",
    durationMs: 40 + index * 30,
  }));
}

function buildSummaryLines(command: CommandMeta, version: string): string[] {
  const releaseState = getReleaseStateLabel();
  const env = parseEnvFile(resolve(process.cwd(), ".env"));

  if (command.id === "release-apply") {
    return [
      `Команда: release apply`,
      `Версія: ${version}`,
      `Release state: ${releaseState}`,
    ];
  }

  if (command.id === "release-rollback-prepare") {
    return [
      "Команда: release rollback-prepare",
      `Release state: ${releaseState}`,
      "Режим: --yes",
    ];
  }

  if (command.id === "deploy-web") {
    return [
      "Команда: deploy-web",
      `Host: ${env.DEPLOY_HOST ?? "not set"}`,
      `Path: ${env.DEPLOY_PATH ?? "/var/www/bb-chat"}`,
      "Mode: production",
    ];
  }

  if (command.id === "build-apk") {
    return [
      "Команда: build-apk",
      "Env: prod",
      `Версія: ${version}`,
      `Upload URL: ${env.APK_UPLOAD_URL ? "set" : "not set"}`,
    ];
  }

  if (command.id === "rollback") {
    return [
      "Команда: rollback",
      `Host: ${env.DEPLOY_HOST ?? "not set"}`,
      `Path: ${env.DEPLOY_PATH ?? "/var/www/bb-chat"}`,
      "Target: previous",
    ];
  }

  if (command.id === "bump-version") {
    return [
      "Команда: bump-version",
      `Поточна версія: ${version}`,
      "Bump code: off",
    ];
  }

  return [
    `Команда: ${command.title}`,
    `Версія: ${version}`,
  ];
}

function buildChecksLines(command: CommandMeta): string[] {
  const changedFiles = getChangedFiles();
  const changedWhitelist = RELEASE_WHITELIST.filter((file) =>
    changedFiles.includes(file),
  );

  const lines: string[] = [];
  if (changedFiles.length === 0) {
    lines.push("ok: Worktree чистий");
  } else {
    lines.push(`warn: Змінено файлів: ${changedFiles.length}`);
  }

  lines.push(`ok: Whitelist файлів: ${changedWhitelist.length}/${RELEASE_WHITELIST.length}`);

  if (command.id === "deploy-web" || command.id === "rollback") {
    const env = parseEnvFile(resolve(process.cwd(), ".env"));
    if (!env.DEPLOY_HOST) {
      lines.push("warn: DEPLOY_HOST не задано");
    } else {
      lines.push("ok: DEPLOY_HOST задано");
    }
  }

  if (command.id === "build-apk") {
    lines.push("info: Збірка може тривати довго");
  }

  return lines;
}

function buildFilesLines(command: CommandMeta): string[] {
  const changedFiles = getChangedFiles();
  if (command.id === "release-apply" || command.id === "release-rollback-prepare") {
    return RELEASE_WHITELIST.map((file) =>
      `${changedFiles.includes(file) ? "changed" : "clean"}   ${file}`,
    );
  }

  if (command.id === "build-apk") {
    const apkPath = "android/app/build/outputs/apk/debug/app-debug.apk";
    return [
      `${existsSync(resolve(process.cwd(), apkPath)) ? "changed" : "clean"}   ${apkPath}`,
      `clean     apk-output/`,
    ];
  }

  return ["clean     Немає файлових змін для цього кроку"]; 
}

function buildResultLines(command: CommandMeta, version: string): string[] {
  if (command.id === "release-apply") {
    return [
      "Готово до запуску apply",
      `Наступний крок: yarn release apply ${version} --yes`,
    ];
  }

  if (command.id === "release-rollback-prepare") {
    return [
      "Готово до локального відкату",
      "Наступний крок: yarn release rollback-prepare --yes",
    ];
  }

  if (command.id === "deploy-web") {
    return [
      "Готово до web deploy",
      "Наступний крок: yarn deploy:web --mode production",
    ];
  }

  if (command.id === "build-apk") {
    return [
      "Готово до build apk",
      "Наступний крок: yarn build:apk prod --no-upload",
    ];
  }

  if (command.id === "rollback") {
    return [
      "Готово до rollback",
      "Наступний крок: yarn rollback",
    ];
  }

  if (command.id === "bump-version") {
    return [
      "Готово до bump version",
      `Наступний крок: yarn bump-version ${version}`,
    ];
  }

  return ["Крок підготовлено", "Готово до виконання"]; 
}

export function buildStaticRuntimeForCommand(command: CommandMeta): RuntimeData {
  const version = getPackageVersion();
  const branch = safeGit(["branch", "--show-current"]) || "n/a";
  const latestTag = safeGit(["tag", "--sort=-creatordate"]).split("\n")[0] || "n/a";
  const now = new Date().toTimeString().slice(0, 8);

  const blocks: EventBlock[] = [
    {
      id: "b0",
      title: "",
      type: "version-banner",
      lines: [branch, latestTag, version],
    },
    {
      id: "b1",
      title: "Загальна інформація",
      type: "pair-grid",
      lines: buildSummaryLines(command, version),
    },
    {
      id: "b2",
      title: "Перевірки",
      type: "status-list",
      lines: buildChecksLines(command),
    },
    {
      id: "b4",
      title: "Релізні файли",
      type: "files-table",
      lines: buildFilesLines(command),
    },
    {
      id: "b5",
      title: "Git контекст",
      type: "git-context",
      lines: getGitContextLines(),
    },
    {
      id: "b6",
      title: "Підсумки",
      type: "result",
      lines: buildResultLines(command, version),
    },
  ];

  const logs: LogEvent[] = [
    {
      id: "l1",
      level: "info",
      timestamp: now,
      message: `Підготовлено runtime для ${command.title}`,
    },
    {
      id: "l2",
      level: "success",
      timestamp: now,
      message: "Блоки дашборду ініціалізовані",
    },
  ];

  const steps = mapSteps(command);
  return {
    steps,
    blocks,
    logs,
    currentStepTitle: steps[steps.length - 1]?.title ?? "-",
    status: "done",
  };
}