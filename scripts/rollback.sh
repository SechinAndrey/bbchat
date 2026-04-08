#!/usr/bin/env bash
# ============================================
# DEPRECATED: use `yarn rollback ...` instead.
# This script is kept only for temporary backward compatibility.
# ============================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# --- Читаем конфиг из .env ---
if [[ -f ".env" ]]; then
    DEPLOY_HOST=$(grep -oP '^DEPLOY_HOST=\K.*' .env 2>/dev/null || true)
    DEPLOY_PATH=$(grep -oP '^DEPLOY_PATH=\K.*' .env 2>/dev/null || true)
fi

VERSION_PARAM=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --host) DEPLOY_HOST="$2"; shift 2 ;;
        --path) DEPLOY_PATH="$2"; shift 2 ;;
        -*) echo "Неизвестная опция: $1"; exit 1 ;;
        *) VERSION_PARAM="$1"; shift ;;
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

echo "=== Откат ==="
echo "  Хост: $DEPLOY_HOST"
echo "  Путь: $DEPLOY_PATH"

if [[ -n "$VERSION_PARAM" ]]; then
    echo "  Цель: $VERSION_PARAM"
fi
echo ""

ssh "$DEPLOY_HOST" bash -s "$DEPLOY_PATH" "$RELEASES_PATH" "${VERSION_PARAM:-}" << 'REMOTE_SCRIPT'
    DEPLOY_PATH="$1"
    RELEASES_PATH="$2"
    VERSION_PARAM="$3"

    if [[ ! -d "$RELEASES_PATH" ]]; then
        echo "Ошибка: директория релизов не найдена: $RELEASES_PATH"
        exit 1
    fi

    # Текущий релиз
    if [[ -L "$DEPLOY_PATH/html" ]]; then
        CURRENT=$(basename "$(readlink -f "$DEPLOY_PATH/html")")
        echo "Текущая версия: $CURRENT"
    else
        echo "Ошибка: symlink html не найден"
        exit 1
    fi

    # Список релизов (version sort — фикс бага с 10+)
    RELEASES=$(ls -1d "$RELEASES_PATH"/*/ 2>/dev/null | sort -V)

    if [[ -n "$VERSION_PARAM" ]]; then
        # Ищем конкретный релиз по совпадению с началом имени
        TARGET=$(echo "$RELEASES" | grep "/$VERSION_PARAM" | tail -1 || true)
        if [[ -z "$TARGET" ]]; then
            echo "Ошибка: релиз '$VERSION_PARAM' не найден."
            echo "Доступные релизы:"
            echo "$RELEASES" | while read -r r; do basename "$r"; done
            exit 1
        fi
    else
        # Предыдущий релиз
        TARGET=$(echo "$RELEASES" | grep -B1 "/$CURRENT/" | head -1 || true)
        if [[ -z "$TARGET" || "$TARGET" == *"$CURRENT"* ]]; then
            echo "Ошибка: предыдущая версия не найдена."
            exit 1
        fi
    fi

    TARGET_NAME=$(basename "$TARGET")
    echo "Откатываюсь на: $TARGET_NAME"
    ln -sfn "$RELEASES_PATH/$TARGET_NAME" "$DEPLOY_PATH/html"
    echo ""
    echo "Откат завершён: $CURRENT -> $TARGET_NAME"
REMOTE_SCRIPT
