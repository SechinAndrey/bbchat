import { getVersion } from "../domain/version.js";
import { loadEnv } from "../infra/env.js";
import { getCurrentBranch } from "../infra/git.js";
import {
  canWriteRemote,
  q,
  runRemote,
  runRemoteCapture,
} from "../infra/remote.js";
import { run } from "../infra/run.js";
import { AppError } from "../shared/errors.js";
import { tuiDone, tuiStatus, tuiStep, tuiBanner } from "../shared/tui.js";
import type { DeployWebInput } from "../types.js";

function parseList(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function nowStamp(): string {
  return new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "")
    .replace("T", "");
}

export function runDeployWeb(input: DeployWebInput): void {
  tuiBanner("Release CLI", "deploy-web", {
    version: getVersion(),
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

  const version = getVersion();
  const releaseName = `${version}-${nowStamp()}`;
  const releasesPath = `${deployPath}/releases`;
  const releasePath = `${releasesPath}/${releaseName}`;
  const deployHtmlPath = `${deployPath}/html`;

  tuiStep("check remote write access");
  if (
    !canWriteRemote(host, deployPath) ||
    !canWriteRemote(host, releasesPath)
  ) {
    throw new AppError(
      `No write access to ${deployPath} on ${host}.\n` +
        `Fix with: sudo chown deploy:deploy ${deployPath} && sudo chown deploy:deploy ${releasesPath}`,
    );
  }

  tuiStep("build web");
  run("yarn", ["vue-tsc", "--noEmit"]);
  run("yarn", ["vite", "build", "--mode", input.mode]);
  tuiStatus("web build completed", "success");

  tuiStep("create remote release directory");
  runRemote(host, `mkdir -p ${q(releasePath)}`);

  tuiStep("upload dist");
  run("rsync", [
    "-az",
    "--delete",
    "dist/",
    `${host}:${releasesPath}/${releaseName}/`,
  ]);

  tuiStep("switch symlink");
  runRemote(host, `ln -sfn ${q(releasePath)} ${q(deployHtmlPath)}`);

  tuiStep("prune old releases");
  const releaseListRaw = runRemoteCapture(
    host,
    `find ${q(releasesPath)} -mindepth 1 -maxdepth 1 -type d -printf '%f\\n' | sort -V`,
  );
  const releases = parseList(releaseListRaw);

  if (releases.length > input.keep) {
    const deleteCount = releases.length - input.keep;
    const toDelete = releases.slice(0, deleteCount);

    for (const release of toDelete) {
      runRemote(host, `rm -rf ${q(`${releasesPath}/${release}`)}`);
    }
  }

  tuiDone(`deployed ${releaseName} to ${host}`);
}
