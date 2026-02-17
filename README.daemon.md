# HouseBoat Dashboard - Daemon Mode

## Quick Start

### Запуск dev-сервера с автоперезапуском

```bash
npm run dev:daemon
```

Или с кастомным количеством двигателей:

```bash
VITE_ENGINE_COUNT=4 npm run dev:daemon
```

## Возможности

✅ **Автоматический перезапуск** — при крашах сервер перезапускается через 3 секунды
✅ **Hot Module Replacement** — Vite автоматически применяет изменения без полной перезагрузки
✅ **Логирование** — timestamp для каждого события
✅ **Защита от зацикливания** — максимум 10 перезапусков подряд
✅ **Graceful shutdown** — корректное завершение при Ctrl+C

## Управление

### Запуск в фоне (tmux)

```bash
# Создать новую сессию
tmux new -s houseboat-dev

# Запустить daemon
npm run dev:daemon

# Отключиться (сервер продолжит работать)
# Нажмите: Ctrl+B, затем D

# Вернуться к сессии
tmux attach -t houseboat-dev

# Список сессий
tmux ls

# Убить сессию (остановить сервер)
tmux kill-session -t houseboat-dev
```

### Запуск в фоне (screen)

```bash
# Создать новую сессию
screen -S houseboat-dev

# Запустить daemon
npm run dev:daemon

# Отключиться (Ctrl+A, затем D)

# Вернуться
screen -r houseboat-dev

# Список сессий
screen -ls

# Убить сессию
screen -X -S houseboat-dev quit
```

## Логи

При запуске в фоне, логи выводятся в терминал внутри tmux/screen сессии.

Формат лога:
```
[2026-02-16 09:34:12] Starting dev server (restart #0)...
[2026-02-16 09:35:45] ⚠️  Dev server crashed (exit code: 1)
[2026-02-16 09:35:45] 🔄 Restarting in 3s...
```

## Настройки

Параметры в `start-dev.sh`:

```bash
RESTART_DELAY=3      # Секунды между перезапусками
MAX_RESTARTS=10      # Макс. перезапусков подряд
```

## Отличия от обычного `npm run dev`

| Параметр | `npm run dev` | `npm run dev:daemon` |
|----------|---------------|----------------------|
| Автоперезапуск при краше | ❌ | ✅ |
| HMR (hot reload) | ✅ | ✅ |
| Логирование | Стандартное | С timestamp |
| Защита от зацикливания | ❌ | ✅ (макс. 10) |
| Работает в фоне | ❌ (требует tmux/screen) | ✅ (с tmux/screen) |

## Troubleshooting

### Сервер не запускается

```bash
# Проверить, свободен ли порт 3000
lsof -i :3000

# Убить процесс на порту 3000
kill $(lsof -t -i:3000)
```

### Бесконечные перезапуски

Если достигнут лимит 10 перезапусков:

1. Проверьте логи на ошибки
2. Исправьте ошибку в коде
3. Перезапустите скрипт

### Остановить daemon

```bash
# В tmux/screen — просто нажмите Ctrl+C

# Или убейте процесс
ps aux | grep start-dev.sh | grep -v grep | awk '{print $2}' | xargs kill
```

## URL доступа

После запуска проект доступен по адресу:

**https://houseboat-dash.conveyor.echelon.business**

(внутри контейнера — http://localhost:3000)
