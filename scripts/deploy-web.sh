#!/usr/bin/env bash
# ===============================================
# DEPRECATED: use `yarn deploy:web ...` instead.
# This script is kept only for temporary backward compatibility.
# ===============================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# --- Читаем конфиг из .env ---
if [[ -f ".env" ]]; then
    DEPLOY_HOST=$(grep -oP '^DEPLOY_HOST=\K.*' .env 2>/dev/null || true)
    DEPLOY_PATH=$(grep -oP '^DEPLOY_PATH=\K.*' .env 2>/dev/null || true)
fi

MODE="production"
KEEP_RELEASES=5

while [[ $# -gt 0 ]]; do
    case "$1" in
        --host) DEPLOY_HOST="$2"; shift 2 ;;
        --path) DEPLOY_PATH="$2"; shift 2 ;;
        --mode) MODE="$2"; shift 2 ;;
        --keep) KEEP_RELEASES="$2"; shift 2 ;;
        -*) echo "Неизвестная опция: $1"; exit 1 ;;
    esac
done

if [[ -z "${DEPLOY_HOST:-}" ]]; then
    echo "Ошибка: DEPLOY_HOST не задан."
    echo "Добавь DEPLOY_HOST=user@server в .env или передай --host user@server"
    exit 1
fi

if [[ -z "${DEPLOY_PATH:-}" ]]; then
    DEPLOY_PATH="/var/www/bb-chat"
fi

RELEASES_PATH="$DEPLOY_PATH/releases"
VERSION=$(node -p "require('./package.json').version")
TIMESTAMP=$(date +%Y%m%d%H%M%S)
RELEASE_NAME="${VERSION}-${TIMESTAMP}"

echo "=== Web Deploy ==="
echo "  Хост: $DEPLOY_HOST"
echo "  Путь: $DEPLOY_PATH"
echo "  Режим: $MODE"
echo "  Версия: $VERSION"
echo "  Релиз: $RELEASE_NAME"
echo ""

# --- 1. Сборка ---
echo "=== Сборка (mode=$MODE) ==="
yarn vue-tsc --noEmit
yarn vite build --mode "$MODE"

# --- 2. Создать директорию релиза на сервере ---
echo "=== Создаю релиз на сервере ==="
ssh "$DEPLOY_HOST" "mkdir -p '$RELEASES_PATH/$RELEASE_NAME'"

# --- 3. Отправить файлы ---
echo "=== Отправляю файлы ==="
rsync -az --delete dist/ "$DEPLOY_HOST:$RELEASES_PATH/$RELEASE_NAME/"

# --- 4. Обновить symlink и почистить старые релизы ---
echo "=== Обновляю symlink и чищу старые релизы ==="
ssh "$DEPLOY_HOST" bash -s "$DEPLOY_PATH" "$RELEASES_PATH" "$RELEASE_NAME" "$KEEP_RELEASES" << 'REMOTE_SCRIPT'
    DEPLOY_PATH="$1"
    RELEASES_PATH="$2"
    RELEASE_NAME="$3"
    KEEP_RELEASES="$4"

    # Права доступа
    chown -R $(whoami):www-data "$RELEASES_PATH/$RELEASE_NAME" 2>/dev/null || true
    chmod -R 775 "$RELEASES_PATH/$RELEASE_NAME" 2>/dev/null || true

    # Обновить symlink
    ln -sfn "$RELEASES_PATH/$RELEASE_NAME" "$DEPLOY_PATH/html"
    echo "  Symlink обновлён: html -> $RELEASE_NAME"

    # Удалить старые релизы (числовая сортировка, фикс бага с версией 10+)
    RELEASES=$(ls -1d "$RELEASES_PATH"/*/ 2>/dev/null | sort -V)
    COUNT=$(echo "$RELEASES" | wc -l)

    if [[ "$COUNT" -gt "$KEEP_RELEASES" ]]; then
        TO_DELETE=$((COUNT - KEEP_RELEASES))
        echo "$RELEASES" | head -n "$TO_DELETE" | while read -r old_release; do
            echo "  Удаляю: $(basename "$old_release")"
            rm -rf "$old_release"
        done
    fi
REMOTE_SCRIPT

echo ""
echo "=== Деплой завершён! ==="
echo "Релиз $RELEASE_NAME доступен на сервере."
echo "Для отката: yarn rollback"
