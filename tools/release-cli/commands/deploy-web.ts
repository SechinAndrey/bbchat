import { getVersion } from "../domain/version.js";
import { loadEnv } from "../infra/env.js";
import {
  canWriteRemote,
  q,
  runRemote,
  runRemoteCapture,
} from "../infra/remote.js";
import { run } from "../infra/run.js";
import { AppError } from "../shared/errors.js";
import { logOk, logResult, logStart, logStep } from "../shared/logger.js";
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
  logStart("deploy-web");

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

  logStep("check remote write access");
  if (
    !canWriteRemote(host, deployPath) ||
    !canWriteRemote(host, releasesPath)
  ) {
    throw new AppError(
      `No write access to ${deployPath} on ${host}.\n` +
        `Fix with: sudo chown deploy:deploy ${deployPath} && sudo chown deploy:deploy ${releasesPath}`,
    );
  }

  logStep("build web");
  run("yarn", ["vue-tsc", "--noEmit"]);
  run("yarn", ["vite", "build", "--mode", input.mode]);
  logOk("web build completed");

  logStep("create remote release directory");
  runRemote(host, `mkdir -p ${q(releasePath)}`);

  logStep("upload dist");
  run("rsync", [
    "-az",
    "--delete",
    "dist/",
    `${host}:${releasesPath}/${releaseName}/`,
  ]);

  logStep("switch symlink");
  runRemote(host, `ln -sfn ${q(releasePath)} ${q(deployHtmlPath)}`);

  logStep("prune old releases");
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

  logResult(`deployed ${releaseName} to ${host}`);
}
