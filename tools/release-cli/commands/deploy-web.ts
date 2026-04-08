import { resolve } from "node:path";
import type { DeployOptions } from "../types.js";
import {
  logSection,
  runWrite,
  fail,
  logSuccess,
  logKeyValue,
} from "../utils/runner.js";
import { parseEnvFile } from "../utils/env.js";
import { getPackageVersion } from "../utils/version.js";
import { runRemoteScript } from "../utils/remote.js";

export function runDeployWeb(options: DeployOptions): void {
  const env = parseEnvFile(resolve(process.cwd(), ".env"));
  const host = options.host ?? env.DEPLOY_HOST;
  const deployPath = options.path ?? env.DEPLOY_PATH ?? "/var/www/bb-chat";

  if (!host) {
    fail("DEPLOY_HOST не задан. Укажи --host или добавь DEPLOY_HOST в .env");
  }

  const version = getPackageVersion();
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "")
    .replace("T", "");

  const releaseName = `${version}-${timestamp}`;
  const releasesPath = `${deployPath}/releases`;

  logSection("Web deploy");
  logKeyValue("Host", host);
  logKeyValue("Path", deployPath);
  logKeyValue("Mode", options.mode);
  logKeyValue("Release", releaseName);

  runWrite("yarn", ["vue-tsc", "--noEmit"]);
  runWrite("yarn", ["vite", "build", "--mode", options.mode]);

  runRemoteScript(
    host,
    `
set -euo pipefail
mkdir -p "$1/$2"
`,
    [releasesPath, releaseName],
  );

  runWrite("rsync", [
    "-az",
    "--delete",
    "dist/",
    `${host}:${releasesPath}/${releaseName}/`,
  ]);

  const remoteScript = `
set -euo pipefail
DEPLOY_PATH="$1"
RELEASES_PATH="$2"
RELEASE_NAME="$3"
KEEP_RELEASES="$4"

chown -R "$(whoami)":www-data "$RELEASES_PATH/$RELEASE_NAME" 2>/dev/null || true
chmod -R 775 "$RELEASES_PATH/$RELEASE_NAME" 2>/dev/null || true
ln -sfn "$RELEASES_PATH/$RELEASE_NAME" "$DEPLOY_PATH/html"

COUNT=$(find "$RELEASES_PATH" -mindepth 1 -maxdepth 1 -type d | wc -l)
if [[ "$COUNT" -gt "$KEEP_RELEASES" ]]; then
  TO_DELETE=$((COUNT - KEEP_RELEASES))
  find "$RELEASES_PATH" -mindepth 1 -maxdepth 1 -type d | sort -V | head -n "$TO_DELETE" | while read -r rel; do
    rm -rf "$rel"
  done
fi
`;

  runRemoteScript(host, remoteScript, [
    deployPath,
    releasesPath,
    releaseName,
    String(options.keep),
  ]);

  logSuccess("Деплой завершлен");
}
