# Multi-Engine Support (2-6 Engines) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Adapt HouseBoat Dashboard to support 2-6 engines with aviation-styled navigation components

**Architecture:** Refactor from fixed left/right engines to dynamic array-based structure. Add aviation-styled compass and rudder components. Implement responsive grid layout with 1-2 rows based on engine count.

**Tech Stack:** React 18, TypeScript, Zustand, Framer Motion, Tailwind CSS

---

## Task 1: Update Type System

**Files:**
- Modify: `src/types/index.ts:2-3`

**Step 1: Change EngineId type**

```typescript
// Change from:
export type EngineId = 'left' | 'right';

// To:
export type EngineId = number; // 0-5 for 6 engines max
```

**Step 2: Verify no TypeScript errors**

Run: `npm run lint`
Expected: TypeScript errors in files using EngineId (expected, will fix in next tasks)

**Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "refactor: change EngineId from string literal to number"
```

---

## Task 2: Add Engine Configuration

**Files:**
- Modify: `src/config/constants.ts:26`

**Step 1: Add engine configuration constants**

```typescript
// Add at end of file:
export const ENGINE_CONFIG = {
  count: Number(import.meta.env.VITE_ENGINE_COUNT) || 2,
  maxEngines: 6,
  minEngines: 2,
};
```

**Step 2: Verify configuration loads**

Run: `npm run dev`
Check console: No errors

**Step 3: Commit**

```bash
git add src/config/constants.ts
git commit -m "feat: add engine configuration constants"
```

---

## Task 3: Refactor Engines Slice - Part 1 (Types)

**Files:**
- Modify: `src/stores/slices/enginesSlice.ts:1-16`

**Step 1: Update ExpandedEngine type**

```typescript
// Change from:
export type ExpandedEngine = 'Left' | 'Right' | null;

// To:
export type ExpandedEngine = number | null; // Engine index
```

**Step 2: Update EnginesSlice interface**

```typescript
export interface EnginesSlice {
  engines: EngineData[];              // Changed from {left, right}
  engineCount: number;                // New: 2-6
  fuelMapping: Record<number, string>; // New: engineIndex → fuelTankId
  expandedEngine: ExpandedEngine;
  updateEngine: (index: number, data: Partial<EngineData>) => void;
  setEngineGear: (index: number, gear: EngineData['gear']) => void;
  setExpandedEngine: (index: number | null) => void;
  toggleExpandedEngine: (index: number) => void;
}
```

**Step 3: Verify TypeScript compilation**

Run: `npm run lint`
Expected: Errors in slice implementation (will fix next)

**Step 4: Commit**

```bash
git add src/stores/slices/enginesSlice.ts
git commit -m "refactor: update EnginesSlice interface for array-based engines"
```

---

## Task 4: Refactor Engines Slice - Part 2 (Implementation)

**Files:**
- Modify: `src/stores/slices/enginesSlice.ts:18-56`

**Step 1: Update store implementation**

```typescript
import { ENGINE_CONFIG } from '@/config/constants';

const initialEngine: EngineData = {
  rpm: 0,
  maxRpm: 4000,
  throttle: 0,
  gear: 'N',
  temperature: 75,
  oilPressure: 4.2,
  hours: 1247,
  fuelConsumption: 12.5,
  status: 'ok',
  errors: [],
};

// Helper to create default engines array
const createEnginesArray = (count: number): EngineData[] => {
  return Array.from({ length: count }, (_, i) => ({
    ...initialEngine,
    rpm: i === 0 ? 2350 : 2410 + i * 10,
    throttle: i === 0 ? 62 : 64 + i,
    gear: 'F' as const,
    hours: 1247 - i,
  }));
};

// Helper to create default fuel mapping
const createFuelMapping = (count: number): Record<number, string> => {
  const mapping: Record<number, string> = {};
  for (let i = 0; i < count; i++) {
    if (i % 2 === 0) {
      mapping[i] = 'gasolineLeft';
    } else {
      mapping[i] = 'gasolineRight';
    }
  }
  return mapping;
};

export const createEnginesSlice: StateCreator<EnginesSlice> = (set) => {
  const engineCount = Math.min(
    Math.max(ENGINE_CONFIG.count, ENGINE_CONFIG.minEngines),
    ENGINE_CONFIG.maxEngines
  );

  return {
    engines: createEnginesArray(engineCount),
    engineCount,
    fuelMapping: createFuelMapping(engineCount),
    expandedEngine: null,

    updateEngine: (index, data) =>
      set((state) => ({
        engines: state.engines.map((engine, i) =>
          i === index ? { ...engine, ...data } : engine
        ),
      })),

    setEngineGear: (index, gear) =>
      set((state) => ({
        engines: state.engines.map((engine, i) =>
          i === index ? { ...engine, gear } : engine
        ),
      })),

    setExpandedEngine: (index) => set({ expandedEngine: index }),

    toggleExpandedEngine: (index) =>
      set((state) => ({
        expandedEngine: state.expandedEngine === index ? null : index,
      })),
  };
};
```

**Step 2: Verify TypeScript compilation**

Run: `npm run lint`
Expected: Errors in components using old API (will fix next)

**Step 3: Commit**

```bash
git add src/stores/slices/enginesSlice.ts
git commit -m "refactor: implement array-based engines with fuel mapping"
```

---

## Task 5: Create Layout Helper Utility

**Files:**
- Create: `src/utils/engineLayout.ts`

**Step 1: Create layout utility**

```typescript
export interface EngineLayout {
  rows: number;
  topRow: number;
  bottomRow: number;
  tachometerSize: number;
}

export const getEnginesLayout = (count: number): EngineLayout => {
  if (count <= 4) {
    return {
      rows: 1,
      topRow: count,
      bottomRow: 0,
      tachometerSize: count === 2 ? 310 : count === 3 ? 290 : 280,
    };
  } else if (count === 5) {
    return {
      rows: 2,
      topRow: 3,
      bottomRow: 2,
      tachometerSize: 240,
    };
  } else {
    // 6 engines
    return {
      rows: 2,
      topRow: 3,
      bottomRow: 3,
      tachometerSize: 240,
    };
  }
};
```

**Step 2: Add to utils index**

Modify: `src/utils/index.ts`

```typescript
// Add export:
export { getEnginesLayout } from './engineLayout';
export type { EngineLayout } from './engineLayout';
```

**Step 3: Verify compilation**

Run: `npm run lint`
Expected: No errors in this file

**Step 4: Commit**

```bash
git add src/utils/engineLayout.ts src/utils/index.ts
git commit -m "feat: add engine layout calculation utility"
```

---

## Task 6: Update EngineCard Component

**Files:**
- Modify: `src/features/engines/components/EngineCard.tsx:1-41`
- Modify: `src/features/engines/types.ts:18-21`

**Step 1: Update EngineCardProps type**

```typescript
// In types.ts, change:
export interface EngineCardProps {
  id: EngineId;      // Now number instead of 'left' | 'right'
  data: EngineData;
  size?: number;     // New: optional tachometer size
}
```

**Step 2: Refactor EngineCard component**

```typescript
import { memo, useCallback } from 'react';
import { useStore } from '@/stores';
import { Tachometer } from './Tachometer';
import type { EngineCardProps } from '../types';

export const EngineCard = memo(function EngineCard({ id, data, size = 310 }: EngineCardProps) {
  const fuel = useStore((s) => s.systems.fuel);
  const fuelMapping = useStore((s) => s.fuelMapping);
  const toggleExpandedEngine = useStore((s) => s.toggleExpandedEngine);
  const expandedEngine = useStore((s) => s.expandedEngine);

  // Get fuel tank ID from mapping
  const fuelTankId = fuelMapping[id];

  // Get fuel level for this engine's tank
  const fuelLevel = (() => {
    const tank = fuel[fuelTankId as keyof typeof fuel];
    if (!tank || typeof tank !== 'object' || !('level' in tank)) {
      console.warn(`Fuel tank "${fuelTankId}" not found for engine ${id}`);
      return 0;
    }
    return Math.round((tank.level / tank.capacity) * 100);
  })();

  // Generate temp text from engine data
  const tempText = `${data.temperature}°C · ${data.oilPressure} бар`;

  const handleToggleExpand = useCallback(() => {
    toggleExpandedEngine(id);
  }, [id, toggleExpandedEngine]);

  const isExpanded = expandedEngine === id;

  return (
    <Tachometer
      side={`Engine ${id + 1}` as 'Left' | 'Right'} // Temp compatibility
      rpm={data.rpm}
      maxRpm={data.maxRpm}
      throttle={data.throttle}
      motorHours={data.hours}
      fuelLevel={fuelLevel}
      tempText={tempText}
      hasFaults={data.errors.length > 0}
      onToggleExpand={handleToggleExpand}
      isExpanded={isExpanded}
      temperature={data.temperature}
      oilPressure={data.oilPressure}
      size={size}
    />
  );
});
```

**Step 3: Verify TypeScript compilation**

Run: `npm run lint`
Expected: Errors in Tachometer (will fix next)

**Step 4: Commit**

```bash
git add src/features/engines/components/EngineCard.tsx src/features/engines/types.ts
git commit -m "refactor: update EngineCard to use numeric engine ID and fuel mapping"
```

---

## Task 7: Update Tachometer Component for Size Prop

**Files:**
- Modify: `src/features/engines/components/Tachometer.tsx:4,22-35,50-103`
- Modify: `src/features/engines/types.ts:3-16`

**Step 1: Update TachometerProps**

```typescript
// In types.ts:
export interface TachometerProps {
  side: 'Left' | 'Right' | string;  // Allow string for "Engine N"
  rpm: number;
  maxRpm: number;
  throttle: number;
  motorHours: number;
  fuelLevel: number;
  tempText: string;
  hasFaults: boolean;
  onToggleExpand?: () => void;
  isExpanded?: boolean;
  temperature?: number;
  oilPressure?: number;
  size?: number;  // New: tachometer size (default 310)
}
```

**Step 2: Update Tachometer component to use size prop**

```typescript
export const Tachometer = memo(function Tachometer({
  side,
  rpm,
  maxRpm,
  throttle,
  motorHours,
  fuelLevel,
  tempText,
  hasFaults,
  onToggleExpand,
  isExpanded = false,
  temperature = 0,
  oilPressure = 0,
  size = 310,  // Default size
}: TachometerProps) {
  const lowFuel = fuelLevel < 25;
  const mediumFuel = fuelLevel >= 25 && fuelLevel < 50;
  const v = clamp(rpm, 0, maxRpm);
  const ratio = v / maxRpm;

  const startAngle = 225;
  const sweep = 270;
  const endAngle = -45;

  const mv = useMotionValue(-startAngle);
  const spring = useSpring(mv, { stiffness: 80, damping: 15 });

  useEffect(() => {
    const targetAngle = -startAngle + ratio * sweep;
    mv.set(targetAngle);
  }, [ratio, mv]);

  // Use size prop throughout component
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;

  // Scale font sizes proportionally
  const scale = size / 310; // 310 is original size

  // ... rest of component using scaled values
```

**Step 3: Scale all size-dependent values**

Apply scale factor to:
- Font sizes: `fontSize: 24 * scale`
- Padding/margins
- SVG dimensions
- Icon sizes

**Step 4: Verify visual appearance**

Run: `npm run dev`
Check: Tachometers render at correct size

**Step 5: Commit**

```bash
git add src/features/engines/components/Tachometer.tsx src/features/engines/types.ts
git commit -m "feat: add size prop to Tachometer for scalable rendering"
```

---

## Task 8: Refactor EnginesPanel Component

**Files:**
- Modify: `src/features/engines/components/EnginesPanel.tsx:1-29`

**Step 1: Rewrite EnginesPanel for dynamic layout**

```typescript
import { memo } from 'react';
import { useStore } from '@/stores';
import { EngineCard } from './EngineCard';
import { getEnginesLayout } from '@/utils/engineLayout';

export const EnginesPanel = memo(function EnginesPanel() {
  const engines = useStore((s) => s.engines);
  const engineCount = useStore((s) => s.engineCount);

  const layout = getEnginesLayout(engineCount);

  if (layout.rows === 1) {
    // Single row layout (2-4 engines)
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${layout.topRow}, 1fr)`,
          gap: 12,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {engines.map((engine, index) => (
          <EngineCard
            key={index}
            id={index}
            data={engine}
            size={layout.tachometerSize}
          />
        ))}
      </div>
    );
  }

  // Two rows layout (5-6 engines)
  const topEngines = engines.slice(0, layout.topRow);
  const bottomEngines = engines.slice(layout.topRow);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Top row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${layout.topRow}, 1fr)`,
          gap: 12,
          justifyContent: 'center',
        }}
      >
        {topEngines.map((engine, index) => (
          <EngineCard
            key={index}
            id={index}
            data={engine}
            size={layout.tachometerSize}
          />
        ))}
      </div>

      {/* Bottom row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${layout.bottomRow}, 1fr)`,
          gap: 12,
          justifyContent: 'center',
        }}
      >
        {bottomEngines.map((engine, index) => (
          <EngineCard
            key={index + layout.topRow}
            id={index + layout.topRow}
            data={engine}
            size={layout.tachometerSize}
          />
        ))}
      </div>
    </div>
  );
});
```

**Step 2: Remove old exports**

Update `src/features/engines/index.ts` to remove MiniEngineCard export (will be removed later)

**Step 3: Verify rendering**

Run: `npm run dev`
Check: Engines render in correct layout

**Step 4: Commit**

```bash
git add src/features/engines/components/EnginesPanel.tsx
git commit -m "refactor: implement dynamic grid layout for 2-6 engines"
```

---

## Task 9: Create AviationCompass Component

**Files:**
- Create: `src/features/navigation/components/AviationCompass.tsx`

**Step 1: Create AviationCompass component**

```typescript
import { memo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/stores';

const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export const AviationCompass = memo(function AviationCompass() {
  const heading = useStore((s) => s.navigation.heading);

  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 8;
  const innerR = outerR - 30;

  return (
    <div
      style={{
        width: size + 16,
        height: size + 16,
        borderRadius: '50%',
        background: 'linear-gradient(165deg, #e8e8e8 0%, #b8b8b8 15%, #909090 30%, #707070 50%, #909090 70%, #b8b8b8 85%, #a0a0a0 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.8)',
        padding: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'linear-gradient(180deg, #162230 0%, #0c1218 100%)',
          boxShadow: 'inset 0 4px 16px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Rotating compass rose */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
          }}
          animate={{ rotate: -heading }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        >
          <svg viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', inset: 0 }}>
            {/* Degree marks */}
            {Array.from({ length: 72 }).map((_, i) => {
              const deg = i * 5;
              const angle = (deg * Math.PI) / 180;
              const isMajor = deg % 30 === 0;
              const r1 = isMajor ? innerR - 8 : innerR;
              const r2 = innerR + 5;

              return (
                <line
                  key={i}
                  x1={cx + r1 * Math.sin(angle)}
                  y1={cy - r1 * Math.cos(angle)}
                  x2={cx + r2 * Math.sin(angle)}
                  y2={cy - r2 * Math.cos(angle)}
                  stroke={isMajor ? 'rgba(200,210,230,0.9)' : 'rgba(150,160,180,0.4)'}
                  strokeWidth={isMajor ? 2 : 1}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Cardinal directions */}
            {cardinals.map((label, i) => {
              const deg = i * 45;
              const angle = (deg * Math.PI) / 180;
              const textR = outerR - 15;
              const isNorth = label === 'N';

              return (
                <text
                  key={label}
                  x={cx + textR * Math.sin(angle)}
                  y={cy - textR * Math.cos(angle)}
                  fill={isNorth ? '#e04050' : '#e8f4ff'}
                  fontSize={isNorth ? 24 : 18}
                  fontWeight={isNorth ? 700 : 600}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {label}
                </text>
              );
            })}
          </svg>
        </motion.div>

        {/* Fixed pointer at top */}
        <div
          style={{
            position: 'absolute',
            top: 15,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '14px solid #e04050',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
          }}
        />

        {/* Digital heading display */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            background: 'rgba(6,10,16,0.8)',
            borderRadius: 12,
            padding: '8px 16px',
            border: '1px solid rgba(80,100,120,0.3)',
          }}
        >
          <div style={{ fontSize: 11, color: 'rgba(122,149,168,0.8)', marginBottom: 2 }}>КУРС</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#e8f4ff', fontVariantNumeric: 'tabular-nums' }}>
            {Math.round(heading).toString().padStart(3, '0')}°
          </div>
        </div>

        {/* Center hub */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #d0d0d0 30%, #909090 70%, #606060 100%)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
            zIndex: 10,
          }}
        />
      </div>
    </div>
  );
});
```

**Step 2: Export from navigation feature**

Update `src/features/navigation/index.ts`:

```typescript
export { AviationCompass } from './components/AviationCompass';
```

**Step 3: Verify rendering**

Run: `npm run dev`
Check: Compass renders and rotates with heading

**Step 4: Commit**

```bash
git add src/features/navigation/components/AviationCompass.tsx src/features/navigation/index.ts
git commit -m "feat: add AviationCompass component with rotating scale"
```

---

## Task 10: Create AviationRudder Component

**Files:**
- Create: `src/features/navigation/components/AviationRudder.tsx`

**Step 1: Create AviationRudder component**

```typescript
import { memo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/stores';

export const AviationRudder = memo(function AviationRudder() {
  const rudderAngle = useStore((s) => s.navigation.rudderAngle);

  const width = 320;
  const height = 90;
  const scaleWidth = 260;
  const minAngle = -45;
  const maxAngle = 45;

  // Calculate pointer position (-45° to +45° maps to 0% to 100%)
  const pointerPosition = ((rudderAngle - minAngle) / (maxAngle - minAngle)) * scaleWidth;

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 16,
        background: 'linear-gradient(180deg, rgba(12,18,28,0.95) 0%, rgba(6,10,18,0.98) 100%)',
        border: '1px solid rgba(60,80,100,0.3)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(100,130,160,0.08)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {/* Label */}
      <div style={{ fontSize: 11, color: 'rgba(122,149,168,0.8)', fontWeight: 500, letterSpacing: 0.5 }}>
        РУЛЬ
      </div>

      {/* Scale */}
      <div style={{ position: 'relative', width: scaleWidth, height: 40 }}>
        {/* Horizontal line */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 0,
            right: 0,
            height: 2,
            background: 'rgba(80,100,120,0.5)',
          }}
        />

        {/* Tick marks */}
        <svg width={scaleWidth} height={40} style={{ position: 'absolute', top: 0, left: 0 }}>
          {[-45, -30, -15, 0, 15, 30, 45].map((angle) => {
            const x = ((angle - minAngle) / (maxAngle - minAngle)) * scaleWidth;
            const isCenter = angle === 0;
            const height = isCenter ? 18 : 12;

            return (
              <g key={angle}>
                <line
                  x1={x}
                  y1={20 - height / 2}
                  x2={x}
                  y2={20 + height / 2}
                  stroke={isCenter ? '#e04050' : 'rgba(200,210,230,0.8)'}
                  strokeWidth={isCenter ? 2.5 : 1.5}
                  strokeLinecap="round"
                />
                <text
                  x={x}
                  y={isCenter ? 38 : 36}
                  fill={isCenter ? '#e04050' : 'rgba(150,180,210,0.7)'}
                  fontSize={isCenter ? 11 : 9}
                  fontWeight={isCenter ? 600 : 400}
                  textAnchor="middle"
                >
                  {angle > 0 ? `+${angle}` : angle}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Moving pointer */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 3,
            height: 40,
            background: 'linear-gradient(180deg, #d04050 0%, #e85060 50%, #d04050 100%)',
            borderRadius: 1.5,
            boxShadow: '0 0 8px rgba(224,80,96,0.6), 0 2px 4px rgba(0,0,0,0.4)',
          }}
          animate={{ x: pointerPosition - 1.5 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        />
      </div>

      {/* Digital value */}
      <div
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: '#e8f4ff',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {rudderAngle > 0 ? '+' : ''}
        {rudderAngle.toFixed(0)}°
      </div>
    </div>
  );
});
```

**Step 2: Export from navigation feature**

Update `src/features/navigation/index.ts`:

```typescript
export { AviationRudder } from './components/AviationRudder';
```

**Step 3: Verify rendering**

Run: `npm run dev`
Check: Rudder renders with moving pointer

**Step 4: Commit**

```bash
git add src/features/navigation/components/AviationRudder.tsx src/features/navigation/index.ts
git commit -m "feat: add AviationRudder component with horizontal scale"
```

---

## Task 11: Update Dashboard Layout

**Files:**
- Modify: `src/app/layouts/Dashboard.tsx:1-215`

**Step 1: Simplify Dashboard layout**

```typescript
import { memo } from 'react';
import { motion } from 'framer-motion';
import { CamerasPanel } from '@/features/cameras';
import { EnginesPanel } from '@/features/engines';
import { AviationCompass, AviationRudder, NavigationOverlay } from '@/features/navigation';
import { ControlsPanel } from '@/features/controls';
import { TopBar } from '@/components/TopBar';
import { useStore } from '@/stores';

export const Dashboard = memo(function Dashboard() {
  const navMode = useStore((s) => s.controls.navigation);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #0f1a25 0%, #080d12 50%, #000 100%)',
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Cameras - 2x2 grid */}
      <div className="w-full max-w-[1048px] mb-4">
        <CamerasPanel />
      </div>

      {/* Top metrics bar */}
      <div className="w-full max-w-[1048px] mb-4" style={{ zIndex: 60 }}>
        <TopBar />
      </div>

      {/* Aviation Compass */}
      <div className="mb-4" style={{ zIndex: 50 }}>
        <AviationCompass />
      </div>

      {/* Engines with Navigation overlay */}
      <div className="w-full max-w-[1048px] mb-4 relative">
        {/* Navigation map overlay */}
        <NavigationOverlay />

        {/* Engines grid */}
        <motion.div
          animate={{
            opacity: navMode ? 0.3 : 1,
            scale: navMode ? 0.85 : 1,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          style={{
            pointerEvents: navMode ? 'none' : 'auto',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <EnginesPanel />
        </motion.div>
      </div>

      {/* Aviation Rudder */}
      <div className="mb-4" style={{ zIndex: 50 }}>
        <AviationRudder />
      </div>

      {/* Controls */}
      <div className="w-full max-w-[1048px]">
        <ControlsPanel />
      </div>
    </motion.div>
  );
});
```

**Step 2: Remove old components**

Delete references to:
- CompassWidget (old)
- RudderWidget (old)
- MiniEngineCard
- Center logo
- Absolute positioning animations

**Step 3: Verify layout**

Run: `npm run dev`
Check: New vertical stack layout works

**Step 4: Commit**

```bash
git add src/app/layouts/Dashboard.tsx
git commit -m "refactor: simplify dashboard layout with aviation navigation components"
```

---

## Task 12: Update NavigationOverlay

**Files:**
- Modify: `src/features/navigation/components/NavigationOverlay.tsx`

**Step 1: Simplify overlay for full-width**

Remove center constraints, make overlay expand to full engines area width in nav mode.

```typescript
// Update styles to:
animate={{
  opacity: navMode ? 1 : 0.15,
  scale: navMode ? 1 : 0.95,
}}
style={{
  position: 'absolute',
  inset: 0,  // Full width/height
  zIndex: navMode ? 10 : 1,
  pointerEvents: navMode ? 'auto' : 'none',
}}
```

**Step 2: Test nav mode**

Run: `npm run dev`
Toggle navigation mode
Check: Overlay expands, engines fade

**Step 3: Commit**

```bash
git add src/features/navigation/components/NavigationOverlay.tsx
git commit -m "refactor: update NavigationOverlay for full-width in nav mode"
```

---

## Task 13: Remove Deprecated Components

**Files:**
- Delete: `src/features/navigation/components/CompassWidget.tsx`
- Delete: `src/features/navigation/components/RudderWidget.tsx`
- Delete: `src/features/engines/components/MiniEngineCard.tsx`
- Modify: `src/features/navigation/index.ts`
- Modify: `src/features/engines/index.ts`

**Step 1: Remove old navigation widgets**

```bash
rm src/features/navigation/components/CompassWidget.tsx
rm src/features/navigation/components/RudderWidget.tsx
```

**Step 2: Remove MiniEngineCard**

```bash
rm src/features/engines/components/MiniEngineCard.tsx
```

**Step 3: Update exports**

In `src/features/navigation/index.ts`:
```typescript
// Remove:
// export { CompassWidget } from './components/CompassWidget';
// export { RudderWidget } from './components/RudderWidget';
```

In `src/features/engines/index.ts`:
```typescript
// Remove:
// export { MiniEngineCard } from './components/MiniEngineCard';
```

**Step 4: Verify no import errors**

Run: `npm run lint`
Expected: No errors

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor: remove deprecated compass, rudder, and mini engine card components"
```

---

## Task 14: Test 2 Engines Configuration

**Files:**
- None (testing)

**Step 1: Verify default 2-engine layout**

Run: `npm run dev`
Check:
- 2 tachometers in single row
- Size 310px (full size)
- Both engines functional
- Info popup works
- Navigation mode works

**Step 2: Verify fuel mapping**

Check console for fuel warnings
Verify: Engine 0 uses gasolineLeft, Engine 1 uses gasolineRight

**Step 3: Document results**

Create note: "✅ 2 engines: working"

---

## Task 15: Test 4 Engines Configuration

**Files:**
- Modify: `.env` or set environment variable

**Step 1: Set engine count to 4**

Create/modify `.env`:
```
VITE_ENGINE_COUNT=4
```

**Step 2: Restart dev server**

```bash
# Stop current server
# Start new server
npm run dev
```

**Step 3: Verify 4-engine layout**

Check:
- 4 tachometers in single row
- Size 280px (smaller)
- All functional
- Proper spacing

**Step 4: Document results**

Create note: "✅ 4 engines: working"

**Step 5: Commit env file**

```bash
git add .env
git commit -m "test: configure for 4 engines"
```

---

## Task 16: Test 6 Engines Configuration

**Files:**
- Modify: `.env`

**Step 1: Set engine count to 6**

```
VITE_ENGINE_COUNT=6
```

**Step 2: Restart and verify**

Check:
- 3 engines top row
- 3 engines bottom row
- Size 240px (compact)
- All functional

**Step 3: Document results**

Create note: "✅ 6 engines: working"

**Step 4: Commit**

```bash
git add .env
git commit -m "test: configure for 6 engines"
```

---

## Task 17: Final Visual Polish

**Files:**
- Various (styling adjustments)

**Step 1: Check spacing and alignment**

Verify:
- Consistent gaps between components
- Proper centering
- No layout shifts

**Step 2: Check animations**

Verify:
- Smooth compass rotation
- Smooth rudder movement
- Smooth nav mode transitions
- Info popup animations

**Step 3: Check responsive behavior**

Test on different window sizes
Ensure nothing breaks

**Step 4: Commit any fixes**

```bash
git add .
git commit -m "polish: final visual adjustments"
```

---

## Task 18: Update Documentation

**Files:**
- Modify: `/workspace/CLAUDE.md`

**Step 1: Update project description**

Add section about multi-engine support:

```markdown
## Multi-Engine Support

The dashboard supports 2-6 engines with dynamic layout:
- **2-4 engines:** Single horizontal row
- **5 engines:** 3 top + 2 bottom
- **6 engines:** 3 top + 3 bottom

Configure via environment variable: `VITE_ENGINE_COUNT=4`

## Aviation Navigation Components

- **AviationCompass:** Rotating 360° compass with cardinal directions
- **AviationRudder:** Horizontal rudder angle indicator (-45° to +45°)
```

**Step 2: Update architecture section**

Update EnginesSlice description to reflect array-based structure

**Step 3: Commit documentation**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with multi-engine support info"
```

---

## Task 19: Create Final Commit and Push

**Files:**
- None (git operations)

**Step 1: Verify all tests pass**

Run through checklist:
- [x] 2 engines works
- [x] 4 engines works
- [x] 6 engines works
- [x] Aviation compass works
- [x] Aviation rudder works
- [x] Nav mode works
- [x] Info popup works

**Step 2: Create feature completion commit**

```bash
git add .
git commit -m "feat: complete multi-engine support (2-6 engines) with aviation navigation

- Refactor engines from fixed left/right to dynamic array (2-6)
- Add configurable fuel mapping system
- Implement responsive grid layout (1-2 rows)
- Create AviationCompass with rotating 360° scale
- Create AviationRudder with horizontal angle indicator
- Simplify navigation mode (remove mini cards and complex animations)
- Scale tachometers based on engine count (310px → 240px)
- Remove deprecated CompassWidget, RudderWidget, MiniEngineCard

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**Step 3: Push to remote**

```bash
git push origin houseboat-four-plus-engines
```

**Step 4: Verify deployment**

Check: https://houseboat-dash.conveyor.echelon.business
Verify: Multi-engine layout working

---

## Success Criteria Checklist

- [x] Dashboard supports 2-6 engines dynamically
- [x] Aviation-styled compass component
- [x] Aviation-styled rudder component
- [x] Fuel mapping system implemented
- [x] Info popup works for all engines
- [x] Navigation mode simplified and working
- [x] Visual quality matches original design
- [x] No regressions in 2-engine mode
- [x] TypeScript compilation clean
- [x] Documentation updated

---

**Implementation Complete!** 🎉
