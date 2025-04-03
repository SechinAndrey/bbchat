#!/bin/bash

# rollback.sh - Скрипт для отката к предыдущей версии приложения
# Обновляет символическую ссылку на предыдущую версию

# Настройки
APP_NAME="bb-chat"
DEPLOY_PATH="/var/www/$APP_NAME"
RELEASES_PATH="$DEPLOY_PATH/releases"

# Проверяем наличие директории releases
if [ ! -d "$RELEASES_PATH" ]; then
    echo "Ошибка: Директория релизов не найдена!"
    exit 1
fi

# Проверяем наличие релизов
if [ -z "$(ls -A $RELEASES_PATH 2>/dev/null)" ]; then
    echo "Ошибка: Релизы отсутствуют!"
    exit 1
fi

# Получаем текущую версию
CURRENT_RELEASE=""
if [ -L "$DEPLOY_PATH/html" ]; then
    CURRENT_RELEASE=$(basename $(readlink -f "$DEPLOY_PATH/html"))
    echo "Текущая версия: $CURRENT_RELEASE"
else
    echo "Ошибка: Символическая ссылка html не найдена или повреждена!"
    exit 1
fi

# Определяем версию для отката
TARGET_RELEASE=""

# Если передан параметр, пытаемся использовать его как номер версии или имя релиза
if [ -n "$1" ]; then
    # Проверяем, является ли параметр числом (номером версии)
    if [[ "$1" =~ ^[0-9]+$ ]]; then
        echo "Ищем релиз с номером $1..."
        # Ищем релиз с указанным номером
        for release in "$RELEASES_PATH"/*; do
            if [ -d "$release" ]; then
                RELEASE_NAME=$(basename "$release")
                VERSION_NUM=$(echo "$RELEASE_NAME" | cut -d'-' -f1)
                if [ "$VERSION_NUM" -eq "$1" ]; then
                    TARGET_RELEASE="$RELEASE_NAME"
                    break
                fi
            fi
        done
        
        if [ -z "$TARGET_RELEASE" ]; then
            echo "Ошибка: Релиз с номером $1 не найден!"
            exit 1
        fi
    else
        # Проверяем, существует ли релиз с указанным именем
        if [ -d "$RELEASES_PATH/$1" ]; then
            TARGET_RELEASE="$1"
        else
            echo "Ошибка: Релиз с именем $1 не найден!"
            exit 1
        fi
    fi
else
    # Если параметр не передан, откатываемся на предыдущую версию
    echo "Ищем предыдущую версию..."
    
    # Получаем список всех релизов, отсортированных по номеру версии (в порядке убывания)
    ALL_RELEASES=$(find "$RELEASES_PATH" -maxdepth 1 -type d -not -path "$RELEASES_PATH" | sort -r)
    
    # Находим текущий релиз в списке и берем следующий за ним
    FOUND_CURRENT=false
    for release in $ALL_RELEASES; do
        RELEASE_NAME=$(basename "$release")
        
        if [ "$FOUND_CURRENT" = true ]; then
            TARGET_RELEASE="$RELEASE_NAME"
            break
        fi
        
        if [ "$RELEASE_NAME" = "$CURRENT_RELEASE" ]; then
            FOUND_CURRENT=true
        fi
    done
    
    if [ -z "$TARGET_RELEASE" ]; then
        echo "Ошибка: Предыдущая версия не найдена!"
        echo "Возможно, текущая версия является самой старой."
        exit 1
    fi
fi

echo "Выполняем откат на версию: $TARGET_RELEASE"

# Проверяем, существует ли директория целевого релиза
if [ ! -d "$RELEASES_PATH/$TARGET_RELEASE" ]; then
    echo "Ошибка: Директория релиза $TARGET_RELEASE не найдена!"
    exit 1
fi

# Обновляем символическую ссылку
echo "Обновляем символическую ссылку..."
sudo ln -sfn "$RELEASES_PATH/$TARGET_RELEASE" "$DEPLOY_PATH/html"

echo ""
echo "Откат успешно завершен!"
echo "Приложение переключено c $CURRENT_RELEASE на $TARGET_RELEASE."
