#!/bin/bash

# deploy.sh - Скрипт для деплоя новой версии приложения
# Создает новую версию в директории releases и обновляет символическую ссылку

# Настройки
APP_NAME="bb-chat"
DEPLOY_PATH="/var/www/$APP_NAME"
RELEASES_PATH="$DEPLOY_PATH/releases"
KEEP_RELEASES=5  # Количество сохраняемых последних релизов

# Проверяем наличие директории dist
if [ ! -d "dist" ]; then
    echo "Ошибка: Директория dist не найдена!"
    echo "Сначала выполните сборку проекта командой: npm run build"
    exit 1
fi

# Создаем директории, если они не существуют
if [ ! -d "$DEPLOY_PATH" ]; then
    echo "Создаем директорию $DEPLOY_PATH..."
    sudo mkdir -p "$DEPLOY_PATH"
fi

if [ ! -d "$RELEASES_PATH" ]; then
    echo "Создаем директорию для релизов..."
    sudo mkdir -p "$RELEASES_PATH"
fi

# Определяем номер новой версии
LAST_VERSION=0
if [ -n "$(ls -A $RELEASES_PATH 2>/dev/null)" ]; then
    for dir in "$RELEASES_PATH"/*; do
        if [ -d "$dir" ]; then
            VERSION_NUM=$(basename "$dir" | cut -d'-' -f1)
            if [[ "$VERSION_NUM" =~ ^[0-9]+$ ]]; then
                if [ "$VERSION_NUM" -gt "$LAST_VERSION" ]; then
                    LAST_VERSION=$VERSION_NUM
                fi
            fi
        fi
    done
fi

NEW_VERSION=$((LAST_VERSION + 1))
TIMESTAMP=$(date +%Y%m%d%H%M%S)
RELEASE_NAME="$NEW_VERSION-$TIMESTAMP"
RELEASE_PATH="$RELEASES_PATH/$RELEASE_NAME"

echo "Создаем новую версию: $RELEASE_NAME"

# Создаем директорию для новой версии
sudo mkdir -p "$RELEASE_PATH"

# Копируем файлы из dist в новую версию
echo "Копируем файлы..."
sudo cp -R dist/* "$RELEASE_PATH/"

# Устанавливаем права доступа
echo "Устанавливаем права доступа..."
sudo chown -R $(whoami):www-data "$RELEASE_PATH"
sudo chmod -R 775 "$RELEASE_PATH"

# Обновляем символическую ссылку
echo "Обновляем символическую ссылку..."
sudo ln -sfn "$RELEASE_PATH" "$DEPLOY_PATH/html"

# Удаляем старые релизы, оставляя только последние KEEP_RELEASES
echo "Проверяем наличие старых релизов..."
RELEASES_COUNT=$(find "$RELEASES_PATH" -maxdepth 1 -type d | wc -l)
RELEASES_COUNT=$((RELEASES_COUNT - 1))  # Вычитаем саму директорию releases

if [ "$RELEASES_COUNT" -gt "$KEEP_RELEASES" ]; then
    echo "Найдено $RELEASES_COUNT релизов, удаляем старые релизы..."
    RELEASES_TO_DELETE=$((RELEASES_COUNT - KEEP_RELEASES))
    
    # Получаем список релизов, отсортированных по времени создания (старые в начале)
    OLD_RELEASES=$(find "$RELEASES_PATH" -maxdepth 1 -type d -not -path "$RELEASES_PATH" | sort)
    
    # Удаляем старые релизы
    COUNT=0
    for release in $OLD_RELEASES; do
        if [ "$COUNT" -lt "$RELEASES_TO_DELETE" ]; then
            echo "Удаляем старый релиз: $(basename "$release")"
            sudo rm -rf "$release"
            COUNT=$((COUNT + 1))
        else
            break
        fi
    done
    
    echo "Удалено $COUNT старых релизов."
else
    echo "Найдено $RELEASES_COUNT релизов, удаление не требуется."
fi

echo ""
echo "Деплой успешно завершен!"
echo "Новая версия $RELEASE_NAME доступна по адресу: $DEPLOY_PATH/html"
echo "Для отката на предыдущую версию используйте: ./rollback.sh"
