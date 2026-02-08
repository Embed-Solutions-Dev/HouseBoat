# HouseBoat Dashboard

Современный dashboard для управления яхтой/хаусботом с премиальным дизайном в стиле Mercedes-Benz.

![Dashboard Preview](preview.png)

## Особенности

- 🎨 **Премиальный дизайн** — glass morphism, градиенты, анимации
- 🚀 **Анимация загрузки** — плавное появление логотипа с бликом
- ⚙️ **Multi-Engine поддержка** — от 2 до 6 двигателей с динамической компоновкой
- 🧭 **Авиационная навигация** — компас и руль в авиационном стиле
- ⚡ **Системы** — топливо с маппингом, электрика, погода, безопасность
- 🎛️ **Управление** — питание, огни, подруливающее, якорь, генератор
- 📹 **Камеры** — 4 видеопотока с режимом fullscreen
- 🌊 **Адаптивная компоновка** — автоматическое масштабирование под количество двигателей

## Быстрый старт

### Установка

```bash
npm install
```

### Запуск разработки

```bash
# Запуск с 2 двигателями (по умолчанию)
npm run dev

# Запуск с 4 двигателями
VITE_ENGINE_COUNT=4 npm run dev

# Запуск с 6 двигателями
VITE_ENGINE_COUNT=6 npm run dev
```

Приложение будет доступно на `http://localhost:3000`

### Конфигурация

Создайте `.env` файл в корне проекта:

```bash
# Количество двигателей (2-6)
VITE_ENGINE_COUNT=4

# WebSocket сервер (опционально)
VITE_WS_URL=ws://yacht-server:8080
```

### Production сборка

```bash
npm run build
npm run preview
```

## Структура проекта

```
src/
├── app/                      # Корневое приложение
├── components/               # Общие компоненты
│   ├── ui/                   # UI компоненты (Card, Toggle, ProgressBar)
│   └── icons/                # SVG иконки
├── features/                 # Feature-based модули
│   ├── navigation/           # Навигация (AviationCompass, AviationRudder)
│   ├── engines/              # Двигатели (2-6 тахометров)
│   ├── cameras/              # Камеры
│   ├── fuel/                 # Топливо
│   ├── electrical/           # Электрика
│   ├── weather/              # Погода
│   └── controls/             # Управление
├── stores/                   # Zustand state management
├── services/                 # Сервисы (WebSocket, Demo)
├── utils/                    # Утилиты (engineLayout, cn)
└── config/                   # Конфигурация и константы
```

## Технологии

| Технология | Версия | Назначение |
|------------|--------|------------|
| React | 18.2.0 | UI фреймворк |
| TypeScript | 5.3.3 | Типизация |
| Vite | 5.0.12 | Сборка и dev-сервер |
| Tailwind CSS | 3.4.1 | Стилизация |
| Zustand | 4.4.7 | State management |
| Framer Motion | 10.16.4 | Анимации |

## Multi-Engine система

Система поддерживает от 2 до 6 двигателей:

- **2-4 двигателя:** одна строка
- **5-6 двигателей:** две строки (3+2 или 3+3)
- **Автоматическое масштабирование:** тахометры от 310px до 245px
- **Fuel mapping:** гибкая система привязки двигателей к топливным бакам

Подробнее: [docs/architecture/multi-engine-system.md](docs/architecture/multi-engine-system.md)

## Документация

- [CLAUDE.md](CLAUDE.md) - Полное описание проекта
- [docs/architecture/multi-engine-system.md](docs/architecture/multi-engine-system.md) - Архитектура multi-engine системы

## Локализация

Интерфейс на русском языке. Текстовые константы в `src/config/constants.ts`.

## Лицензия

MIT
