#!/bin/bash

# Скрипт для установки прав на выполнение для всех скриптов деплоя
# и настройки Git для правильного отслеживания исполняемых файлов
# Запустите этот скрипт один раз после клонирования репозитория

# Функция для обработки одного скрипта
make_executable() {
    local script=$1
    echo "Обрабатываем скрипт: $script"

    # Устанавливаем права на выполнение
    chmod +x "$script"

    # Обновляем индекс Git для отслеживания исполняемого бита
    if [ -d ".git" ] || git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
        git update-index --chmod=+x "$script"
        echo "  ✓ Права на выполнение установлены и отмечены в Git"
    else
        echo "  ✓ Права на выполнение установлены (Git не обнаружен)"
    fi
}

echo "Устанавливаем права на выполнение для всех скриптов..."

# Обрабатываем конкретные скрипты
make_executable "./setup.sh"
make_executable "./deploy.sh"
make_executable "./rollback.sh"
make_executable "./create-nginx-config.sh"
make_executable "./prepare-scripts.sh"  # текущий скрипт тоже

# Опционально: найти и обработать все .sh файлы в репозитории
read -p "Обработать все .sh файлы в репозитории? (y/n): " answer
if [[ "$answer" == "y" || "$answer" == "Y" ]]; then
    echo "Поиск всех .sh файлов в репозитории..."
    for script in $(find . -name "*.sh"); do
        make_executable "$script"
    done
fi

echo ""
echo "Готово! Теперь все скрипты можно запускать."

# Информация о коммите изменений
if [ -d ".git" ] || git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo ""
    echo "Для сохранения изменений в Git выполните:"
    echo "git commit -m \"Установить права на выполнение для скриптов\""
    echo "git push"
fi

echo ""
echo "Для полной настройки окружения выполните: ./setup.sh"
echo ""
echo "Для настройки Nginx вы можете использовать:"
echo "./create-nginx-config.sh --name your-domain.com     # Для домена"
echo "./create-nginx-config.sh --ip 192.168.1.100         # Для IP-адреса"
echo "./create-nginx-config.sh --port 8080                # Для нестандартного порта"
echo "./create-nginx-config.sh --help                     # Для справки"
