# CLAUDE.md - Описание проекта HouseBoat Dashboard

## Текущая ветка разработки

**Активная ветка:** `houseboat-four-plus-engines`

Реализация поддержки 2-6 двигателей с динамической компоновкой и авиационными навигационными приборами. После завершения — мерж в `main`.

## Обзор проекта

**HouseBoat Dashboard** — это современный веб-интерфейс для управления яхтой или хаусботом. Приложение представляет собой интерактивную панель управления с премиальным дизайном в морском стиле, вдохновлённым интерфейсами Mercedes-Benz.

### Ключевые возможности

- Поддержка от 2 до 6 двигателей с динамической компоновкой
- Авиационный стиль навигационных приборов (компас, руль)
- Адаптивное масштабирование интерфейса под количество двигателей
- Гибкая система маппинга топливных баков на двигатели
- Real-time мониторинг всех систем судна

## Технологический стек

| Технология | Версия | Назначение |
|------------|--------|------------|
| React | 18.2.0 | UI фреймворк |
| TypeScript | 5.3.3 | Типизация |
| Vite | 5.0.12 | Сборка и dev-сервер |
| Tailwind CSS | 3.4.1 | Стилизация |
| Zustand | 4.4.7 | State management |
| Framer Motion | 10.16.4 | Анимации и переходы |

## Структура проекта

```
src/
├── app/
│   ├── App.tsx              # Корневой компонент
│   ├── main.tsx             # Точка входа
│   ├── index.css            # Tailwind imports
│   └── layouts/
│       └── Dashboard.tsx    # Основной layout
│
├── components/              # Общие компоненты
│   ├── ui/
│   │   ├── Card.tsx         # Glass-морфизм карточка
│   │   ├── Toggle.tsx       # Переключатель
│   │   └── ProgressBar.tsx  # Индикатор прогресса
│   ├── icons/
│   │   └── index.tsx        # SVG иконки
│   ├── TopBar.tsx           # Верхняя панель метрик
│   └── BottomBar.tsx        # Нижняя панель систем
│
├── features/                # Feature-based модули
│   ├── navigation/          # Навигация (компас, руль, скорость)
│   │   ├── components/
│   │   │   ├── AviationCompass.tsx    # Авиационный компас
│   │   │   ├── AviationRudder.tsx     # Авиационный индикатор руля
│   │   │   └── NavigationOverlay.tsx  # Оверлей навигации
│   ├── engines/             # Двигатели (2-6 тахометров)
│   │   ├── components/
│   │   │   ├── Tachometer.tsx         # Индикатор оборотов
│   │   │   ├── EngineCard.tsx         # Карточка двигателя
│   │   │   └── EnginesPanel.tsx       # Панель всех двигателей
│   ├── cameras/             # Камеры (4 видеопотока)
│   ├── fuel/                # Топливо (3 бака)
│   ├── electrical/          # Электрика (батарея, ток)
│   ├── weather/             # Погода (температура, ветер)
│   └── controls/            # Управление (питание, огни, якорь)
│
├── stores/                  # Zustand stores
│   ├── index.ts             # Комбинированный store
│   └── slices/              # Слайсы по доменам
│
├── services/                # Сервисы
│   ├── websocket/           # WebSocket клиент
│   └── demo/                # Demo-режим провайдер
│
├── hooks/                   # Общие хуки
├── types/                   # TypeScript типы
├── utils/                   # Утилиты (cn, math, format)
└── config/                  # Константы и тема
```

## Архитектура приложения

### Feature-based структура

Каждая фича содержит:
- `components/` — React компоненты
- `types.ts` — TypeScript типы
- `index.ts` — публичные экспорты

### State Management (Zustand)

Состояние разбито на слайсы:
- `enginesSlice` — массив данных двигателей (2-6), маппинг топлива
- `navigationSlice` — навигационные данные (курс, руль, скорость)
- `camerasSlice` — состояние камер
- `systemsSlice` — топливо, электрика, погода, якорь
- `controlsSlice` — переключатели управления
- `connectionSlice` — статус подключения

### Архитектура двигателей (Multi-Engine System)

Система поддерживает от 2 до 6 двигателей с динамической компоновкой:

**Array-based архитектура:**
- Двигатели хранятся как массив `EngineData[]` (ранее: `{left, right}`)
- Индексация от 0 до N-1, где N — количество двигателей
- Гибкая система маппинга двигателей на топливные баки

**Адаптивная компоновка:**
- 2-4 двигателя: одна строка
- 5-6 двигателей: две строки (3+2 или 3+3)
- Автоматическое масштабирование тахометров:
  - 2 двигателя: 310px
  - 3 двигателя: 285px
  - 4 двигателя: 270px
  - 5-6 двигателей: 245px

**Конфигурация:**
```typescript
// src/config/constants.ts
export const ENGINE_CONFIG = {
  count: Number(import.meta.env.VITE_ENGINE_COUNT) || 2,
  maxEngines: 6,
  minEngines: 2,
};
```

Подробнее: `/workspace/docs/architecture/multi-engine-system.md`

### Функциональные блоки

| Блок | Компоненты |
|------|------------|
| Навигация | AviationCompass, AviationRudder, SpeedDisplay, HeadingDisplay, NavigationOverlay |
| Двигатели | Tachometer, EngineCard, EnginesPanel (2-6 двигателей) |
| Камеры | CameraFeed, CameraGrid, CamerasPanel |
| Топливо | FuelPanel (с маппингом на двигатели) |
| Электрика | ElectricalPanel |
| Погода | WeatherPanel |
| Управление | ControlButton, AnchorControl, ControlsPanel |

## Дизайн-система (Tailwind)

### Цветовая палитра

```javascript
yacht: {
  bg: '#080d12',
  card: '#0c1218',
  'card-light': '#162230',
  border: 'rgba(80,110,140,0.25)',
  primary: '#e8f4ff',
  secondary: '#7a95a8',
  muted: '#4a6070',
  green: '#3dc88c',
  amber: '#e8a030',
  red: '#e04050',
  yellow: '#e8c820',
}
```

### CSS утилиты

- `.glass-card` — карточка с glass morphism
- `.glass-shine` — блик на карточке

## Конфигурация

### Переменные окружения

Создайте файл `.env` в корне проекта:

```bash
# Количество двигателей (2-6)
VITE_ENGINE_COUNT=4

# WebSocket сервер (опционально)
VITE_WS_URL=ws://yacht-server:8080
```

## Сборка и запуск

### Локальная разработка

```bash
npm install
npm run dev      # Запуск на http://localhost:3000
```

### Dev-сервер с автоперезапуском (daemon mode)

**Рекомендуется для продакшн-разработки** — сервер автоматически перезапускается при крашах:

```bash
npm run dev:daemon
```

**Возможности:**
- ✅ Автоматический перезапуск при крашах
- ✅ Hot Module Replacement (HMR) от Vite
- ✅ Логирование с timestamp
- ✅ Защита от бесконечных перезапусков (макс. 10 попыток)
- ✅ Задержка 3 секунды между перезапусками

**Скрипт:** `/workspace/start-dev.sh`

**Запуск в фоне (tmux/screen):**
```bash
# В tmux
tmux new -s dev
npm run dev:daemon
# Ctrl+B, затем D для detach

# Вернуться к сессии
tmux attach -t dev

# Остановить
tmux kill-session -t dev
```

### Изменение количества двигателей

```bash
# Для 2 двигателей (по умолчанию)
VITE_ENGINE_COUNT=2 npm run dev

# Для 4 двигателей
VITE_ENGINE_COUNT=4 npm run dev

# Для 6 двигателей
VITE_ENGINE_COUNT=6 npm run dev

# С daemon mode
VITE_ENGINE_COUNT=4 npm run dev:daemon
```

### Production сборка

```bash
npm run build    # Сборка в dist/
npm run preview  # Превью production
```

### Проверка типов

```bash
npm run lint     # tsc --noEmit
```

## WebSocket интеграция

Клиент готов для подключения к реальным датчикам:

```typescript
import { wsClient } from '@/services/websocket';

wsClient.connect('ws://yacht-server:8080');
wsClient.subscribe('engines.update', (data) => { ... });
```

## Demo-режим

`DemoProvider` симулирует живые данные:
- Колебания курса вокруг 42°
- Вариации скорости вокруг 18.4 узлов
- Флуктуации RPM двигателей

## Интернационализация

Интерфейс на русском языке. Текстовые константы в `src/config/constants.ts`.

## Legacy версия

Оригинальный монолитный код сохранён в `yacht-dashboard.jsx` для справки.
