import blessed from "blessed";
import { COMMANDS } from "./commands.js";
import type {
  CommandId,
  CommandMeta,
  EventBlock,
  LogEvent,
  RuntimeStep,
} from "./types.js";
import { startReleasePrepareLiveRuntime } from "./release-prepare-live.js";
import { buildStaticRuntimeForCommand } from "./command-runtime.js";

type PageMode = "launcher" | "runtime";

type RuntimeState = {
  command: CommandMeta;
  steps: RuntimeStep[];
  blocks: EventBlock[];
  logs: LogEvent[];
  currentStepTitle: string;
  status: "running" | "done" | "failed";
};

type AppState = {
  page: PageMode;
  selectedIndex: number;
  runtime: RuntimeState | null;
  runtimeCancel: (() => void) | null;
  logExpanded: boolean;
  feedAutoFollow: boolean;
};

type RuntimeDashboardWidgets = {
  root: blessed.Widgets.BoxElement;
  banner: blessed.Widgets.BoxElement;
  summaryTable: blessed.Widgets.ListTableElement;
  checksBox: blessed.Widgets.BoxElement;
  filesTable: blessed.Widgets.ListTableElement;
  gitBox: blessed.Widgets.BoxElement;
  resultBox: blessed.Widgets.BoxElement;
};

const palette = {
  bg: "#0b1220",
  panel: "#111827",
  panel2: "#1f2937",
  border: "#334155",
  text: "#e5e7eb",
  muted: "#94a3b8",
  info: "#22d3ee",
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  focus: "#38bdf8",
};

const icons = {
  app: "󱐋",
  selected: "",
  idle: "󰇘",
  run: "󰜎",
  done: "󰄬",
  failed: "󰅚",
  step: "󰘧",
  command: "",
  file: "󰈔",
  git: "󰊢",
  result: "󱞁",
  info: "󰋼",
  warn: "󰀪",
  error: "󰅚",
  success: "󰄬",
  clock: "󰥔",
};

function msToDuration(ms?: number): string {
  if (!ms || ms <= 0) {
    return "--";
  }

  if (ms < 1000) {
    return `${ms}ms`;
  }

  return `${(ms / 1000).toFixed(2)}s`;
}

function truncate(value: string, limit: number): string {
  if (value.length <= limit) {
    return value;
  }

  if (limit <= 1) {
    return value.slice(0, limit);
  }

  return `${value.slice(0, limit - 1)}…`;
}

function formatLogLine(log: LogEvent, width: number): string {
  const levelColor =
    log.level === "error"
      ? palette.error
      : log.level === "warn"
        ? palette.warning
        : log.level === "success"
          ? palette.success
          : palette.info;

  const levelIcon =
    log.level === "error"
      ? icons.error
      : log.level === "warn"
        ? icons.warn
        : log.level === "success"
          ? icons.success
          : icons.info;

  const body = `${levelIcon} ${log.timestamp} ${log.message}`;
  return `{${levelColor}-fg}${truncate(body, Math.max(width - 3, 8))}{/}`;
}

function parseKeyValueLines(
  lines: string[],
): Array<{ key: string; value: string }> {
  return lines
    .map((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) {
        return { key: line, value: "" };
      }

      return {
        key: line.slice(0, idx).trim(),
        value: line.slice(idx + 1).trim(),
      };
    })
    .filter((entry) => entry.key.length > 0);
}

function createRuntimeDashboardWidgets(
  rightPane: blessed.Widgets.BoxElement,
): RuntimeDashboardWidgets {
  const root = blessed.box({
    parent: rightPane,
    top: 0,
    left: 0,
    width: "100%-2",
    height: "100%-2",
    hidden: true,
    tags: true,
    style: { bg: palette.panel },
  });

  const banner = blessed.box({
    parent: root,
    top: 0,
    left: 0,
    width: "100%",
    height: 4,
    border: "line",
    label: " Релізний контур ",
    tags: true,
    padding: { left: 1, right: 1 },
    style: {
      fg: palette.text,
      bg: palette.panel2,
      border: { fg: palette.focus },
    },
  });

  const summaryTable = blessed.listtable({
    parent: root,
    top: 4,
    left: 0,
    width: "50%-1",
    height: "38%",
    border: "line",
    label: " Загальна інформація ",
    tags: true,
    pad: 1,
    noCellBorders: true,
    style: {
      fg: palette.text,
      bg: palette.panel2,
      border: { fg: palette.border },
      header: { fg: palette.focus, bold: true },
      cell: { fg: palette.text },
    },
  });

  const checksBox = blessed.box({
    parent: root,
    top: 4,
    left: "50%",
    width: "50%",
    height: "38%",
    border: "line",
    label: " Перевірки ",
    tags: true,
    padding: { left: 1, right: 1 },
    style: {
      fg: palette.text,
      bg: palette.panel2,
      border: { fg: palette.border },
    },
  });

  const filesTable = blessed.listtable({
    parent: root,
    top: "38%+4",
    left: 0,
    width: "62%-1",
    height: "42%",
    border: "line",
    label: " Релізні файли ",
    tags: true,
    pad: 1,
    noCellBorders: true,
    style: {
      fg: palette.text,
      bg: palette.panel2,
      border: { fg: palette.warning },
      header: { fg: palette.warning, bold: true },
      cell: { fg: palette.text },
    },
  });

  const gitBox = blessed.box({
    parent: root,
    top: "38%+4",
    left: "62%",
    width: "38%",
    height: "42%",
    border: "line",
    label: " Git контекст ",
    tags: true,
    padding: { left: 1, right: 1 },
    style: {
      fg: palette.text,
      bg: palette.panel2,
      border: { fg: palette.info },
    },
  });

  const resultBox = blessed.box({
    parent: root,
    bottom: 0,
    left: 0,
    width: "100%",
    height: 5,
    border: "line",
    label: " Підсумки ",
    tags: true,
    padding: { left: 1, right: 1 },
    style: {
      fg: palette.text,
      bg: palette.panel2,
      border: { fg: palette.success },
    },
  });

  return {
    root,
    banner,
    summaryTable,
    checksBox,
    filesTable,
    gitBox,
    resultBox,
  };
}

function findBlock(
  blocks: EventBlock[],
  type: EventBlock["type"],
  title?: string,
): EventBlock | undefined {
  return blocks.find(
    (block) =>
      block.type === type &&
      (title === undefined ||
        block.title.toLowerCase() === title.toLowerCase()),
  );
}

function renderBlockBody(block: EventBlock): string[] {
  if (block.type === "pair-grid") {
    const parsed = parseKeyValueLines(block.lines);
    const maxKey = Math.max(12, ...parsed.map((row) => row.key.length));
    return parsed.map(
      (row) =>
        `{${palette.muted}-fg}[${truncate(row.key, maxKey)}]{/}  {${palette.text}-fg}${row.value}{/}`,
    );
  }

  if (block.type === "files-table") {
    return block.lines.map((line) => {
      const isChanged = line.startsWith("changed");
      const tone = isChanged ? palette.warning : palette.muted;
      const badge = isChanged ? "[changed]" : "[clean]";
      const file = line.replace(/^(changed|clean)\s+/, "");
      return `{${tone}-fg}${badge}{/} ${file}`;
    });
  }

  if (block.type === "status-list") {
    return block.lines.map((line) => {
      if (line.startsWith("ok:")) {
        return `{${palette.success}-fg}${icons.done}{/} ${line.replace(/^ok:\s*/, "")}`;
      }
      if (line.startsWith("warn:")) {
        return `{${palette.warning}-fg}${icons.warn}{/} ${line.replace(/^warn:\s*/, "")}`;
      }
      if (line.startsWith("file:")) {
        return `{${palette.info}-fg}${icons.file}{/} ${line.replace(/^file:\s*/, "")}`;
      }
      if (line.startsWith("info:")) {
        return `{${palette.muted}-fg}${icons.info}{/} ${line.replace(/^info:\s*/, "")}`;
      }

      return `{${palette.muted}-fg}${icons.info}{/} ${line}`;
    });
  }

  if (block.type === "command-trace") {
    return block.lines.map(
      (line) => `{${palette.info}-fg}${icons.command}{/} ${line}`,
    );
  }

  if (block.type === "git-context") {
    return block.lines.map((line, index) => {
      if (index === 0) {
        return `{${palette.muted}-fg}${icons.git} ${line}{/}`;
      }

      const parts = line.split(" ");
      if (parts.length > 1) {
        return `{${palette.success}-fg}●{/} {${palette.muted}-fg}${parts[0]}{/} ${parts.slice(1).join(" ")}`;
      }

      return line;
    });
  }

  if (block.type === "result") {
    return block.lines.map((line, index) => {
      const tone =
        index === block.lines.length - 1 ? palette.success : palette.text;
      const badge = index === 0 ? "[result]" : "[next]";
      return `{${tone}-fg}${badge}{/} ${line}`;
    });
  }

  if (block.type === "version-banner") {
    const branch = block.lines[0] ?? "n/a";
    const oldTag = block.lines[1] ?? "n/a";
    const newVer = block.lines[2] ?? "?";
    return [
      `{${palette.info}-fg}${icons.git}  ${branch}{/}`,
      `{${palette.muted}-fg}${oldTag}  →  {/}{${palette.success}-fg}{bold}v${newVer}{/bold}{/}`,
    ];
  }

  if (block.type === "step-block") {
    if (block.lines.length === 0) {
      return [
        `{${palette.success}-fg}[done]{/} {bold}Виконано{/bold}`,
        `{${palette.muted}-fg}Без додаткового виводу{/}`,
      ];
    }
    return block.lines.map((line) => {
      if (line.startsWith("changed")) {
        return `  {${palette.muted}-fg}│{/}  {${palette.warning}-fg}󱇧 ${line.replace(/^changed\s+/, "")}{/}`;
      }
      return `  {${palette.muted}-fg}│{/}  {${palette.text}-fg}${line}{/}`;
    });
  }

  return block.lines;
}

function buildPlaceholderRuntime(command: CommandMeta): RuntimeState {
  const staticRuntime = buildStaticRuntimeForCommand(command);

  return {
    command,
    steps: staticRuntime.steps,
    blocks: staticRuntime.blocks,
    logs: staticRuntime.logs,
    currentStepTitle: staticRuntime.currentStepTitle,
    status: staticRuntime.status,
  };
}

function renderLauncher(
  state: AppState,
  listPane: blessed.Widgets.BoxElement,
  detailsPane: blessed.Widgets.BoxElement,
): void {
  const paneWidth = Number(listPane.width) || 38;
  const maxLineWidth = Math.max(paneWidth - 8, 20);

  const listLines = COMMANDS.map((cmd, idx) => {
    const selected = idx === state.selectedIndex;
    const marker = selected
      ? `{${palette.focus}-fg}${icons.selected}{/}`
      : `{${palette.muted}-fg}${icons.idle}{/}`;
    const titleColor = selected ? palette.text : palette.muted;
    const metaColor = selected ? palette.focus : palette.muted;
    const titleLine = `${marker} {${titleColor}-fg}{bold}${truncate(cmd.title, maxLineWidth)}{/bold}{/}`;
    const metaLine = `  {${metaColor}-fg}${truncate(`${cmd.shortDescription} · ${cmd.steps.length} steps`, maxLineWidth)}{/}`;

    return `${titleLine}\n${metaLine}`;
  }).join("\n\n");

  listPane.setContent(`\n${listLines}`);

  const selected = COMMANDS[state.selectedIndex];
  const stepLines = selected.steps
    .map(
      (step, idx) =>
        `  {${palette.info}-fg}${icons.step}{/} ${idx + 1}. ${step}`,
    )
    .join("\n");
  detailsPane.setContent(
    `\n{bold}${selected.title}{/}\n` +
      `{${palette.muted}-fg}${selected.shortDescription}{/}\n\n` +
      `{${palette.focus}-fg}Що робить{/}\n${selected.does}\n\n` +
      `{${palette.focus}-fg}Кроки{/}\n${stepLines}\n\n` +
      `{${palette.focus}-fg}Приклад запуску{/}\n{${palette.info}-fg}${icons.command}{/} ${selected.example}\n\n` +
      `{${palette.focus}-fg}Очікуваний результат{/}\n{${palette.success}-fg}${icons.result}{/} ${selected.expectedResult}`,
  );
}

function renderRuntime(
  state: AppState,
  timelinePane: blessed.Widgets.BoxElement,
  runtimeDashboard: RuntimeDashboardWidgets,
): void {
  const runtime = state.runtime;
  if (!runtime) {
    timelinePane.setContent("\nНемає активної команди");
    runtimeDashboard.banner.setContent("Немає даних");
    runtimeDashboard.summaryTable.setData([["Параметр", "Значення"]]);
    runtimeDashboard.checksBox.setContent("Немає даних");
    runtimeDashboard.filesTable.setData([["Статус", "Файл"]]);
    runtimeDashboard.gitBox.setContent("Немає даних");
    runtimeDashboard.resultBox.setContent("Немає даних");
    return;
  }

  const timelineLines = runtime.steps.map((step) => {
    const statusSign =
      step.status === "done"
        ? `{${palette.success}-fg}${icons.done}{/}`
        : step.status === "running"
          ? `{${palette.info}-fg}${icons.run}{/}`
          : step.status === "failed"
            ? `{${palette.error}-fg}${icons.failed}{/}`
            : `{${palette.muted}-fg}${icons.idle}{/}`;
    const statusText =
      step.status === "done"
        ? "done"
        : step.status === "running"
          ? "running"
          : step.status === "failed"
            ? "failed"
            : "todo";

    return `${statusSign} ${step.title}\n  {${palette.muted}-fg}${statusText} · ${icons.clock} ${msToDuration(step.durationMs)}{/}`;
  });
  timelinePane.setContent(`\n${timelineLines.join("\n")}`);

  const version = findBlock(runtime.blocks, "version-banner");
  const summary = findBlock(runtime.blocks, "pair-grid", "Загальна інформація");
  const checks = findBlock(runtime.blocks, "status-list", "Перевірки");
  const files = findBlock(runtime.blocks, "files-table", "Релізні файли");
  const git = findBlock(runtime.blocks, "git-context", "Git контекст");
  const result = findBlock(runtime.blocks, "result", "Підсумки");

  const branch = version?.lines[0] ?? "n/a";
  const oldVersion = version?.lines[1] ?? "n/a";
  const newVersion =
    version?.lines[2] ?? runtime.command.example.split(" ").pop() ?? "?";
  runtimeDashboard.banner.setContent(
    `{${palette.info}-fg}${icons.git}{/} ${branch}\n` +
      `{${palette.muted}-fg}${oldVersion}{/} {${palette.focus}-fg}→{/} {${palette.success}-fg}{bold}v${newVersion}{/bold}{/}`,
  );

  const summaryRows = parseKeyValueLines(summary?.lines ?? []).map((row) => [
    row.key,
    row.value,
  ]);
  runtimeDashboard.summaryTable.setData([
    ["Параметр", "Значення"],
    ...(summaryRows.length > 0 ? summaryRows : [["Стан", "Немає даних"]]),
  ]);

  const checksLines = renderBlockBody(
    checks ?? {
      id: "checks-fallback",
      title: "Перевірки",
      type: "status-list",
      lines: [],
    },
  ).map((line) => truncate(line, 58));
  runtimeDashboard.checksBox.setContent(checksLines.join("\n"));

  const fileRows = (files?.lines ?? []).map((line) => {
    const match = line.match(/^(changed|clean)\s+(.+)$/);
    if (!match) {
      return ["-", line];
    }

    return [match[1], match[2]];
  });
  runtimeDashboard.filesTable.setData([
    ["Статус", "Файл"],
    ...(fileRows.length > 0 ? fileRows : [["done", "Без змін"]]),
  ]);

  const gitLines = renderBlockBody(
    git ?? {
      id: "git-fallback",
      title: "Git контекст",
      type: "git-context",
      lines: ["Немає даних"],
    },
  ).map((line) => truncate(line, 52));
  runtimeDashboard.gitBox.setContent(gitLines.join("\n"));

  const resultLines = renderBlockBody(
    result ?? {
      id: "result-fallback",
      title: "Підсумки",
      type: "result",
      lines: [runtime.status === "failed" ? "Помилка виконання" : "Виконано"],
    },
  );
  const footer =
    runtime.status === "done"
      ? `\n{${palette.muted}-fg}n → наступна команда  ·  Esc → вихід{/}`
      : "";
  runtimeDashboard.resultBox.setContent(`${resultLines.join("\n")}${footer}`);
}

export async function runTuiCore(): Promise<void> {
  const state: AppState = {
    page: "launcher",
    selectedIndex: 0,
    runtime: null,
    runtimeCancel: null,
    logExpanded: false,
    feedAutoFollow: true,
  };

  const screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true,
    title: "BB Chat Release UI",
  });

  const header = blessed.box({
    parent: screen,
    top: 0,
    left: 0,
    width: "100%",
    height: 3,
    tags: true,
    padding: { left: 1, right: 1 },
    style: { fg: palette.text, bg: palette.bg },
  });

  const leftPane = blessed.box({
    parent: screen,
    top: 3,
    left: 0,
    width: 38,
    height: "100%-6",
    border: "line",
    label: " Команди / Прогрес 󰋚 ",
    tags: true,
    padding: { left: 1, right: 1 },
    style: {
      fg: palette.text,
      bg: palette.panel,
      border: { fg: palette.border },
    },
  });

  const rightPane = blessed.box({
    parent: screen,
    top: 3,
    left: 38,
    width: "100%-38",
    height: "100%-6",
    border: "line",
    label: " Дашборд стрічка ",
    tags: true,
    scrollable: true,
    alwaysScroll: true,
    keys: true,
    vi: true,
    padding: { left: 1, right: 1 },
    style: {
      fg: palette.text,
      bg: palette.panel,
      border: { fg: palette.border },
      scrollbar: { bg: palette.border },
    },
    scrollbar: { ch: " " },
  });

  const runtimeDashboard = createRuntimeDashboardWidgets(rightPane);

  const logDock = blessed.box({
    parent: screen,
    bottom: 0,
    left: 0,
    width: "100%",
    height: 3,
    border: "line",
    label: " Логи 󰌱 ",
    tags: true,
    scrollable: true,
    alwaysScroll: true,
    keys: true,
    vi: true,
    padding: { left: 1, right: 1 },
    style: {
      fg: palette.text,
      bg: palette.panel,
      border: { fg: palette.border },
      scrollbar: { bg: palette.border },
    },
    scrollbar: { ch: " " },
  });

  function syncLayout(): void {
    const expandedHeight = Math.max((screen.height as number) - 4, 3);
    if (state.logExpanded) {
      logDock.height = expandedHeight;
      rightPane.height = 0;
      rightPane.hide();
      leftPane.hide();
      return;
    }

    logDock.height = 3;
    rightPane.show();
    leftPane.show();
    leftPane.height = "100%-6";
    rightPane.height = "100%-6";
  }

  function render(): void {
    const selected = COMMANDS[state.selectedIndex];
    const runtime = state.runtime;
    const pageTitle = state.page === "launcher" ? "Launcher" : "Runtime";
    const status = runtime?.status ?? "idle";
    const currentStep = runtime?.currentStepTitle ?? "-";

    const statusColor =
      status === "failed"
        ? palette.error
        : status === "done"
          ? palette.success
          : palette.info;

    const lineTop =
      `{bold}${icons.app} BB Chat Release{/bold} ` +
      `{${palette.muted}-fg}${pageTitle}{/}`;
    const lineMeta =
      `{${palette.muted}-fg}Команда{/} {bold}${runtime?.command.title ?? selected.title}{/bold}   ` +
      `{${palette.muted}-fg}Крок{/} {bold}${currentStep}{/bold}   ` +
      `{${palette.muted}-fg}Статус{/} {${statusColor}-fg}{bold}${status}{/bold}{/}`;
    const lineKeys =
      `{${palette.muted}-fg}Клавіші:{/} ` +
      `↑↓ навігація  •  Enter запуск  •  ~ / l логи  •  End live  •  Esc вихід` +
      (runtime?.status === "done" ? `  •  n наступна команда` : "");

    header.setContent(`${lineTop}\n${lineMeta}\n${lineKeys}`);

    if (state.page === "launcher") {
      runtimeDashboard.root.hide();
      leftPane.setLabel(" Команди 󰈺 ");
      rightPane.setLabel(" Деталі команди ");
      renderLauncher(state, leftPane, rightPane);
      rightPane.setScroll(0);
    } else {
      runtimeDashboard.root.show();
      leftPane.setLabel(" Прогрес 󰄵 ");
      rightPane.setLabel(" Дашборд 󰡏 ");
      rightPane.setContent("");
      renderRuntime(state, leftPane, runtimeDashboard);
    }

    const logs = (state.runtime?.logs ?? []).slice(-500);
    const width = Number(logDock.width) || 120;
    const lines = logs.map((log) => formatLogLine(log, width));
    logDock.setContent(
      `\n${lines.slice(-(state.logExpanded ? 500 : 3)).join("\n")}`,
    );
    if (!state.logExpanded) {
      logDock.setScrollPerc(100);
    }

    syncLayout();
    screen.render();
  }

  function startRuntime(commandId: CommandId): void {
    if (state.runtimeCancel) {
      state.runtimeCancel();
      state.runtimeCancel = null;
    }

    const command = COMMANDS.find((item) => item.id === commandId);
    if (!command) {
      return;
    }

    if (command.id === "release-prepare") {
      const live = startReleasePrepareLiveRuntime((snapshot) => {
        if (!state.runtime || state.runtime.command.id !== "release-prepare") {
          return;
        }

        state.runtime.steps = snapshot.steps;
        state.runtime.blocks = snapshot.blocks;
        state.runtime.logs = snapshot.logs;
        state.runtime.currentStepTitle = snapshot.currentStepTitle;
        state.runtime.status = snapshot.status;

        if (snapshot.status !== "running") {
          state.runtimeCancel = null;
        }

        render();
      });

      state.runtime = {
        command,
        steps: live.snapshot.steps,
        blocks: live.snapshot.blocks,
        logs: live.snapshot.logs,
        currentStepTitle: live.snapshot.currentStepTitle,
        status: live.snapshot.status,
      };
      state.runtimeCancel = live.cancel;
    } else {
      state.runtime = buildPlaceholderRuntime(command);
    }

    state.page = "runtime";
    state.feedAutoFollow = true;
  }

  screen.key(["q", "escape", "C-c"], () => {
    if (state.runtimeCancel) {
      state.runtimeCancel();
      state.runtimeCancel = null;
    }
    screen.destroy();
  });

  screen.key(["up"], () => {
    if (state.page === "launcher") {
      state.selectedIndex = Math.max(0, state.selectedIndex - 1);
      render();
      return;
    }

    if (!state.logExpanded) {
      rightPane.scroll(-1);
      state.feedAutoFollow = false;
    } else {
      logDock.scroll(-1);
    }
    render();
  });

  screen.key(["down"], () => {
    if (state.page === "launcher") {
      state.selectedIndex = Math.min(
        COMMANDS.length - 1,
        state.selectedIndex + 1,
      );
      render();
      return;
    }

    if (!state.logExpanded) {
      rightPane.scroll(1);
      if (rightPane.getScrollPerc() >= 100) {
        state.feedAutoFollow = true;
      }
    } else {
      logDock.scroll(1);
    }
    render();
  });

  screen.key(["pageup"], () => {
    if (state.page === "runtime" && !state.logExpanded) {
      rightPane.scroll(-8);
      state.feedAutoFollow = false;
      render();
    }
  });

  screen.key(["pagedown"], () => {
    if (state.page === "runtime" && !state.logExpanded) {
      rightPane.scroll(8);
      if (rightPane.getScrollPerc() >= 100) {
        state.feedAutoFollow = true;
      }
      render();
    }
  });

  screen.key(["end"], () => {
    if (state.page === "runtime") {
      rightPane.setScrollPerc(100);
      state.feedAutoFollow = true;
      render();
    }
  });

  screen.key(["enter"], () => {
    if (state.page === "launcher") {
      startRuntime(COMMANDS[state.selectedIndex].id);
      render();
      return;
    }
  });

  screen.key(["~", "l"], () => {
    state.logExpanded = !state.logExpanded;
    render();
  });

  screen.key(["backspace"], () => {
    if (state.page === "runtime") {
      state.page = "launcher";
      state.logExpanded = false;
      render();
    }
  });

  screen.key(["n"], () => {
    if (state.page !== "runtime" || state.runtime?.status !== "done") {
      return;
    }

    const currentId = state.runtime.command.id;
    const currentIndex = COMMANDS.findIndex((item) => item.id === currentId);
    if (currentIndex === -1) {
      return;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= COMMANDS.length) {
      return;
    }

    state.selectedIndex = nextIndex;
    startRuntime(COMMANDS[nextIndex].id);
    render();
  });

  screen.on("resize", () => {
    render();
  });

  render();
}
