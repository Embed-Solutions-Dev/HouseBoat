# HouseBoat Dashboard — Полный рефакторинг

**Дата:** 2026-02-02
**Статус:** Утверждён

## Обзор

Полная модернизация проекта HouseBoat Dashboard: переход от монолита (~3000 строк в одном файле) к модульной архитектуре с современным стеком.

## Технологический стек

| Было | Стало |
|------|-------|
| JavaScript | TypeScript (strict) |
| esbuild | Vite |
| Inline styles | Tailwind CSS |
| useState/props | Zustand |
| Статичные данные | WebSocket + Demo mode |
| Монолит | Feature-based architecture |

## Структура проекта

```
src/
├── app/
│   ├── App.tsx              # Корневой компонент
│   ├── main.tsx             # Точка входа
│   ├── index.css            # Tailwind imports + глобальные стили
│   └── layouts/
│       └── Dashboard.tsx    # Основной layout
│
├── components/              # Общие переиспользуемые компоненты
│   ├── ui/
│   │   ├── Card.tsx         # Glass-морфизм карточка
│   │   ├── Gauge.tsx        # Базовый круговой индикатор
│   │   ├── Toggle.tsx       # Переключатель
│   │   └── ProgressBar.tsx  # Линейный индикатор
│   └── icons/
│       └── index.tsx        # Все SVG иконки
│
├── features/                # Фичи дашборда
│   ├── engines/
│   ├── navigation/
│   ├── cameras/
│   ├── fuel/
│   ├── electrical/
│   ├── weather/
│   └── controls/
│
├── stores/                  # Zustand stores
│   ├── index.ts             # Комбинированный store
│   └── slices/
│       ├── enginesSlice.ts
│       ├── navigationSlice.ts
│       ├── camerasSlice.ts
│       ├── systemsSlice.ts
│       └── controlsSlice.ts
│
├── services/                # WebSocket, API
│   └── websocket/
│       ├── client.ts
│       ├── types.ts
│       └── storeSync.ts
│
├── hooks/                   # Общие хуки
│   ├── useWebSocket.ts
│   └── useMediaQuery.ts
│
├── types/                   # Глобальные типы
│   └── index.ts
│
├── utils/                   # Утилиты
│   ├── cn.ts                # clsx + tailwind-merge
│   ├── math.ts              # clamp, mapRange, polarSvg, etc.
│   └── format.ts            # Форматирование значений
│
└── config/                  # Константы, конфиг
    ├── theme.ts             # Цвета (для JS использования)
    └── constants.ts         # Магические числа
```

### Структура фичи

Каждая фича в `features/` имеет единообразную структуру:

```
features/engines/
├── components/
│   ├── EngineCard.tsx
│   ├── Tachometer.tsx
│   ├── TachometerScale.tsx
│   ├── TachometerNeedle.tsx
│   └── EngineModal.tsx
├── hooks/
│   └── useEngineData.ts
├── types.ts
└── index.ts                 # Публичный экспорт
```

## Управление состоянием (Zustand)

### Слайсы

```typescript
// Engines
interface EngineState {
  left: EngineData;
  right: EngineData;
}

interface EngineData {
  rpm: number;
  maxRpm: number;
  throttle: number;
  gear: 'N' | 'F' | 'R';
  temperature: number;
  oilPressure: number;
  hours: number;
  errors: EngineError[];
}

// Navigation
interface NavigationState {
  speed: number;
  heading: number;
  rudderAngle: number;
  position: { lat: number; lng: number };
  destination: { lat: number; lng: number } | null;
  routePoints: Array<{ lat: number; lng: number }>;
}

// Cameras
interface CamerasState {
  feeds: Record<CameraId, CameraFeed>;
  selectedCamera: CameraId | null;
}

// Systems
interface SystemsState {
  fuel: FuelState;
  electrical: ElectricalState;
  weather: WeatherState;
  anchor: AnchorState;
}

// Controls
interface ControlsState {
  power: boolean;
  lights: { parking: boolean; running: boolean };
  bowThruster: boolean;
  generator: boolean;
}
```

### Комбинированный store

```typescript
export const useStore = create<StoreState>()(
  devtools(
    subscribeWithSelector((...a) => ({
      ...createEnginesSlice(...a),
      ...createNavigationSlice(...a),
      ...createCamerasSlice(...a),
      ...createSystemsSlice(...a),
      ...createControlsSlice(...a),
      ...createConnectionSlice(...a),
    }))
  )
);
```

## WebSocket сервис

### Типы сообщений

```typescript
type MessageType =
  | 'engines.update'
  | 'navigation.update'
  | 'systems.update'
  | 'cameras.update'
  | 'controls.sync'
  | 'controls.command';

interface WSMessage<T = unknown> {
  type: MessageType;
  payload: T;
  timestamp: number;
}
```

### Клиент

```typescript
class YachtWebSocket {
  connect(url: string): void;
  disconnect(): void;
  subscribe<T>(type: MessageType, handler: (data: T) => void): () => void;
  send(type: MessageType, payload: unknown): void;
}
```

### Особенности

- Автореконнект с exponential backoff
- Интеграция с Zustand через middleware
- Demo-режим с симуляцией данных при отсутствии подключения

## Дизайн-система (Tailwind)

### Цветовая палитра

```javascript
colors: {
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
  },
}
```

### Кастомные стили

```javascript
boxShadow: {
  'card': '0 12px 40px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)',
  'glow-green': '0 0 20px rgba(61,200,140,0.3)',
  'glow-red': '0 0 20px rgba(224,64,80,0.3)',
},
backgroundImage: {
  'yacht-gradient': 'radial-gradient(ellipse at 50% 30%, #0f1a25 0%, #080d12 50%, #000 100%)',
  'card-gradient': 'linear-gradient(145deg, rgba(15,22,35,0.95) 0%, rgba(8,12,22,0.98) 50%, rgba(5,8,15,0.99) 100%)',
  'glass-shine': 'linear-gradient(180deg, rgba(180,210,255,0.1) 0%, transparent 100%)',
},
```

## Layout приложения

```
┌─────────────────────────────────────────────────────────────┐
│                        TopBar                               │
│  [Battery] [Speed] [Heading] [Fuel] [Connection]           │
├─────────────┬───────────────────────────┬──────────────────┤
│             │                           │                  │
│   Cameras   │       Navigation          │    Engines       │
│   Panel     │    (Compass + Map)        │    Panel         │
│             │                           │                  │
│  ┌───┬───┐  │     ┌─────────────┐      │   ┌──────────┐   │
│  │ 1 │ 2 │  │     │   Compass   │      │   │  Left    │   │
│  ├───┼───┤  │     └─────────────┘      │   │  Engine  │   │
│  │ 3 │ 4 │  │     ┌─────────────┐      │   ├──────────┤   │
│  └───┴───┘  │     │     Map     │      │   │  Right   │   │
│             │     │  + Rudder   │      │   │  Engine  │   │
│             │     └─────────────┘      │   └──────────┘   │
│             │                           │                  │
├─────────────┴───────────────────────────┴──────────────────┤
│                       BottomBar                             │
│  [Fuel] [Electrical] [Weather] [Controls]                  │
└─────────────────────────────────────────────────────────────┘
```

Grid: `grid-cols-12 grid-rows-6`
- TopBar: `col-span-12 row-span-1`
- Cameras: `col-span-3 row-span-4`
- Navigation: `col-span-6 row-span-4`
- Engines: `col-span-3 row-span-4`
- BottomBar: `col-span-12 row-span-1`

## Список фич и компонентов

| Фича | Компоненты |
|------|------------|
| `engines` | Tachometer, TachometerScale, TachometerNeedle, EngineCard, EngineModal, EnginesPanel |
| `navigation` | Compass, CompassRose, MapView, RudderGauge, SpeedDisplay, HeadingDisplay, NavigationPanel |
| `cameras` | CameraFeed, CameraGrid, CameraModal, CamerasPanel |
| `fuel` | FuelTank, FuelConsumption, FuelPanel, FuelModal |
| `electrical` | BatteryIndicator, PowerStats, ElectricalPanel, ElectricalModal |
| `weather` | WeatherWidget, WindIndicator, WeatherModal |
| `controls` | ControlButton, AnchorControl, LightsControl, ControlsPanel |

## Зависимости

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^10.16.4",
    "zustand": "^4.4.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

## Миграция данных

Текущие значения из `yacht-dashboard.jsx` переносятся в начальное состояние Zustand:

```typescript
const initialState = {
  engines: {
    left: { rpm: 2350, maxRpm: 4000, throttle: 62, gear: 'F', ... },
    right: { rpm: 2410, maxRpm: 4000, throttle: 64, gear: 'F', ... },
  },
  navigation: {
    speed: 18.4,
    heading: 42,
    rudderAngle: -6,
    position: { lat: 55.7558, lng: 37.6173 },
    ...
  },
  // ...остальные значения из текущего кода
};
```

## Порядок реализации

1. **Инфраструктура**
   - Инициализация Vite + TypeScript
   - Настройка Tailwind
   - Базовые утилиты и типы

2. **Фундамент**
   - Zustand store со всеми слайсами
   - UI компоненты (Card, Gauge, Toggle)
   - Иконки

3. **Фичи** (в порядке зависимостей)
   - navigation (базовая)
   - engines
   - cameras
   - fuel, electrical, weather
   - controls

4. **Интеграция**
   - WebSocket сервис
   - Demo-режим
   - Layout и роутинг между экранами

5. **Финализация**
   - Splash screen
   - Анимации переходов
   - Тестирование
   - Сборка для production
