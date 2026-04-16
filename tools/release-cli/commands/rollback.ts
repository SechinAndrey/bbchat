import { loadEnv } from "../infra/env.js";
import { getCurrentBranch } from "../infra/git.js";
import { q, runRemote, runRemoteCapture } from "../infra/remote.js";
import { AppError } from "../shared/errors.js";
import { tuiDone, tuiStep, tuiBanner } from "../shared/tui.js";
import type { RollbackInput } from "../types.js";

function parseList(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function runRollback(input: RollbackInput): void {
  tuiBanner("Release CLI", "rollback", {
    branch: getCurrentBranch(),
  });

  const env = loadEnv(input.mode);
  const host = input.host ?? env.DEPLOY_HOST;
  const deployPath = input.path ?? env.DEPLOY_PATH;

  if (!host) {
    throw new AppError(
      "DEPLOY_HOST is required. Set it in .env or pass --host",
    );
  }

  if (!deployPath) {
    throw new AppError(
      "DEPLOY_PATH is required. Set it in .env or pass --path",
    );
  }

  const releasesPath = `${deployPath}/releases`;
  const htmlPath = `${deployPath}/html`;

  tuiStep("validate remote release paths");
  runRemote(host, `test -d ${q(releasesPath)}`);
  runRemote(host, `test -L ${q(htmlPath)}`);

  tuiStep("load current release and release list");
  const current = runRemoteCapture(
    host,
    `basename "$(readlink -f ${q(htmlPath)})"`,
  ).trim();

  const releaseListRaw = runRemoteCapture(
    host,
    `find ${q(releasesPath)} -mindepth 1 -maxdepth 1 -type d -printf '%f\\n' | sort -V`,
  );
  const releases = parseList(releaseListRaw);

  if (releases.length === 0) {
    throw new AppError("No releases found on remote host.");
  }

  let target: string | undefined;
  if (input.version) {
    const matchingReleases = releases.filter(
      (name) => name === input.version || name.startsWith(`${input.version}-`),
    );
    target = matchingReleases[matchingReleases.length - 1];

    if (!target) {
      throw new AppError(`Target release not found: ${input.version}`);
    }
  } else {
    const currentIndex = releases.findIndex((name) => name === current);
    if (currentIndex <= 0) {
      throw new AppError("Previous release was not found.");
    }

    target = releases[currentIndex - 1];
  }

  tuiStep("switch active release");
  runRemote(host, `ln -sfn ${q(`${releasesPath}/${target}`)} ${q(htmlPath)}`);

  tuiDone("rollback completed");
}
