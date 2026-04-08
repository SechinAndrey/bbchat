#!/usr/bin/env bash
# ============================================
# DEPRECATED: use `yarn release ...` instead.
# This script is kept only for temporary backward compatibility.
# ============================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

NEW_VERSION=""
SKIP_CHANGELOG=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --skip-changelog) SKIP_CHANGELOG=true; shift ;;
        -*) echo "Неизвестная опция: $1"; exit 1 ;;
        *) NEW_VERSION="$1"; shift ;;
    esac
done

if [[ -z "$NEW_VERSION" ]]; then
    echo "Использование: release.sh <version> [--skip-changelog]"
    echo "Пример: release.sh 0.9.0"
    exit 1
fi

TAG="v$NEW_VERSION"

# --- Проверки ---
echo "=== Проверки ==="

if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "Ошибка: есть незакоммиченные изменения. Сначала закоммить или stash."
    exit 1
fi

if git rev-parse "$TAG" >/dev/null 2>&1; then
    echo "Ошибка: тег $TAG уже существует."
    exit 1
fi

BRANCH=$(git branch --show-current)
if [[ -z "$BRANCH" ]]; then
    echo "Ошибка: detached HEAD. Переключись на ветку."
    exit 1
fi

echo "  Ветка: $BRANCH"
echo "  Версия: $NEW_VERSION"
echo "  Тег: $TAG"
echo ""

# --- Тег (нужен для git-cliff) ---
echo "=== Создаю тег $TAG ==="
git tag "$TAG"

# --- Changelog ---
if [[ "$SKIP_CHANGELOG" == false ]]; then
    echo "=== Генерирую changelog ==="
    yarn changelog
    yarn changelog:full
fi

# --- Bump version ---
echo "=== Обновляю версию ==="
bash "$SCRIPT_DIR/bump-version.sh" "$NEW_VERSION" --bump-code

# --- Показать изменения и подтвердить ---
echo ""
echo "========================================="
if [[ "$SKIP_CHANGELOG" == false ]]; then
    echo "--- Changelog (первые 30 строк) ---"
    head -30 CHANGELOG.md
    echo "---"
    echo ""
fi
echo "--- Изменения версии ---"
git diff --stat
echo ""
git diff package.json android/app/build.gradle
echo "========================================="
echo ""

read -p "Всё верно? Коммитить и пушить? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Отмена. Откатываю тег и изменения..."
    git tag -d "$TAG"
    git checkout -- .
    echo "Откат завершён."
    exit 1
fi

# --- Коммит ---
echo "=== Создаю коммит ==="
git add package.json android/app/build.gradle
if [[ "$SKIP_CHANGELOG" == false ]]; then
    git add CHANGELOG.md CHANGELOG.full.md
fi
git commit -m "chore: release version $NEW_VERSION"

# --- Перенос тега на коммит релиза ---
echo "=== Переношу тег на коммит релиза ==="
git tag -f "$TAG"

# --- Push ---
echo "=== Push ==="
git push origin "$BRANCH"
git push origin "$TAG"

echo ""
echo "=== Релиз $NEW_VERSION завершён! ==="
echo ""
echo "Следующие шаги:"
echo "  yarn deploy:web              # Деплой на сервер"
echo "  yarn build:apk stable        # Сборка stable APK"
echo "  yarn build:apk prod          # Сборка prod APK"
