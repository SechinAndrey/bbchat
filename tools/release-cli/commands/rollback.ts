import { resolve } from "node:path";
import type { RollbackOptions } from "../types.js";
import { logSection, fail, logKeyValue } from "../utils/runner.js";
import { parseEnvFile } from "../utils/env.js";
import { runRemoteScript } from "../utils/remote.js";

export function runRollback(options: RollbackOptions): void {
  const env = parseEnvFile(resolve(process.cwd(), ".env"));
  const host = options.host ?? env.DEPLOY_HOST;
  const deployPath = options.path ?? env.DEPLOY_PATH ?? "/var/www/bb-chat";

  if (!host) {
    fail("DEPLOY_HOST не задан. Укажи --host или добавь DEPLOY_HOST в .env");
  }

  const releasesPath = `${deployPath}/releases`;

  logSection("Rollback");
  logKeyValue("Host", host);
  logKeyValue("Path", deployPath);
  if (options.version) {
    logKeyValue("Target", options.version);
  }

  const remoteScript = `
set -euo pipefail
DEPLOY_PATH="$1"
RELEASES_PATH="$2"
VERSION_PARAM="$3"

if [[ ! -d "$RELEASES_PATH" ]]; then
  echo "Ошибка: директория релизов не найдена: $RELEASES_PATH"
  exit 1
fi

if [[ ! -L "$DEPLOY_PATH/html" ]]; then
  echo "Ошибка: symlink html не найден"
  exit 1
fi

CURRENT="$(basename "$(readlink -f "$DEPLOY_PATH/html")")"
RELEASES=$(find "$RELEASES_PATH" -mindepth 1 -maxdepth 1 -type d | sort -V)

if [[ -z "$RELEASES" ]]; then
  echo "Ошибка: релизы отсутствуют"
  exit 1
fi

TARGET=""
if [[ -n "$VERSION_PARAM" ]]; then
  while IFS= read -r rel; do
    name="$(basename "$rel")"
    if [[ "$name" == "$VERSION_PARAM" || "$name" == "$VERSION_PARAM"-* ]]; then
      TARGET="$name"
    fi
  done <<< "$RELEASES"
  
  if [[ -z "$TARGET" ]]; then
    echo "Ошибка: релиз '$VERSION_PARAM' не найден"
    exit 1
  fi
else
  PREV=""
  while IFS= read -r rel; do
    name="$(basename "$rel")"
    if [[ "$name" == "$CURRENT" ]]; then
      break
    fi
    PREV="$name"
  done <<< "$RELEASES"
  
  if [[ -z "$PREV" ]]; then
    echo "Ошибка: предыдущая версия не найдена"
    exit 1
  fi
  
  TARGET="$PREV"
fi

ln -sfn "$RELEASES_PATH/$TARGET" "$DEPLOY_PATH/html"
echo "Откат завершён: $CURRENT -> $TARGET"
`;

  runRemoteScript(host, remoteScript, [
    deployPath,
    releasesPath,
    options.version ?? "",
  ]);
}
