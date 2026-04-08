#!/usr/bin/env bash
# ================================================
# DEPRECATED: use `yarn bump-version ...` instead.
# This script is kept only for temporary backward compatibility.
# ================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

NEW_VERSION=""
BUMP_CODE=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --bump-code) BUMP_CODE=true; shift ;;
        -*) echo "Неизвестная опция: $1"; exit 1 ;;
        *) NEW_VERSION="$1"; shift ;;
    esac
done

if [[ -z "$NEW_VERSION" ]]; then
    echo "Использование: bump-version.sh <version> [--bump-code]"
    echo "Пример: bump-version.sh 0.9.0 --bump-code"
    exit 1
fi

if ! [[ "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Ошибка: версия должна быть в формате X.Y.Z, получено: $NEW_VERSION"
    exit 1
fi

echo "Обновляю версию до $NEW_VERSION..."

# 1. package.json
cd "$PROJECT_ROOT"
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  pkg.version = '$NEW_VERSION';
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"
echo "  package.json обновлён"

# 2. android/app/build.gradle
GRADLE_FILE="$PROJECT_ROOT/android/app/build.gradle"
sed -i "s/versionName \"[^\"]*\"/versionName \"$NEW_VERSION\"/" "$GRADLE_FILE"

if [[ "$BUMP_CODE" == true ]]; then
    CURRENT_CODE=$(grep -oP 'versionCode \K[0-9]+' "$GRADLE_FILE")
    NEW_CODE=$((CURRENT_CODE + 1))
    sed -i "s/versionCode $CURRENT_CODE/versionCode $NEW_CODE/" "$GRADLE_FILE"
    echo "  build.gradle обновлён (versionName=$NEW_VERSION, versionCode=$NEW_CODE)"
else
    echo "  build.gradle обновлён (versionName=$NEW_VERSION)"
fi

echo "Готово."
