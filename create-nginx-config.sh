#!/bin/bash

# create-nginx-config.sh - Скрипт для создания конфигурации Nginx
# Создает конфигурационный файл для Nginx и устанавливает его

# Проверка прав sudo
check_sudo() {
    if ! command -v sudo &> /dev/null; then
        echo "Ошибка: команда sudo не найдена. Установите sudo или запустите скрипт от имени root."
        exit 1
    fi

    # Проверяем, может ли пользователь использовать sudo
    if ! sudo -n true 2>/dev/null; then
        echo "Для выполнения этого скрипта требуются права администратора."
        echo "Вам будет предложено ввести пароль sudo."
        # Запрашиваем пароль один раз в начале
        sudo -v

        # Если пароль не был введен правильно
        if [ $? -ne 0 ]; then
            echo "Ошибка: не удалось получить права sudo."
            exit 1
        fi

        # Обновляем таймаут sudo в фоновом режиме
        (while true; do sudo -n true; sleep 50; done) &
        SUDO_PID=$!
        trap "kill -9 $SUDO_PID" EXIT
    fi
}

# Настройки по умолчанию
APP_NAME="bb-chat"
DEPLOY_PATH="/var/www/$APP_NAME"
SERVER_NAME="localhost"
SERVER_IP=""
PORT=""
USE_PORT=false
USE_IP=false

# Проверяем права sudo в начале работы скрипта
check_sudo

# Функция для вывода справки
show_help() {
    echo "Использование: $0 [опции]"
    echo ""
    echo "Опции:"
    echo "  -h, --help           Показать эту справку"
    echo "  -n, --name NAME      Имя сервера (по умолчанию: localhost)"
    echo "  -i, --ip IP          IP-адрес сервера (альтернатива имени)"
    echo "  -p, --port PORT      Порт для прослушивания (по умолчанию: 80/443)"
    echo ""
    echo "Примеры:"
    echo "  $0 --name example.com              # Создать конфиг для example.com"
    echo "  $0 --ip 192.168.1.100              # Создать конфиг для IP-адреса"
    echo "  $0 --port 8080                     # Использовать порт 8080"
    echo "  $0 --ip 192.168.1.100 --port 8080  # Использовать IP:8080"
}

# Обработка аргументов командной строки
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -h|--help)
            show_help
            exit 0
            ;;
        -n|--name)
            SERVER_NAME="$2"
            USE_IP=false
            shift
            shift
            ;;
        -i|--ip)
            SERVER_IP="$2"
            SERVER_NAME="$2"
            USE_IP=true
            shift
            shift
            ;;
        -p|--port)
            PORT="$2"
            USE_PORT=true
            shift
            shift
            ;;
        *)
            echo "Неизвестная опция: $1"
            show_help
            exit 1
            ;;
    esac
done

# Формируем listen директиву в зависимости от наличия порта
if [ "$USE_PORT" = true ]; then
    LISTEN_DIRECTIVE="listen $PORT;"
    SERVER_PORT=":$PORT"
else
    LISTEN_DIRECTIVE="listen 80;
    listen [::]:80;"
    SERVER_PORT=""
fi

# Определяем имя конфигурационного файла
if [ "$USE_IP" = true ]; then
    CONFIG_NAME="${APP_NAME}_ip"
    DISPLAY_NAME="IP-адресу $SERVER_IP"
else
    CONFIG_NAME="${APP_NAME}_${SERVER_NAME}"
    DISPLAY_NAME="домену $SERVER_NAME"
fi

# Создаем конфигурационный файл
CONFIG_FILE="/tmp/$CONFIG_NAME.conf"
cat > "$CONFIG_FILE" << EOF
server {
    $LISTEN_DIRECTIVE
    server_name $SERVER_NAME;

    root $DEPLOY_PATH/html;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Кэширование статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Запрет доступа к скрытым файлам
    location ~ /\. {
        deny all;
    }

    # Логи
    access_log /var/log/nginx/$CONFIG_NAME-access.log;
    error_log /var/log/nginx/$CONFIG_NAME-error.log;
}
EOF

echo "Конфигурационный файл создан в $CONFIG_FILE"

# Функция для проверки наличия Nginx
check_nginx() {
    if ! command -v nginx &> /dev/null; then
        echo "Предупреждение: Nginx не установлен на этой системе."
        return 1
    fi

    # Проверяем наличие директорий конфигурации
    NGINX_CONF_DIR="/etc/nginx/sites-available"
    NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"

    if [ ! -d "$NGINX_CONF_DIR" ] || [ ! -d "$NGINX_ENABLED_DIR" ]; then
        echo "Предупреждение: Стандартная структура директорий Nginx не найдена."
        return 1
    fi

    return 0
}

# Функция для установки конфигурации
install_config() {
    NGINX_CONF_DIR="/etc/nginx/sites-available"
    NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"

    # Копируем конфигурационный файл
    echo "Копируем конфигурационный файл в $NGINX_CONF_DIR/$CONFIG_NAME.conf..."
    sudo cp "$CONFIG_FILE" "$NGINX_CONF_DIR/$CONFIG_NAME.conf"

    # Создаем символическую ссылку, если она еще не существует
    if [ ! -L "$NGINX_ENABLED_DIR/$CONFIG_NAME.conf" ]; then
        echo "Создаем символическую ссылку в $NGINX_ENABLED_DIR..."
        sudo ln -s "$NGINX_CONF_DIR/$CONFIG_NAME.conf" "$NGINX_ENABLED_DIR/$CONFIG_NAME.conf"
    fi

    # Проверяем конфигурацию Nginx
    echo "Проверяем конфигурацию Nginx..."
    sudo nginx -t

    if [ $? -eq 0 ]; then
        echo "Конфигурация Nginx корректна."
        echo "Перезапускаем Nginx..."
        sudo systemctl reload nginx

        echo ""
        echo "Настройка завершена успешно!"
        if [ "$USE_PORT" = true ]; then
            echo "Ваш сайт должен быть доступен по адресу: http://$SERVER_NAME:$PORT"
        else
            echo "Ваш сайт должен быть доступен по адресу: http://$SERVER_NAME"
        fi
        echo ""

        if [ "$USE_IP" = false ] && [ "$SERVER_NAME" != "localhost" ]; then
            echo "Если вы используете домен, не забудьте настроить DNS или добавить запись в /etc/hosts:"
            echo "sudo echo '127.0.0.1 $SERVER_NAME' >> /etc/hosts"
        fi
    else
        echo "Ошибка в конфигурации Nginx. Пожалуйста, исправьте ошибки и перезапустите Nginx вручную."
    fi
}

# Проверяем наличие Nginx
if check_nginx; then
    # Nginx установлен, устанавливаем конфигурацию
    install_config
else
    # Nginx не установлен или имеет нестандартную структуру
    echo ""
    echo "Конфигурационный файл создан в $CONFIG_FILE, но не установлен."
    echo ""
    echo "Варианты действий:"
    echo ""
    echo "1. Установить Nginx (если он не установлен):"
    echo "   sudo apt update && sudo apt install nginx"
    echo ""
    echo "2. Создать необходимые директории (если они отсутствуют):"
    echo "   sudo mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled"
    echo ""
    echo "3. Установить конфигурацию вручную:"
    echo "   sudo cp $CONFIG_FILE /etc/nginx/sites-available/$CONFIG_NAME.conf"
    echo "   sudo ln -s /etc/nginx/sites-available/$CONFIG_NAME.conf /etc/nginx/sites-enabled/"
    echo "   sudo nginx -t && sudo systemctl reload nginx"
    echo ""
    echo "4. Если вы используете другую структуру конфигурации Nginx:"
    echo "   Скопируйте содержимое файла $CONFIG_FILE в соответствующее место."
    echo ""

    # Спрашиваем пользователя, хочет ли он установить Nginx
    read -p "Хотите установить Nginx сейчас? (y/n): " INSTALL_NGINX
    if [[ "$INSTALL_NGINX" =~ ^[Yy]$ ]]; then
        echo "Устанавливаем Nginx..."
        sudo apt update && sudo apt install nginx

        if [ $? -eq 0 ]; then
            echo "Nginx успешно установлен."
            echo "Создаем необходимые директории..."
            sudo mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled

            # Пробуем установить конфигурацию
            install_config
        else
            echo "Ошибка при установке Nginx. Пожалуйста, установите его вручную."
        fi
    fi
fi