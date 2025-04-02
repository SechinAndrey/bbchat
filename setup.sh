#!/bin/bash

# setup.sh - Скрипт для первоначальной настройки проекта на новом сервере
# Выполняет все необходимые действия для подготовки проекта к работе

echo "Начинаем настройку проекта..."

# Устанавливаем права на выполнение для скриптов деплоя и отката
echo "Устанавливаем права на выполнение для скриптов..."
chmod +x deploy-versioned.sh rollback.sh

# Проверяем наличие необходимых директорий на сервере
APP_NAME="bb-chat"
DEPLOY_PATH="/var/www/$APP_NAME"

echo "Проверяем наличие директорий для деплоя..."
if [ ! -d "$DEPLOY_PATH" ]; then
    echo "Создаем директорию $DEPLOY_PATH..."
    sudo mkdir -p "$DEPLOY_PATH"
    sudo mkdir -p "$DEPLOY_PATH/releases"
    
    # Устанавливаем правильные права доступа
    echo "Устанавливаем права доступа..."
    sudo chown -R $(whoami):www-data "$DEPLOY_PATH"
    sudo chmod -R 775 "$DEPLOY_PATH"
    
    echo "Структура директорий создана успешно!"
else
    echo "Директория $DEPLOY_PATH уже существует."
    
    # Проверяем наличие директории releases
    if [ ! -d "$DEPLOY_PATH/releases" ]; then
        echo "Создаем директорию для релизов..."
        sudo mkdir -p "$DEPLOY_PATH/releases"
        sudo chown -R $(whoami):www-data "$DEPLOY_PATH/releases"
        sudo chmod -R 775 "$DEPLOY_PATH/releases"
    fi
fi

# Проверяем наличие символической ссылки html
if [ ! -L "$DEPLOY_PATH/html" ] && [ ! -d "$DEPLOY_PATH/html" ]; then
    echo "Символическая ссылка html не найдена."
    
    # Проверяем, есть ли уже релизы для создания ссылки
    if [ -n "$(ls -A $DEPLOY_PATH/releases 2>/dev/null)" ]; then
        # Берем последний релиз по дате создания
        LATEST_RELEASE=$(ls -t "$DEPLOY_PATH/releases" | head -n 1)
        echo "Найден существующий релиз: $LATEST_RELEASE"
        echo "Создаем символическую ссылку на него..."
        sudo ln -sfn "$DEPLOY_PATH/releases/$LATEST_RELEASE" "$DEPLOY_PATH/html"
    else
        echo "Релизы отсутствуют. Символическая ссылка будет создана при первом деплое."
    fi
else
    echo "Символическая ссылка html уже существует."
fi

# Проверяем наличие директории dist для деплоя
if [ ! -d "dist" ]; then
    echo "Внимание: Директория dist не найдена в текущей директории."
    echo "Для деплоя необходимо сначала собрать проект, чтобы создать директорию dist."
fi

echo ""
echo "Настройка завершена успешно!"
echo "Теперь вы можете использовать следующие команды:"
echo "  ./deploy.sh - для деплоя новой версии"
echo "  ./rollback.sh - для отката на предыдущую версию"
echo "  ./rollback.sh 2 - для отката на версию с номером 2"
echo ""
echo "Подробная информация доступна в README.md"
