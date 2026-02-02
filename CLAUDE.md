# CLAUDE.md - Описание проекта HouseBoat Dashboard

## Обзор проекта

**HouseBoat Dashboard** — это современный веб-интерфейс для управления яхтой или хаусботом. Приложение представляет собой интерактивную панель управления с премиальным дизайном в морском стиле, вдохновлённым интерфейсами Mercedes-Benz.

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
│   ├── engines/             # Двигатели (тахометры)
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
- `enginesSlice` — данные двигателей
- `navigationSlice` — навигационные данные
- `camerasSlice` — состояние камер
- `systemsSlice` — топливо, электрика, погода, якорь
- `controlsSlice` — переключатели управления
- `connectionSlice` — статус подключения

### Функциональные блоки

| Блок | Компоненты |
|------|------------|
| Навигация | Compass, RudderGauge, SpeedDisplay, HeadingDisplay |
| Двигатели | Tachometer, EngineCard, EnginesPanel |
| Камеры | CameraFeed, CameraGrid, CamerasPanel |
| Топливо | FuelPanel |
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

## Сборка и запуск

### Локальная разработка

```bash
npm install
npm run dev      # Запуск на http://localhost:3000
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
