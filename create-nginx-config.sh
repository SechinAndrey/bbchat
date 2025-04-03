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
USE_HTTPS=false      # По умолчанию используем HTTP
SSL_CERT_PATH=""
SSL_KEY_PATH=""

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
    echo "  -s, --https          Включить поддержку HTTPS (самоподписанный сертификат)"
    echo "  --cert PATH          Путь к SSL сертификату (для существующего сертификата)"
    echo "  --key PATH           Путь к SSL ключу (для существующего сертификата)"
    echo ""
    echo "Примеры:"
    echo "  $0 --name example.com                                # Создать конфиг для example.com"
    echo "  $0 --ip 192.168.1.100 --port 8080                    # Использовать IP:8080"
    echo "  $0 --origins 'https://example.com https://test.com'  # Разрешить только указанные домены"
    echo "  $0 --name example.com --https                        # Включить HTTPS с самоподписанным сертификатом"
    echo "  $0 --name example.com --cert /path/to/cert.pem --key /path/to/key.pem  # Использовать существующие сертификаты"
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
        -s|--https)
            USE_HTTPS=true
            shift
            ;;
        --cert)
            SSL_CERT_PATH="$2"
            USE_HTTPS=true
            shift
            shift
            ;;
        --key)
            SSL_KEY_PATH="$2"
            USE_HTTPS=true
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

# Функция для создания самоподписанных сертификатов
create_self_signed_cert() {
    local domain=$1
    local cert_dir="/etc/nginx/ssl/$domain"

    echo "Создаем самоподписанный SSL сертификат для $domain..."

    # Создаем директорию для сертификатов
    sudo mkdir -p "$cert_dir"

    # Генерируем самоподписанный сертификат
    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$cert_dir/privkey.pem" \
        -out "$cert_dir/fullchain.pem" \
        -subj "/CN=$domain" \
        -addext "subjectAltName=DNS:$domain"

    if [ $? -eq 0 ]; then
        echo "Сертификаты успешно созданы в $cert_dir"
        SSL_CERT_PATH="$cert_dir/fullchain.pem"
        SSL_KEY_PATH="$cert_dir/privkey.pem"
        return 0
    else
        echo "Ошибка при создании сертификатов"
        return 1
    fi
}

# Проверяем и создаем сертификаты, если нужно
if [ "$USE_HTTPS" = true ]; then
    # Если пути к сертификатам не указаны, создаем самоподписанные
    if [ -z "$SSL_CERT_PATH" ] || [ -z "$SSL_KEY_PATH" ]; then
        create_self_signed_cert "$SERVER_NAME"
    fi

    # Проверяем наличие сертификатов
    if [ ! -f "$SSL_CERT_PATH" ] || [ ! -f "$SSL_KEY_PATH" ]; then
        echo "Ошибка: SSL сертификаты не найдены по указанным путям:"
        echo "Сертификат: $SSL_CERT_PATH"
        echo "Ключ: $SSL_KEY_PATH"
        exit 1
    fi
fi

# Формируем listen директиву в зависимости от наличия порта и HTTPS
if [ "$USE_HTTPS" = true ]; then
    if [ "$USE_PORT" = true ]; then
        LISTEN_DIRECTIVE="listen $PORT ssl http2;"
        SERVER_PORT=":$PORT"
    else
        LISTEN_DIRECTIVE="listen 443 ssl http2;
    listen [::]:443 ssl http2;"
        SERVER_PORT=""
    fi

    # Добавляем редирект с HTTP на HTTPS
    REDIRECT_CONFIG="
server {
    listen 80;
    server_name $SERVER_NAME;

    # Редирект на HTTPS
    return 301 https://\$host\$request_uri;
}"
else
    if [ "$USE_PORT" = true ]; then
        LISTEN_DIRECTIVE="listen $PORT;"
        SERVER_PORT=":$PORT"
    else
        LISTEN_DIRECTIVE="listen 80;
    listen [::]:80;"
        SERVER_PORT=""
    fi
    REDIRECT_CONFIG=""
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

# Создаем SSL конфигурацию, если нужно
if [ "$USE_HTTPS" = true ]; then
    SSL_CONFIG="
    # SSL настройки
    ssl_certificate $SSL_CERT_PATH;
    ssl_certificate_key $SSL_KEY_PATH;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;
    "
else
    SSL_CONFIG=""
fi

cat > "$CONFIG_FILE" << EOF
$REDIRECT_CONFIG

server {
    $LISTEN_DIRECTIVE
    server_name $SERVER_NAME;
$SSL_CONFIG
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

        # Формируем URL в зависимости от настроек
        if [ "$USE_HTTPS" = true ]; then
            PROTOCOL="https"
        else
            PROTOCOL="http"
        fi

        if [ "$USE_PORT" = true ] && [ "$USE_HTTPS" = false ]; then
            # Порт указываем только для HTTP, для HTTPS используем стандартный 443
            echo "Ваш сайт должен быть доступен по адресу: $PROTOCOL://$SERVER_NAME:$PORT"
            echo "Теперь вы можете встраивать его в iframe на другом сайте:"
            echo "<iframe src=\"$PROTOCOL://$SERVER_NAME:$PORT\" width=\"800\" height=\"600\"></iframe>"
        else
            echo "Ваш сайт должен быть доступен по адресу: $PROTOCOL://$SERVER_NAME"
            echo "Теперь вы можете встраивать его в iframe на другом сайте:"
            echo "<iframe src=\"$PROTOCOL://$SERVER_NAME\" width=\"800\" height=\"600\"></iframe>"
        fi

        if [ "$USE_HTTPS" = true ] && [ -z "$SSL_CERT_PATH" ]; then
            echo ""
            echo "ВНИМАНИЕ: Вы используете самоподписанный сертификат."
            echo "Браузеры будут показывать предупреждение о небезопасном соединении."
            echo "Для продакшн-среды рекомендуется использовать Let's Encrypt или другой доверенный сертификат."
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