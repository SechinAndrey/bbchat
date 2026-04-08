import {
  spawn,
  spawnSync,
  type ChildProcessWithoutNullStreams,
} from "node:child_process";
import { getPackageVersion } from "../../utils/version.js";
import type {
  EventBlock,
  LogEvent,
  RuntimeStep,
  RuntimeStepStatus,
} from "./types.js";

type LiveStatus = "running" | "done" | "failed";

export type ReleasePrepareRuntimeSnapshot = {
  version: string;
  steps: RuntimeStep[];
  blocks: EventBlock[];
  logs: LogEvent[];
  currentStepTitle: string;
  status: LiveStatus;
};

type SectionKey =
  | "prepare"
  | "checks"
  | "changelog"
  | "preview"
  | "git"
  | "done";

type RuntimeFacts = {
  targetVersion: string;
  changelogMode: string;
  checksWarning: string | null;
  changedFiles: string[];
  previewVersion: string;
  commitMessage: string;
  releaseFiles: Array<{ file: string; changed: boolean }>;
  commitsCaption: string;
  commitsCount: string;
  recentCommits: string[];
  nextStep: string;
  doneMessage: string;
};

const stepBySection: Record<SectionKey, string> = {
  prepare: "s1",
  checks: "s2",
  changelog: "s3",
  preview: "s4",
  git: "s5",
  done: "s6",
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

function stripAnsi(value: string): string {
  return value.replace(/\u001b\[[0-9;]*m/g, "");
}

function parseKeyValue(line: string): { key: string; value: string } | null {
  const idx = line.indexOf(":");
  if (idx === -1) {
    return null;
  }

  const key = line.slice(0, idx).trim();
  const value = line.slice(idx + 1).trim();
  if (!key || !value) {
    return null;
  }

  return { key, value };
}

function classifyLevel(line: string): LogEvent["level"] {
  if (line.includes("Ошибка") || line.toLowerCase().includes("error")) {
    return "error";
  }

  if (line.startsWith("▲")) {
    return "warn";
  }

  if (line.startsWith("✔")) {
    return "success";
  }

  return "info";
}

function resolveSection(title: string): SectionKey | null {
  if (title === "Release prepare") {
    return "prepare";
  }
  if (title === "Проверки") {
    return "checks";
  }
  if (title.startsWith("Генерация changelog")) {
    return "changelog";
  }
  if (title === "Preview релиза") {
    return "preview";
  }
  if (title === "Git контекст") {
    return "git";
  }
  if (title.includes("Готово")) {
    return "done";
  }

  return null;
}

function cloneSnapshot(
  snapshot: ReleasePrepareRuntimeSnapshot,
): ReleasePrepareRuntimeSnapshot {
  return {
    version: snapshot.version,
    currentStepTitle: snapshot.currentStepTitle,
    status: snapshot.status,
    steps: snapshot.steps.map((step) => ({ ...step })),
    blocks: snapshot.blocks.map((block) => ({
      ...block,
      lines: [...block.lines],
    })),
    logs: snapshot.logs.map((log) => ({ ...log })),
  };
}

function updateBlockLines(
  snapshot: ReleasePrepareRuntimeSnapshot,
  blockId: string,
  lines: string[],
): void {
  const block = snapshot.blocks.find((item) => item.id === blockId);
  if (!block) {
    return;
  }

  block.lines = lines;
}

function updateStepStatus(
  snapshot: ReleasePrepareRuntimeSnapshot,
  stepId: string,
  status: RuntimeStepStatus,
): void {
  const step = snapshot.steps.find((item) => item.id === stepId);
  if (!step) {
    return;
  }
  step.status = status;
}

function pushLineToBlock(
  snapshot: ReleasePrepareRuntimeSnapshot,
  blockId: string,
  line: string,
): void {
  const block = snapshot.blocks.find((item) => item.id === blockId);
  if (!block) {
    return;
  }
  block.lines.push(line);
}

function ensureResultLines(snapshot: ReleasePrepareRuntimeSnapshot): void {
  const result = snapshot.blocks.find((block) => block.id === "b6");
  if (!result || result.lines.length > 0) {
    return;
  }

  result.lines = [
    `Release v${snapshot.version} підготовлено`,
    `Наступний крок: yarn release apply ${snapshot.version}`,
  ];
}

function buildChecksLines(facts: RuntimeFacts): string[] {
  const lines: string[] = [];

  if (facts.checksWarning) {
    lines.push(`warn: ${facts.checksWarning}`);
  } else {
    lines.push("ok: Локальних попереджень немає");
  }

  if (facts.changedFiles.length === 0) {
    lines.push("ok: Worktree чистий");
  } else {
    lines.push(`warn: Змінено файлів: ${facts.changedFiles.length}`);
    for (const file of facts.changedFiles.slice(0, 4)) {
      lines.push(`file: ${file}`);
    }
    if (facts.changedFiles.length > 4) {
      lines.push(
        `info: ще ${facts.changedFiles.length - 4} файл(ів) у LogDock`,
      );
    }
  }

  return lines;
}

function buildGitLines(facts: RuntimeFacts): string[] {
  const lines: string[] = [];
  if (facts.commitsCaption && facts.commitsCount) {
    lines.push(`${facts.commitsCaption}: ${facts.commitsCount}`);
  }

  for (const commit of facts.recentCommits.slice(0, 5)) {
    lines.push(commit);
  }

  return lines;
}

function rebuildDashboard(
  snapshot: ReleasePrepareRuntimeSnapshot,
  facts: RuntimeFacts,
): void {
  updateBlockLines(snapshot, "b1", [
    `Версія цілі: ${facts.targetVersion || snapshot.version}`,
    `Changelog: ${facts.changelogMode || "генерувати"}`,
  ]);

  updateBlockLines(snapshot, "b2", buildChecksLines(facts));

  updateBlockLines(snapshot, "b3", []);

  updateBlockLines(
    snapshot,
    "b4",
    facts.releaseFiles.map(
      (entry) => `${entry.changed ? "changed" : "clean"}   ${entry.file}`,
    ),
  );

  updateBlockLines(snapshot, "b5", buildGitLines(facts));

  const resultLines: string[] = [];
  if (facts.doneMessage) {
    resultLines.push(facts.doneMessage);
  }
  if (facts.nextStep) {
    resultLines.push(`Наступний крок: ${facts.nextStep}`);
  }

  updateBlockLines(snapshot, "b6", resultLines);
}

function collectFacts(
  section: SectionKey,
  line: string,
  facts: RuntimeFacts,
): void {
  const kv = parseKeyValue(line);

  if (section === "prepare" && kv) {
    if (kv.key === "Целевая версия") {
      facts.targetVersion = kv.value;
    }
    if (kv.key === "Changelog") {
      facts.changelogMode = kv.value;
    }
  }

  if (section === "checks") {
    if (line.startsWith("▲")) {
      facts.checksWarning = line.replace(/^▲\s*/, "");
    }
    const changedMatch = line.match(/^•\s+Изменён файл:\s+(.+)$/);
    if (changedMatch) {
      facts.changedFiles.push(changedMatch[1]);
    }
  }

  if (section === "preview" && kv) {
    if (kv.key === "Версия") {
      facts.previewVersion = kv.value;
    }
    if (kv.key === "Commit message") {
      facts.commitMessage = kv.value;
    }
  }

  if (section === "preview") {
    const tableMatch = line.match(/^(changed|clean)\s+([^\s]+)(?:\s+.+)?$/);
    if (tableMatch) {
      const file = tableMatch[2];
      if (!facts.releaseFiles.some((entry) => entry.file === file)) {
        facts.releaseFiles.push({ file, changed: tableMatch[1] === "changed" });
      }
    }
  }

  if (section === "git" && kv && kv.key.startsWith("Коммитов")) {
    facts.commitsCaption = kv.key;
    facts.commitsCount = kv.value;
  }

  if (section === "git") {
    const commitLine = line.match(/^•\s+(.+)$/);
    if (commitLine) {
      facts.recentCommits.push(commitLine[1]);
    }
  }

  if (section === "done" && line.startsWith("✔")) {
    facts.doneMessage = line.replace(/^✔\s*/, "");
  }

  if (section === "done" && kv && kv.key === "Следующий шаг") {
    facts.nextStep = kv.value;
  }
}

function createInitialSnapshot(): ReleasePrepareRuntimeSnapshot {
  const version = getPackageVersion();
  const branch = safeGit(["branch", "--show-current"]) || "n/a";
  const latestTag =
    safeGit(["tag", "--sort=-creatordate"]).split("\n")[0] || "n/a";

  return {
    version,
    currentStepTitle: `prepare ${version}`,
    status: "running",
    steps: [
      { id: "s1", title: `prepare ${version}`, status: "running" },
      { id: "s2", title: "Перевірки", status: "todo" },
      { id: "s3", title: "Генерація changelog", status: "todo" },
      { id: "s4", title: "Preview", status: "todo" },
      { id: "s5", title: "Git контекст", status: "todo" },
      { id: "s6", title: "Готово", status: "todo" },
    ],
    blocks: [
      {
        id: "b0",
        title: "",
        type: "version-banner",
        lines: [branch, latestTag, version],
      },
      { id: "b1", title: "Загальна інформація", type: "pair-grid", lines: [] },
      { id: "b2", title: "Перевірки", type: "status-list", lines: [] },
      { id: "b3", title: "Генерація changelog", type: "step-block", lines: [] },
      { id: "b4", title: "Релізні файли", type: "files-table", lines: [] },
      { id: "b5", title: "Git контекст", type: "git-context", lines: [] },
      { id: "b6", title: "Підсумки", type: "result", lines: [] },
    ],
    logs: [],
  };
}

export function startReleasePrepareLiveRuntime(
  onUpdate: (snapshot: ReleasePrepareRuntimeSnapshot) => void,
): { snapshot: ReleasePrepareRuntimeSnapshot; cancel: () => void } {
  const snapshot = createInitialSnapshot();
  const facts: RuntimeFacts = {
    targetVersion: snapshot.version,
    changelogMode: "генерувати",
    checksWarning: null,
    changedFiles: [],
    previewVersion: snapshot.version,
    commitMessage: "",
    releaseFiles: [],
    commitsCaption: "",
    commitsCount: "",
    recentCommits: [],
    nextStep: `yarn release apply ${snapshot.version}`,
    doneMessage: "",
  };
  let currentSection: SectionKey = "prepare";
  let stdoutBuffer = "";
  let stderrBuffer = "";

  const proc: ChildProcessWithoutNullStreams = spawn(
    "yarn",
    ["release", "prepare", snapshot.version],
    {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    },
  );

  const emit = (): void => {
    onUpdate(cloneSnapshot(snapshot));
  };

  const switchSection = (next: SectionKey): void => {
    if (currentSection !== next) {
      updateStepStatus(snapshot, stepBySection[currentSection], "done");
    }

    currentSection = next;
    updateStepStatus(snapshot, stepBySection[next], "running");
    const step = snapshot.steps.find((item) => item.id === stepBySection[next]);
    snapshot.currentStepTitle = step?.title ?? snapshot.currentStepTitle;
  };

  const processLine = (rawLine: string): void => {
    const normalized = stripAnsi(rawLine).trimEnd();
    const line = normalized.trim();
    if (!line) {
      return;
    }

    const now = new Date().toTimeString().slice(0, 8);
    snapshot.logs.push({
      id: `l-${snapshot.logs.length + 1}`,
      level: classifyLevel(line),
      timestamp: now,
      message: line,
    });

    if (snapshot.logs.length > 500) {
      snapshot.logs = snapshot.logs.slice(-500);
    }

    if (/^─+$/.test(line)) {
      emit();
      return;
    }

    const maybeSection = resolveSection(line);
    if (maybeSection) {
      switchSection(maybeSection);
      emit();
      return;
    }

    if (line.startsWith("$") || line.startsWith("cwd:")) {
      emit();
      return;
    }

    collectFacts(currentSection, line, facts);
    rebuildDashboard(snapshot, facts);

    emit();
  };

  const consume = (chunk: string, isErr: boolean): void => {
    const next = `${isErr ? stderrBuffer : stdoutBuffer}${chunk}`;
    const lines = next.split("\n");
    const tail = lines.pop() ?? "";

    if (isErr) {
      stderrBuffer = tail;
    } else {
      stdoutBuffer = tail;
    }

    for (const line of lines) {
      processLine(line);
    }
  };

  proc.stdout.on("data", (chunk: Buffer) => {
    consume(chunk.toString("utf-8"), false);
  });

  proc.stderr.on("data", (chunk: Buffer) => {
    consume(chunk.toString("utf-8"), true);
  });

  proc.on("close", (code) => {
    if (stdoutBuffer.trim()) {
      processLine(stdoutBuffer);
    }
    if (stderrBuffer.trim()) {
      processLine(stderrBuffer);
    }

    if (code === 0) {
      updateStepStatus(snapshot, stepBySection[currentSection], "done");
      updateStepStatus(snapshot, "s6", "done");
      snapshot.currentStepTitle = "Готово";
      snapshot.status = "done";
      facts.doneMessage = facts.doneMessage || "release prepare завершён";
      facts.nextStep =
        facts.nextStep || `yarn release apply ${snapshot.version}`;
      rebuildDashboard(snapshot, facts);
      ensureResultLines(snapshot);
    } else {
      updateStepStatus(snapshot, stepBySection[currentSection], "failed");
      updateStepStatus(snapshot, "s6", "failed");
      snapshot.currentStepTitle = "Помилка";
      snapshot.status = "failed";
      updateBlockLines(snapshot, "b6", [
        "Підготовка релізу завершилась помилкою",
      ]);
    }

    emit();
  });

  emit();

  return {
    snapshot: cloneSnapshot(snapshot),
    cancel: () => {
      if (!proc.killed) {
        proc.kill("SIGINT");
      }
    },
  };
}
