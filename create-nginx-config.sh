#!/bin/bash

# nginx-iframe-config.sh - Скрипт для создания конфигурации Nginx с поддержкой iframe
# Создает конфигурационный файл для Nginx, разрешающий встраивание в iframe

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
ALLOWED_ORIGINS="*"  # По умолчанию разрешаем все домены

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
    echo "  -o, --origins ORIGINS Разрешенные домены для CORS (по умолчанию: *)"
    echo ""
    echo "Примеры:"
    echo "  $0 --name example.com                                # Создать конфиг для example.com"
    echo "  $0 --ip 192.168.1.100 --port 8080                    # Использовать IP:8080"
    echo "  $0 --origins 'https://example.com https://test.com'  # Разрешить только указанные домены"
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
        -o|--origins)
            ALLOWED_ORIGINS="$2"
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

    # Разрешаем CORS для всех запросов
    add_header 'Access-Control-Allow-Origin' '$ALLOWED_ORIGINS' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range' always;
    
    # Разрешаем встраивание в iframe
    add_header 'X-Frame-Options' 'ALLOWALL' always;
    add_header 'Content-Security-Policy' "frame-ancestors $ALLOWED_ORIGINS" always;

    location / {
        try_files \$uri \$uri/ /index.html;
        
        # Для OPTIONS запросов (preflight)
        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '$ALLOWED_ORIGINS' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range' always;
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    # Кэширование статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
        add_header 'Access-Control-Allow-Origin' '$ALLOWED_ORIGINS' always;
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
    # Проверяем, установлен ли Nginx
    if ! command -v nginx &> /dev/null; then
        echo "Предупреждение: Nginx не установлен на этой системе."
        return 1
    fi

    # Проверяем, запущен ли Nginx
    if ! systemctl is-active --quiet nginx; then
        echo "Предупреждение: Nginx установлен, но не запущен."
        echo "Запустите его командой: sudo systemctl start nginx"
        return 1
    fi

    # Определяем директории конфигурации
    # Сначала проверяем стандартную структуру sites-available/sites-enabled
    if [ -d "/etc/nginx/sites-available" ] && [ -d "/etc/nginx/sites-enabled" ]; then
        NGINX_CONF_DIR="/etc/nginx/sites-available"
        NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"
        export USING_CONFD=false
        return 0
    # Если стандартная структура не найдена, используем conf.d
    elif [ -d "/etc/nginx/conf.d" ]; then
        NGINX_CONF_DIR="/etc/nginx/conf.d"
        NGINX_ENABLED_DIR="/etc/nginx/conf.d"
        export USING_CONFD=true
        return 0
    else
        echo "Предупреждение: Не найдена стандартная структура директорий Nginx."
        return 1
    fi
}

# Функция для установки конфигурации
install_config() {
    # Переменные NGINX_CONF_DIR и NGINX_ENABLED_DIR уже установлены в check_nginx
    # Не нужно их переопределять здесь

    # Копируем конфигурационный файл
    echo "Копируем конфигурационный файл в $NGINX_CONF_DIR/$CONFIG_NAME.conf..."
    sudo cp "$CONFIG_FILE" "$NGINX_CONF_DIR/$CONFIG_NAME.conf"

    # Создаем символическую ссылку только если используем стандартную структуру
    if [ "$USING_CONFD" = false ] && [ ! -L "$NGINX_ENABLED_DIR/$CONFIG_NAME.conf" ]; then
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
            echo "Теперь вы можете встраивать его в iframe на другом сайте:"
            echo "<iframe src=\"http://$SERVER_NAME:$PORT\" width=\"800\" height=\"600\"></iframe>"
        else
            echo "Ваш сайт должен быть доступен по адресу: http://$SERVER_NAME"
            echo "Теперь вы можете встраивать его в iframe на другом сайте:"
            echo "<iframe src=\"http://$SERVER_NAME\" width=\"800\" height=\"600\"></iframe>"
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
    if ! command -v nginx &> /dev/null; then
        echo "1. Nginx не установлен. Установите его с помощью менеджера пакетов вашей системы."
        echo "   Например: sudo apt install nginx"
        echo ""
    fi
    echo "2. Создать необходимые директории (если они отсутствуют):"
    echo "   sudo mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled"
    echo "   И добавьте в nginx.conf строку: include /etc/nginx/sites-enabled/*.conf;"
    echo ""
    echo "3. Установить конфигурацию вручную:"
    if [ -d "/etc/nginx/conf.d" ]; then
        echo "   sudo cp $CONFIG_FILE /etc/nginx/conf.d/$CONFIG_NAME.conf"
    else
        echo "   sudo cp $CONFIG_FILE /etc/nginx/sites-available/$CONFIG_NAME.conf"
        echo "   sudo ln -s /etc/nginx/sites-available/$CONFIG_NAME.conf /etc/nginx/sites-enabled/"
    fi
    echo "   sudo nginx -t && sudo systemctl reload nginx"
    echo ""
    echo "4. Если вы используете другую структуру конфигурации Nginx:"
    echo "   Скопируйте содержимое файла $CONFIG_FILE в соответствующее место."
    echo ""
fi