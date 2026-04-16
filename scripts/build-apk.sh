#!/usr/bin/env bash
# ==============================================
# DEPRECATED: use `yarn build:apk ...` instead.
# This script is kept only for temporary backward compatibility.
# ==============================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

ENV=""
VITE_MODE=""
NO_UPLOAD=false
UPLOAD_URL=""

# Читаем URL для загрузки из .env
if [[ -f ".env" ]]; then
    UPLOAD_URL=$(grep -oP '^APK_UPLOAD_URL=\K.*' .env 2>/dev/null || true)
fi

while [[ $# -gt 0 ]]; do
    case "$1" in
        stable)
            ENV="stable"
            VITE_MODE="stable"
            shift ;;
        prod|production)
            ENV="prod"
            VITE_MODE="production"
            shift ;;
        --no-upload)
            NO_UPLOAD=true
            shift ;;
        --upload-url)
            UPLOAD_URL="$2"
            shift 2 ;;
        *)
            echo "Неизвестный аргумент: $1"
            echo "Использование: build-apk.sh <stable|prod> [--no-upload] [--upload-url URL]"
            exit 1 ;;
    esac
done

if [[ -z "$ENV" ]]; then
    echo "Использование: build-apk.sh <stable|prod> [--no-upload] [--upload-url URL]"
    echo ""
    echo "Примеры:"
    echo "  build-apk.sh stable              # Собрать и загрузить stable APK"
    echo "  build-apk.sh prod --no-upload    # Собрать prod APK без загрузки"
    exit 1
fi

VERSION=$(node -p "require('./package.json').version")
OUTPUT_DIR="$PROJECT_ROOT/apk-output"
APK_NAME="${ENV}-${VERSION}.apk"
SOURCE_APK="$PROJECT_ROOT/android/app/build/outputs/apk/debug/app-debug.apk"

echo "=== Сборка APK ==="
echo "  Окружение: $ENV (vite mode: $VITE_MODE)"
echo "  Версия: $VERSION"
echo "  Результат: $OUTPUT_DIR/$APK_NAME"
echo ""

# --- 1. Vite build ---
echo "=== 1/4: Vite build (mode=$VITE_MODE) ==="
yarn vue-tsc --noEmit
yarn vite build --mode "$VITE_MODE"

# --- 2. Capacitor sync ---
echo "=== 2/4: Capacitor sync ==="
npx cap sync android

# --- 3. Gradle build ---
echo "=== 3/4: Gradle build ==="
cd "$PROJECT_ROOT/android"
./gradlew clean assembleDebug
cd "$PROJECT_ROOT"

# --- 4. Копирование и переименование ---
echo "=== 4/4: Упаковка ==="
if [[ ! -f "$SOURCE_APK" ]]; then
    echo "Ошибка: APK не найден: $SOURCE_APK"
    exit 1
fi

mkdir -p "$OUTPUT_DIR"
cp "$SOURCE_APK" "$OUTPUT_DIR/$APK_NAME"
echo "  APK: $OUTPUT_DIR/$APK_NAME"
echo "  Размер: $(du -h "$OUTPUT_DIR/$APK_NAME" | cut -f1)"

# --- 5. Загрузка (опционально) ---
if [[ "$NO_UPLOAD" == false ]]; then
    if [[ -n "$UPLOAD_URL" ]]; then
        echo ""
        echo "=== Загрузка APK ==="
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
            -F "file=@$OUTPUT_DIR/$APK_NAME" \
            "$UPLOAD_URL")

        if [[ "$HTTP_CODE" -ge 200 && "$HTTP_CODE" -lt 300 ]]; then
            echo "  Загружено успешно (HTTP $HTTP_CODE)"
        else
            echo "  Ошибка загрузки (HTTP $HTTP_CODE)"
            exit 1
        fi
    else
        echo ""
        echo "APK_UPLOAD_URL не задан в .env — загрузка пропущена."
        echo "APK доступен локально: $OUTPUT_DIR/$APK_NAME"
    fi
else
    echo ""
    echo "Загрузка пропущена (--no-upload)."
fi

echo ""
echo "=== Сборка $ENV APK завершена! ==="
