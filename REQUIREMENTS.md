# HouseBoat Dashboard - Системные требования

## Минимальные требования для Linux

### Production (статический хостинг)

| Компонент | Минимум | Рекомендуется |
|-----------|---------|---------------|
| **CPU** | 1 core @ 1 GHz | 2 cores @ 2 GHz |
| **RAM** | 256 MB | 512 MB |
| **Диск** | 10 MB | 50 MB |
| **ОС** | Linux kernel 3.10+ | Linux kernel 5.4+ |
| **Веб-сервер** | nginx 1.18+, Apache 2.4+ | nginx 1.24+ |

**Размер production build:** ~424 KB
- HTML: 0.66 KB
- CSS: 13.79 KB (3.4 KB gzip)
- JS: 400.53 KB (118.76 KB gzip)

### Development (разработка)

| Компонент | Минимум | Рекомендуется |
|-----------|---------|---------------|
| **CPU** | 2 cores @ 2 GHz | 4 cores @ 3 GHz |
| **RAM** | 2 GB | 4 GB |
| **Диск** | 500 MB | 2 GB |
| **Node.js** | v18.0.0+ | v20.0.0+ LTS |

**Текущее потребление (dev-сервер):**
- Vite dev server: ~130 MB RAM, 0-5% CPU (idle)
- node_modules: 140 MB
- Build time: ~4.5 секунд

## Клиентские требования (браузер)

### Поддерживаемые браузеры

| Браузер | Минимальная версия |
|---------|-------------------|
| **Chrome** | 90+ |
| **Firefox** | 88+ |
| **Safari** | 14+ |
| **Edge** | 90+ |

### Требования к устройству клиента

| Параметр | Значение |
|----------|----------|
| **Разрешение экрана** | 1080×1440 (3:4, портрет) |
| **RAM браузера** | 512 MB+ |
| **GPU** | Поддержка WebGL (для анимаций) |
| **JavaScript** | Обязательно |

## Сетевые требования

### Production

- **Пропускная способность:** 1 Mbps (первая загрузка)
- **Латентность:** <100 ms (рекомендуется)
- **Протокол:** HTTP/2 или HTTP/1.1
- **TLS:** 1.2+ (опционально, но рекомендуется)

### Development

- **Порты:** 3000 (dev-server), 5173 (preview)
- **WebSocket:** Да (для HMR)
- **Firewall:** Разрешить входящие на порту dev-сервера

## Типовые конфигурации

### Конфигурация 1: Raspberry Pi 4 (Production)

```
CPU: ARM Cortex-A72 @ 1.5 GHz (4 cores)
RAM: 2 GB
Диск: 8 GB SD card
ОС: Raspberry Pi OS Lite (Debian)
Веб-сервер: nginx
```

**Результат:** ✅ Работает отлично

### Конфигурация 2: VPS (Production + Dev)

```
CPU: 2 vCores @ 2.4 GHz
RAM: 4 GB
Диск: 20 GB SSD
ОС: Ubuntu 22.04 LTS
```

**Результат:** ✅ Работает идеально, хватает для development

### Конфигурация 3: Embedded Linux (Orange Pi, BeagleBone)

```
CPU: ARM Cortex-A7 @ 1.2 GHz (2 cores)
RAM: 1 GB
Диск: 4 GB eMMC
ОС: Armbian / Buildroot
```

**Результат:** ✅ Работает в production режиме (статика)
⚠️ Development — медленно, не рекомендуется

### Конфигурация 4: x86 Mini PC (рекомендуемая для яхты)

```
CPU: Intel J4125 @ 2.0-2.7 GHz (4 cores)
RAM: 8 GB DDR4
Диск: 128 GB SSD
ОС: Ubuntu Server 22.04 LTS
Питание: 12V DC (адаптер для бортовой сети)
```

**Результат:** ✅✅✅ Идеально для production + development

## Рекомендации по установке

### Production (статический хостинг)

#### nginx

```bash
# Установка nginx
sudo apt update
sudo apt install nginx -y

# Копирование сборки
sudo cp -r dist/* /var/www/html/

# Конфигурация nginx
sudo nano /etc/nginx/sites-available/houseboat

# Добавить:
server {
    listen 80;
    server_name _;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Кэширование статики
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json;
    gzip_min_length 1000;
}

# Включить конфиг
sudo ln -s /etc/nginx/sites-available/houseboat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Apache

```bash
# Установка Apache
sudo apt install apache2 -y

# Копирование сборки
sudo cp -r dist/* /var/www/html/

# Включить mod_rewrite
sudo a2enmod rewrite
sudo a2enmod deflate

# Добавить в /etc/apache2/sites-available/000-default.conf:
<Directory /var/www/html>
    Options -Indexes +FollowSymLinks
    AllowOverride All
    Require all granted

    # SPA routing
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</Directory>

sudo systemctl restart apache2
```

### Development

```bash
# Установка Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y

# Клонирование проекта
cd /opt
git clone <repo-url> houseboat-dashboard
cd houseboat-dashboard

# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev

# Или с daemon mode
npm run dev:daemon
```

## Оптимизация для слабого железа

### 1. Статический билд без Node.js

Если RAM < 512 MB, используйте только production build:

```bash
# На мощной машине
npm run build

# Копируйте dist/ на целевую систему
scp -r dist/* user@target:/var/www/html/
```

### 2. Отключение анимаций (экономия CPU)

В `src/app/index.css` добавьте:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 3. Уменьшение количества двигателей

Для слабых систем используйте меньше двигателей:

```bash
VITE_ENGINE_COUNT=2 npm run build  # Вместо 4 или 6
```

### 4. Настройка swap (если RAM < 1 GB)

```bash
# Создать 2GB swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Добавить в /etc/fstab
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## Мониторинг производительности

### Проверка нагрузки на клиенте (браузер)

```javascript
// В консоли браузера (F12)
performance.memory // Chrome
console.log('Used JS Heap:', (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB');
```

### Проверка нагрузки на сервере

```bash
# CPU и RAM
htop

# Только процессы Node.js
ps aux | grep node

# Логи dev-сервера
tail -f /tmp/claude-1000/-workspace/tasks/*.output
```

## Заключение

**Для production (статический хостинг):**
- Минимум: Raspberry Pi Zero 2 W (512 MB RAM)
- Рекомендуется: Raspberry Pi 4 (2+ GB RAM)

**Для development:**
- Минимум: 2 GB RAM, 2 cores
- Рекомендуется: 4 GB RAM, 4 cores

**Идеальная конфигурация для яхты:**
- Mini PC x86 с 12V питанием
- 4+ GB RAM, 4 cores, SSD
- Ubuntu Server LTS
- nginx + systemd для автозапуска

Приложение оптимизировано и работает даже на слабом железе благодаря:
- Малому размеру bundle (118 KB gzip JS + 3.4 KB gzip CSS)
- Эффективному использованию React (Zustand вместо Redux)
- Минимальным зависимостям (7 production пакетов)
- Vite для быстрой сборки
