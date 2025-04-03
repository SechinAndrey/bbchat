#!/bin/bash

# Скрипт для установки прав на выполнение для всех скриптов деплоя
# Запустите этот скрипт один раз после клонирования репозитория

echo "Устанавливаем права на выполнение для скриптов..."
chmod +x ./setup.sh
chmod +x ./deploy.sh
chmod +x ./rollback.sh
chmod +x ./create-nginx-config.sh

echo "Готово! Теперь все скрипты можно запускать."
echo "Для полной настройки окружения выполните: ./setup.sh"
echo ""
echo "Для настройки Nginx вы можете использовать:"
echo "./create-nginx-config.sh --name your-domain.com     # Для домена"
echo "./create-nginx-config.sh --ip 192.168.1.100         # Для IP-адреса"
echo "./create-nginx-config.sh --port 8080                # Для нестандартного порта"
echo "./create-nginx-config.sh --help                     # Для справки"
