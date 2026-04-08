export type CommandId =
  | "release-prepare"
  | "release-apply"
  | "release-rollback-prepare"
  | "deploy-web"
  | "build-apk"
  | "rollback"
  | "bump-version";

export type CommandMeta = {
  id: CommandId;
  title: string;
  shortDescription: string;
  flowOrder: number;
  steps: string[];
  does: string;
  example: string;
  expectedResult: string;
};

export type RuntimeStepStatus = "todo" | "running" | "done" | "failed";

export type RuntimeStep = {
  id: string;
  title: string;
  status: RuntimeStepStatus;
  durationMs?: number;
};

export type EventBlockType =
  | "pair-grid"
  | "status-list"
  | "files-table"
  | "command-trace"
  | "git-context"
  | "result"
  | "version-banner"
  | "step-block";

export type EventBlock = {
  id: string;
  title: string;
  type: EventBlockType;
  lines: string[];
};

export type LogLevel = "info" | "warn" | "error" | "success";

export type LogEvent = {
  id: string;
  level: LogLevel;
  timestamp: string;
  message: string;
};
