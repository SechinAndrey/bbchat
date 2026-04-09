import { ENV_PATH, PACKAGE_JSON_PATH } from "../config.js";
import { parseEnvFile } from "../infra/env.js";
import { readText } from "../infra/fs.js";
import { q, runRemote, runRemoteCapture } from "../infra/remote.js";
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

function getVersion(): string {
  const pkg = JSON.parse(readText(PACKAGE_JSON_PATH)) as { version: string };
  return pkg.version;
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

  const env = parseEnvFile(ENV_PATH);
  const host = input.host ?? env.DEPLOY_HOST;
  const deployPath = input.path ?? env.DEPLOY_PATH ?? "/var/www/bb-chat";

  if (!host) {
    throw new AppError(
      "DEPLOY_HOST is required. Set it in .env or pass --host",
    );
  }

  const version = getVersion();
  const releaseName = `${version}-${nowStamp()}`;
  const releasesPath = `${deployPath}/releases`;
  const releasePath = `${releasesPath}/${releaseName}`;
  const deployHtmlPath = `${deployPath}/html`;

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
