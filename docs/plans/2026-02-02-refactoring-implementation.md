# HouseBoat Dashboard Refactoring — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate monolithic yacht-dashboard.jsx (~3000 lines) to modular TypeScript architecture with Vite, Tailwind, and Zustand.

**Architecture:** Feature-based structure where each dashboard section (engines, navigation, cameras, etc.) is a self-contained module with components, types, and hooks. Shared UI components in `components/ui/`. Global state managed via Zustand slices.

**Tech Stack:** React 18, TypeScript 5, Vite 5, Tailwind CSS 3.4, Zustand 4, Framer Motion 10

---

## Phase 1: Infrastructure Setup

### Task 1: Initialize Vite + TypeScript Project

**Files:**
- Create: `src/` directory structure
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html` (new Vite entry)
- Modify: `package.json`

**Step 1: Create new package.json**

```json
{
  "name": "houseboat-dashboard",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 3000",
    "build": "tsc && vite build",
    "preview": "vite preview --host 0.0.0.0 --port 3000",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^10.16.4",
    "zustand": "^4.4.7",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.12"
  }
}
```

**Step 2: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});
```

**Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Step 4: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

**Step 5: Create index.html**

```html
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HouseBoat Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/app/main.tsx"></script>
  </body>
</html>
```

**Step 6: Install dependencies**

Run: `npm install`
Expected: All packages installed successfully

**Step 7: Commit**

```bash
git add -A
git commit -m "chore: initialize Vite + TypeScript project"
```

---

### Task 2: Configure Tailwind CSS

**Files:**
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `src/app/index.css`

**Step 1: Create tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
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
      },
      boxShadow: {
        card: '0 12px 40px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)',
        'card-inset': 'inset 0 6px 20px rgba(0,0,0,0.4), inset 0 -2px 10px rgba(0,0,0,0.2)',
        'glow-green': '0 0 20px rgba(61,200,140,0.3)',
        'glow-red': '0 0 20px rgba(224,64,80,0.3)',
        'glow-amber': '0 0 20px rgba(232,160,48,0.3)',
      },
      backgroundImage: {
        'yacht-gradient': 'radial-gradient(ellipse at 50% 30%, #0f1a25 0%, #080d12 50%, #000 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(15,22,35,0.95) 0%, rgba(8,12,22,0.98) 50%, rgba(5,8,15,0.99) 100%)',
        'glass-shine': 'linear-gradient(180deg, rgba(180,210,255,0.1) 0%, transparent 100%)',
      },
      borderRadius: {
        card: '24px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
```

**Step 2: Create postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**Step 3: Create src/app/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-yacht-bg text-yacht-primary antialiased;
    font-family: 'Inter', system-ui, sans-serif;
  }
}

@layer utilities {
  .glass-card {
    @apply relative bg-card-gradient rounded-card border border-yacht-border shadow-card overflow-hidden;
  }

  .glass-shine {
    @apply absolute top-0 left-5 right-5 h-10 bg-glass-shine rounded-b-[50%] pointer-events-none;
  }
}
```

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: configure Tailwind CSS with yacht theme"
```

---

### Task 3: Create Base Utilities

**Files:**
- Create: `src/utils/cn.ts`
- Create: `src/utils/math.ts`
- Create: `src/utils/format.ts`

**Step 1: Create src/utils/cn.ts**

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

**Step 2: Create src/utils/math.ts**

```typescript
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  const t = (value - inMin) / (inMax - inMin);
  return outMin + clamp(t, 0, 1) * (outMax - outMin);
}

export function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  deg: number
): { x: number; y: number } {
  const rad = ((deg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

export function describeArc(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
): string {
  const start = polarToCartesian(cx, cy, r, startDeg);
  const end = polarToCartesian(cx, cy, r, endDeg);
  const delta = ((endDeg - startDeg) % 360 + 360) % 360;
  const largeArc = delta > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export function normalizeDegrees(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export function degreesToCardinal(deg: number): string {
  const dirs = ['С', 'ССВ', 'СВ', 'ВСВ', 'В', 'ВЮВ', 'ЮВ', 'ЮЮВ', 'Ю', 'ЮЮЗ', 'ЮЗ', 'ЗЮЗ', 'З', 'ЗСЗ', 'СЗ', 'ССЗ'];
  return dirs[Math.round(normalizeDegrees(deg) / 22.5) % 16];
}
```

**Step 3: Create src/utils/format.ts**

```typescript
export function formatNumber(value: number, decimals = 1): string {
  return value.toFixed(decimals);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatVoltage(value: number): string {
  return `${value.toFixed(1)}V`;
}

export function formatTemperature(value: number): string {
  return `${Math.round(value)}°C`;
}

export function formatSpeed(knots: number): string {
  return `${knots.toFixed(1)} уз`;
}

export function formatCoordinate(value: number, isLat: boolean): string {
  const dir = isLat ? (value >= 0 ? 'N' : 'S') : (value >= 0 ? 'E' : 'W');
  const abs = Math.abs(value);
  const deg = Math.floor(abs);
  const min = ((abs - deg) * 60).toFixed(3);
  return `${deg}°${min}'${dir}`;
}
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add utility functions (cn, math, format)"
```

---

### Task 4: Create Global Types

**Files:**
- Create: `src/types/index.ts`

**Step 1: Create src/types/index.ts**

```typescript
// Engine types
export type GearPosition = 'N' | 'F' | 'R';
export type EngineId = 'left' | 'right';

export interface EngineError {
  code: string;
  message: string;
  severity: 'warning' | 'critical';
}

export interface EngineData {
  rpm: number;
  maxRpm: number;
  throttle: number;
  gear: GearPosition;
  temperature: number;
  oilPressure: number;
  hours: number;
  errors: EngineError[];
}

// Navigation types
export interface Position {
  lat: number;
  lng: number;
}

export interface NavigationData {
  speed: number;
  heading: number;
  rudderAngle: number;
  position: Position;
  destination: Position | null;
  routePoints: Position[];
}

// Camera types
export type CameraId = 'bow' | 'stern' | 'port' | 'starboard';

export interface CameraFeed {
  url: string;
  active: boolean;
  label: string;
}

// Systems types
export interface FuelTank {
  level: number;
  capacity: number;
}

export interface FuelData {
  tank1: FuelTank;
  tank2: FuelTank;
  tank3: FuelTank;
  consumption: number;
}

export interface ElectricalData {
  voltage: number;
  current: number;
  batteryPercent: number;
}

export interface WeatherData {
  waterTemp: number;
  airTemp: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
}

export interface AnchorData {
  deployed: boolean;
  depth: number;
  chainLength: number;
  position: number;
}

// Controls types
export interface LightsState {
  parking: boolean;
  running: boolean;
}

export interface ControlsData {
  power: boolean;
  lights: LightsState;
  bowThruster: boolean;
  generator: boolean;
}

// Connection types
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface ConnectionData {
  status: ConnectionStatus;
  lastUpdate: number | null;
  error: string | null;
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add global TypeScript types"
```

---

### Task 5: Create Config and Constants

**Files:**
- Create: `src/config/constants.ts`
- Create: `src/config/theme.ts`

**Step 1: Create src/config/constants.ts**

```typescript
export const ENGINE_MAX_RPM = 4000;
export const ENGINE_RED_ZONE_PCT = 0.8;

export const RUDDER_MAX_ANGLE = 35;

export const COMPASS_UPDATE_INTERVAL = 100;

export const SPLASH_LOGO_DURATION = 2800;
export const SPLASH_TRANSITION_DURATION = 600;

export const WS_RECONNECT_DELAY = 1000;
export const WS_MAX_RECONNECT_ATTEMPTS = 5;

export const CAMERA_LABELS: Record<string, string> = {
  bow: 'Нос',
  stern: 'Корма',
  port: 'Левый борт',
  starboard: 'Правый борт',
};

export const GEAR_LABELS: Record<string, string> = {
  N: 'Нейтраль',
  F: 'Вперёд',
  R: 'Назад',
};
```

**Step 2: Create src/config/theme.ts**

```typescript
export const theme = {
  colors: {
    bg: '#080d12',
    card: '#0c1218',
    cardLight: '#162230',
    border: 'rgba(80,110,140,0.25)',
    primary: '#e8f4ff',
    secondary: '#7a95a8',
    muted: '#4a6070',
    green: '#3dc88c',
    amber: '#e8a030',
    red: '#e04050',
    yellow: '#e8c820',
  },
  gradients: {
    page: 'radial-gradient(ellipse at 50% 30%, #0f1a25 0%, #080d12 50%, #000 100%)',
    card: 'linear-gradient(145deg, rgba(15,22,35,0.95) 0%, rgba(8,12,22,0.98) 50%, rgba(5,8,15,0.99) 100%)',
    glassShine: 'linear-gradient(180deg, rgba(180,210,255,0.1) 0%, transparent 100%)',
  },
} as const;
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add config and theme constants"
```

---

## Phase 2: Zustand Store

### Task 6: Create Zustand Slices

**Files:**
- Create: `src/stores/slices/enginesSlice.ts`
- Create: `src/stores/slices/navigationSlice.ts`
- Create: `src/stores/slices/camerasSlice.ts`
- Create: `src/stores/slices/systemsSlice.ts`
- Create: `src/stores/slices/controlsSlice.ts`
- Create: `src/stores/slices/connectionSlice.ts`

**Step 1: Create src/stores/slices/enginesSlice.ts**

```typescript
import type { StateCreator } from 'zustand';
import type { EngineData, EngineId } from '@/types';

export interface EnginesSlice {
  engines: {
    left: EngineData;
    right: EngineData;
  };
  updateEngine: (id: EngineId, data: Partial<EngineData>) => void;
  setEngineGear: (id: EngineId, gear: EngineData['gear']) => void;
}

const initialEngine: EngineData = {
  rpm: 0,
  maxRpm: 4000,
  throttle: 0,
  gear: 'N',
  temperature: 75,
  oilPressure: 4.2,
  hours: 1247,
  errors: [],
};

export const createEnginesSlice: StateCreator<EnginesSlice> = (set) => ({
  engines: {
    left: { ...initialEngine, rpm: 2350, throttle: 62, gear: 'F' },
    right: { ...initialEngine, rpm: 2410, throttle: 64, gear: 'F', hours: 1243 },
  },
  updateEngine: (id, data) =>
    set((state) => ({
      engines: {
        ...state.engines,
        [id]: { ...state.engines[id], ...data },
      },
    })),
  setEngineGear: (id, gear) =>
    set((state) => ({
      engines: {
        ...state.engines,
        [id]: { ...state.engines[id], gear },
      },
    })),
});
```

**Step 2: Create src/stores/slices/navigationSlice.ts**

```typescript
import type { StateCreator } from 'zustand';
import type { NavigationData, Position } from '@/types';

export interface NavigationSlice {
  navigation: NavigationData;
  updateNavigation: (data: Partial<NavigationData>) => void;
  setDestination: (dest: Position | null) => void;
  setRudderAngle: (angle: number) => void;
}

export const createNavigationSlice: StateCreator<NavigationSlice> = (set) => ({
  navigation: {
    speed: 18.4,
    heading: 42,
    rudderAngle: -6,
    position: { lat: 55.7558, lng: 37.6173 },
    destination: { lat: 55.7612, lng: 37.6289 },
    routePoints: [
      { lat: 55.7558, lng: 37.6173 },
      { lat: 55.7580, lng: 37.6210 },
      { lat: 55.7612, lng: 37.6289 },
    ],
  },
  updateNavigation: (data) =>
    set((state) => ({
      navigation: { ...state.navigation, ...data },
    })),
  setDestination: (dest) =>
    set((state) => ({
      navigation: { ...state.navigation, destination: dest },
    })),
  setRudderAngle: (angle) =>
    set((state) => ({
      navigation: { ...state.navigation, rudderAngle: angle },
    })),
});
```

**Step 3: Create src/stores/slices/camerasSlice.ts**

```typescript
import type { StateCreator } from 'zustand';
import type { CameraId, CameraFeed } from '@/types';

export interface CamerasSlice {
  cameras: {
    feeds: Record<CameraId, CameraFeed>;
    selectedCamera: CameraId | null;
  };
  selectCamera: (id: CameraId | null) => void;
  toggleCamera: (id: CameraId) => void;
}

export const createCamerasSlice: StateCreator<CamerasSlice> = (set) => ({
  cameras: {
    feeds: {
      bow: { url: '', active: true, label: 'Нос' },
      stern: { url: '', active: true, label: 'Корма' },
      port: { url: '', active: true, label: 'Левый борт' },
      starboard: { url: '', active: true, label: 'Правый борт' },
    },
    selectedCamera: null,
  },
  selectCamera: (id) =>
    set((state) => ({
      cameras: { ...state.cameras, selectedCamera: id },
    })),
  toggleCamera: (id) =>
    set((state) => ({
      cameras: {
        ...state.cameras,
        feeds: {
          ...state.cameras.feeds,
          [id]: {
            ...state.cameras.feeds[id],
            active: !state.cameras.feeds[id].active,
          },
        },
      },
    })),
});
```

**Step 4: Create src/stores/slices/systemsSlice.ts**

```typescript
import type { StateCreator } from 'zustand';
import type { FuelData, ElectricalData, WeatherData, AnchorData } from '@/types';

export interface SystemsSlice {
  systems: {
    fuel: FuelData;
    electrical: ElectricalData;
    weather: WeatherData;
    anchor: AnchorData;
  };
  updateFuel: (data: Partial<FuelData>) => void;
  updateElectrical: (data: Partial<ElectricalData>) => void;
  updateWeather: (data: Partial<WeatherData>) => void;
  updateAnchor: (data: Partial<AnchorData>) => void;
  setAnchorPosition: (position: number) => void;
}

export const createSystemsSlice: StateCreator<SystemsSlice> = (set) => ({
  systems: {
    fuel: {
      tank1: { level: 68, capacity: 400 },
      tank2: { level: 72, capacity: 400 },
      tank3: { level: 45, capacity: 200 },
      consumption: 24.5,
    },
    electrical: {
      voltage: 24.7,
      current: 45,
      batteryPercent: 87,
    },
    weather: {
      waterTemp: 18,
      airTemp: 22,
      windSpeed: 12,
      windDirection: 225,
      pressure: 1013,
    },
    anchor: {
      deployed: false,
      depth: 8.5,
      chainLength: 0,
      position: 0,
    },
  },
  updateFuel: (data) =>
    set((state) => ({
      systems: { ...state.systems, fuel: { ...state.systems.fuel, ...data } },
    })),
  updateElectrical: (data) =>
    set((state) => ({
      systems: { ...state.systems, electrical: { ...state.systems.electrical, ...data } },
    })),
  updateWeather: (data) =>
    set((state) => ({
      systems: { ...state.systems, weather: { ...state.systems.weather, ...data } },
    })),
  updateAnchor: (data) =>
    set((state) => ({
      systems: { ...state.systems, anchor: { ...state.systems.anchor, ...data } },
    })),
  setAnchorPosition: (position) =>
    set((state) => ({
      systems: {
        ...state.systems,
        anchor: { ...state.systems.anchor, position, deployed: position > 0 },
      },
    })),
});
```

**Step 5: Create src/stores/slices/controlsSlice.ts**

```typescript
import type { StateCreator } from 'zustand';
import type { ControlsData } from '@/types';

export interface ControlsSlice {
  controls: ControlsData;
  togglePower: () => void;
  toggleLight: (light: 'parking' | 'running') => void;
  toggleBowThruster: () => void;
  toggleGenerator: () => void;
  setControl: (key: keyof ControlsData, value: boolean) => void;
}

export const createControlsSlice: StateCreator<ControlsSlice> = (set) => ({
  controls: {
    power: true,
    lights: { parking: false, running: true },
    bowThruster: false,
    generator: true,
  },
  togglePower: () =>
    set((state) => ({
      controls: { ...state.controls, power: !state.controls.power },
    })),
  toggleLight: (light) =>
    set((state) => ({
      controls: {
        ...state.controls,
        lights: { ...state.controls.lights, [light]: !state.controls.lights[light] },
      },
    })),
  toggleBowThruster: () =>
    set((state) => ({
      controls: { ...state.controls, bowThruster: !state.controls.bowThruster },
    })),
  toggleGenerator: () =>
    set((state) => ({
      controls: { ...state.controls, generator: !state.controls.generator },
    })),
  setControl: (key, value) =>
    set((state) => ({
      controls: { ...state.controls, [key]: value },
    })),
});
```

**Step 6: Create src/stores/slices/connectionSlice.ts**

```typescript
import type { StateCreator } from 'zustand';
import type { ConnectionData, ConnectionStatus } from '@/types';

export interface ConnectionSlice {
  connection: ConnectionData;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setConnectionError: (error: string | null) => void;
  updateLastUpdate: () => void;
}

export const createConnectionSlice: StateCreator<ConnectionSlice> = (set) => ({
  connection: {
    status: 'disconnected',
    lastUpdate: null,
    error: null,
  },
  setConnectionStatus: (status) =>
    set((state) => ({
      connection: { ...state.connection, status, error: status === 'connected' ? null : state.connection.error },
    })),
  setConnectionError: (error) =>
    set((state) => ({
      connection: { ...state.connection, error, status: 'error' },
    })),
  updateLastUpdate: () =>
    set((state) => ({
      connection: { ...state.connection, lastUpdate: Date.now() },
    })),
});
```

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add Zustand slices for all state domains"
```

---

### Task 7: Create Combined Store

**Files:**
- Create: `src/stores/index.ts`

**Step 1: Create src/stores/index.ts**

```typescript
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

import { createEnginesSlice, type EnginesSlice } from './slices/enginesSlice';
import { createNavigationSlice, type NavigationSlice } from './slices/navigationSlice';
import { createCamerasSlice, type CamerasSlice } from './slices/camerasSlice';
import { createSystemsSlice, type SystemsSlice } from './slices/systemsSlice';
import { createControlsSlice, type ControlsSlice } from './slices/controlsSlice';
import { createConnectionSlice, type ConnectionSlice } from './slices/connectionSlice';

export type StoreState = EnginesSlice &
  NavigationSlice &
  CamerasSlice &
  SystemsSlice &
  ControlsSlice &
  ConnectionSlice;

export const useStore = create<StoreState>()(
  devtools(
    subscribeWithSelector((...args) => ({
      ...createEnginesSlice(...args),
      ...createNavigationSlice(...args),
      ...createCamerasSlice(...args),
      ...createSystemsSlice(...args),
      ...createControlsSlice(...args),
      ...createConnectionSlice(...args),
    })),
    { name: 'YachtDashboard' }
  )
);

// Селекторы для оптимизации рендеринга
export const selectEngines = (state: StoreState) => state.engines;
export const selectNavigation = (state: StoreState) => state.navigation;
export const selectCameras = (state: StoreState) => state.cameras;
export const selectSystems = (state: StoreState) => state.systems;
export const selectControls = (state: StoreState) => state.controls;
export const selectConnection = (state: StoreState) => state.connection;
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: create combined Zustand store with selectors"
```

---

## Phase 3: UI Components

### Task 8: Create Icons Component

**Files:**
- Create: `src/components/icons/index.tsx`

**Step 1: Create src/components/icons/index.tsx**

```typescript
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function Battery(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect width="16" height="10" x="2" y="7" rx="2" />
      <line x1="22" x2="22" y1="11" y2="13" />
    </svg>
  );
}

export function Fuel(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <line x1="3" x2="15" y1="22" y2="22" />
      <line x1="4" x2="14" y1="9" y2="9" />
      <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
      <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5" />
    </svg>
  );
}

export function AlertTriangle(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function CheckCircle(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function Anchor(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="5" r="3" />
      <line x1="12" x2="12" y1="22" y2="8" />
      <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
    </svg>
  );
}

export function Waves(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    </svg>
  );
}

export function Navigation(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <polygon points="12 2 19 21 12 17 5 21 12 2" />
    </svg>
  );
}

export function Power(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12 2v10" />
      <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
    </svg>
  );
}

export function Lightbulb(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

export function Generator(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 12h.01" />
      <path d="M10 12h.01" />
      <path d="M14 12h4" />
      <path d="M6 10v4" />
    </svg>
  );
}

export function BowThruster(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v12" />
      <path d="M8 9l4 3-4 3" />
      <path d="M16 9l-4 3 4 3" />
    </svg>
  );
}

export function Camera(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

export function Wind(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
    </svg>
  );
}

export function Thermometer(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
    </svg>
  );
}

export function Gauge(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="m12 14 4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </svg>
  );
}

export function ChevronUp(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

export function ChevronDown(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function X(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function Wifi(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M5 13a10 10 0 0 1 14 0" />
      <path d="M8.5 16.5a5 5 0 0 1 7 0" />
      <path d="M2 8.82a15 15 0 0 1 20 0" />
      <line x1="12" x2="12.01" y1="20" y2="20" />
    </svg>
  );
}

export function WifiOff(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12 20h.01" />
      <path d="M8.5 16.429a5 5 0 0 1 7 0" />
      <path d="M5 12.859a10 10 0 0 1 5.17-2.69" />
      <path d="M19 12.859a10 10 0 0 0-2.007-1.523" />
      <path d="M2 8.82a15 15 0 0 1 4.177-2.643" />
      <path d="M22 8.82a15 15 0 0 0-11.288-3.764" />
      <path d="m2 2 20 20" />
    </svg>
  );
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add SVG icon components"
```

---

### Task 9: Create Card Component

**Files:**
- Create: `src/components/ui/Card.tsx`

**Step 1: Create src/components/ui/Card.tsx**

```typescript
import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function Card({ children, className, noPadding }: CardProps) {
  return (
    <div
      className={cn(
        'glass-card',
        !noPadding && 'p-4',
        className
      )}
    >
      {/* Glass shine overlay */}
      <div className="glass-shine" />

      {/* Inner shadow for depth */}
      <div className="absolute inset-0 rounded-card shadow-card-inset pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add Card UI component"
```

---

### Task 10: Create Toggle Component

**Files:**
- Create: `src/components/ui/Toggle.tsx`

**Step 1: Create src/components/ui/Toggle.tsx**

```typescript
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 16 },
  md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 20 },
  lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 28 },
};

export function Toggle({ checked, onChange, disabled, size = 'md' }: ToggleProps) {
  const s = sizes[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex items-center rounded-full transition-colors',
        s.track,
        checked ? 'bg-yacht-green' : 'bg-yacht-muted',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <motion.span
        className={cn(
          'absolute left-0.5 rounded-full bg-white shadow',
          s.thumb
        )}
        animate={{ x: checked ? s.translate : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add Toggle UI component"
```

---

### Task 11: Create ProgressBar Component

**Files:**
- Create: `src/components/ui/ProgressBar.tsx`

**Step 1: Create src/components/ui/ProgressBar.tsx**

```typescript
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'green' | 'amber' | 'red' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const colorClasses = {
  green: 'bg-yacht-green',
  amber: 'bg-yacht-amber',
  red: 'bg-yacht-red',
  primary: 'bg-yacht-primary',
};

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function ProgressBar({
  value,
  max = 100,
  color = 'green',
  size = 'md',
  showLabel,
  className,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full rounded-full bg-yacht-muted/30 overflow-hidden',
          sizeClasses[size]
        )}
      >
        <motion.div
          className={cn('h-full rounded-full', colorClasses[color])}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-yacht-secondary mt-1">
          {Math.round(percent)}%
        </span>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add ProgressBar UI component"
```

---

### Task 12: Create App Entry Point

**Files:**
- Create: `src/app/main.tsx`
- Create: `src/app/App.tsx`

**Step 1: Create src/app/main.tsx**

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

**Step 2: Create src/app/App.tsx**

```typescript
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SPLASH_LOGO_DURATION, SPLASH_TRANSITION_DURATION } from '@/config/constants';

type Phase = 'logo' | 'transition' | 'ready';

export function App() {
  const [phase, setPhase] = useState<Phase>('logo');

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('transition'), SPLASH_LOGO_DURATION);
    const timer2 = setTimeout(
      () => setPhase('ready'),
      SPLASH_LOGO_DURATION + SPLASH_TRANSITION_DURATION
    );

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="min-h-screen bg-yacht-gradient">
      <AnimatePresence mode="wait">
        {phase !== 'ready' ? (
          <SplashScreen key="splash" phase={phase} />
        ) : (
          <Dashboard key="dashboard" />
        )}
      </AnimatePresence>
    </div>
  );
}

function SplashScreen({ phase }: { phase: Phase }) {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-yacht-gradient"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="text-center"
        animate={{ opacity: phase === 'transition' ? 0 : 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-5xl font-bold text-yacht-primary mb-4">
          HouseBoat
        </h1>
        <p className="text-yacht-secondary">Dashboard v2.0</p>
      </motion.div>
    </motion.div>
  );
}

function Dashboard() {
  return (
    <motion.div
      className="h-screen p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="h-full flex items-center justify-center">
        <p className="text-yacht-secondary text-xl">
          Dashboard components coming soon...
        </p>
      </div>
    </motion.div>
  );
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add App entry point with splash screen"
```

---

### Task 13: Verify Build Works

**Step 1: Install dependencies**

Run: `npm install`
Expected: All packages installed

**Step 2: Start dev server**

Run: `npm run dev`
Expected: Server starts on http://localhost:3000

**Step 3: Test build**

Run: `npm run build`
Expected: Build completes without errors

**Step 4: Commit verification**

```bash
git add -A
git commit -m "chore: verify build configuration works"
```

---

## Phase 4: Features Implementation

> Continue with each feature following the same pattern:
> 1. Create types (if needed)
> 2. Create components
> 3. Create hooks
> 4. Export from index.ts
> 5. Commit

### Task 14-20: Implement Features

See separate detailed tasks for each feature:
- Task 14: Navigation feature (Compass, MapView, RudderGauge, SpeedDisplay)
- Task 15: Engines feature (Tachometer, EngineCard, EngineModal)
- Task 16: Cameras feature (CameraFeed, CameraGrid)
- Task 17: Fuel feature (FuelTank, FuelPanel)
- Task 18: Electrical feature (BatteryIndicator, PowerStats)
- Task 19: Weather feature (WeatherWidget)
- Task 20: Controls feature (ControlButton, AnchorControl)

---

## Phase 5: Layout Integration

### Task 21: Create Dashboard Layout

**Files:**
- Create: `src/app/layouts/Dashboard.tsx`
- Modify: `src/app/App.tsx`

### Task 22: Create TopBar Component

**Files:**
- Create: `src/components/TopBar.tsx`

### Task 23: Create BottomBar Component

**Files:**
- Create: `src/components/BottomBar.tsx`

---

## Phase 6: WebSocket Integration

### Task 24: Create WebSocket Client

**Files:**
- Create: `src/services/websocket/types.ts`
- Create: `src/services/websocket/client.ts`
- Create: `src/services/websocket/storeSync.ts`

### Task 25: Create Demo Mode Provider

**Files:**
- Create: `src/services/demo/DemoProvider.tsx`

---

## Phase 7: Final Polish

### Task 26: Update index.html and Build for Production

### Task 27: Update docs/bundle.js for GitHub Pages

### Task 28: Final Testing and Cleanup

---

## Execution Notes

- Each task should be completed before moving to the next
- Run `npm run lint` after each TypeScript file change
- Run `npm run dev` to verify changes work
- Commit after each task completion
- Reference original `yacht-dashboard.jsx` for exact styling and values
