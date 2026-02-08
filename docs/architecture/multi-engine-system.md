# Multi-Engine System Architecture

## Overview

The HouseBoat Dashboard supports configurable multi-engine systems ranging from 2 to 6 engines. The architecture is designed to be flexible, scalable, and maintainable, with dynamic layout adaptation and intelligent resource mapping.

## Table of Contents

1. [Architecture Principles](#architecture-principles)
2. [Configuration](#configuration)
3. [Data Structure](#data-structure)
4. [Layout System](#layout-system)
5. [Fuel Mapping](#fuel-mapping)
6. [Component Architecture](#component-architecture)
7. [State Management](#state-management)
8. [Examples](#examples)

## Architecture Principles

### Array-Based Design

The system uses an array-based architecture instead of named properties:

**Before (2-engine only):**
```typescript
{
  left: EngineData,
  right: EngineData
}
```

**After (2-6 engines):**
```typescript
engines: EngineData[]  // Array of 2-6 engines indexed 0 to N-1
```

### Benefits

- Scalable from 2 to 6 engines without code changes
- Uniform data access via index
- Simple iteration with `.map()`
- Easy to add/remove engines dynamically

## Configuration

### Engine Count Configuration

Engines are configured via environment variable:

```typescript
// src/config/constants.ts
export const ENGINE_CONFIG = {
  count: Number(import.meta.env.VITE_ENGINE_COUNT) || 2,
  maxEngines: 6,
  minEngines: 2,
};
```

### Setting Engine Count

**.env file:**
```bash
VITE_ENGINE_COUNT=4
```

**Command line:**
```bash
VITE_ENGINE_COUNT=6 npm run dev
```

**Validation:**
- Minimum: 2 engines
- Maximum: 6 engines
- Default: 2 engines if not specified

## Data Structure

### Engine Data Type

```typescript
interface EngineData {
  rpm: number;              // Current RPM (0-4000)
  maxRpm: number;           // Maximum RPM (typically 4000)
  throttle: number;         // Throttle percentage (0-100)
  gear: 'N' | 'F' | 'R';   // Neutral, Forward, Reverse
  temperature: number;      // Engine temperature (°C)
  oilPressure: number;      // Oil pressure (bar)
  hours: number;            // Operating hours
  fuelConsumption: number;  // L/h
  status: 'ok' | 'warning' | 'error';
  errors: string[];         // Error messages
}
```

### Engines Slice State

```typescript
interface EnginesSlice {
  engines: EngineData[];                 // Array of 2-6 engines
  engineCount: number;                   // Current engine count (2-6)
  fuelMapping: Record<number, string>;   // Engine index → fuel tank ID
  expandedEngine: number | null;         // Currently expanded engine

  // Actions
  updateEngine: (index: number, data: Partial<EngineData>) => void;
  setEngineGear: (index: number, gear: 'N' | 'F' | 'R') => void;
  setExpandedEngine: (index: number | null) => void;
  toggleExpandedEngine: (index: number) => void;
}
```

## Layout System

### Dynamic Layout Algorithm

The layout system automatically adapts to the number of engines:

```typescript
// src/utils/engineLayout.ts
export interface EngineLayout {
  rows: number;           // Number of rows (1 or 2)
  topRow: number;         // Engines in top row
  bottomRow: number;      // Engines in bottom row
  tachometerSize: number; // Size in pixels
}

export const getEnginesLayout = (count: number): EngineLayout => {
  if (count <= 4) {
    return {
      rows: 1,
      topRow: count,
      bottomRow: 0,
      tachometerSize: count === 2 ? 310 : count === 3 ? 285 : 270,
    };
  } else if (count === 5) {
    return {
      rows: 2,
      topRow: 3,
      bottomRow: 2,
      tachometerSize: 245,
    };
  } else {
    // 6 engines
    return {
      rows: 2,
      topRow: 3,
      bottomRow: 3,
      tachometerSize: 245,
    };
  }
};
```

### Layout Configurations

| Engine Count | Rows | Layout | Tachometer Size |
|--------------|------|--------|-----------------|
| 2 | 1 | `[E1] [E2]` | 310px |
| 3 | 1 | `[E1] [E2] [E3]` | 285px |
| 4 | 1 | `[E1] [E2] [E3] [E4]` | 270px |
| 5 | 2 | `[E1] [E2] [E3]`<br>`[E4] [E5]` | 245px |
| 6 | 2 | `[E1] [E2] [E3]`<br>`[E4] [E5] [E6]` | 245px |

### Responsive Grid Implementation

```typescript
// Single row layout (2-4 engines)
<div
  className="grid gap-6 items-center justify-center"
  style={{
    gridTemplateColumns: `repeat(${layout.topRow}, 1fr)`,
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

// Two-row layout (5-6 engines)
<div className="flex flex-col gap-6 items-center justify-center">
  {/* Top row */}
  <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${layout.topRow}, 1fr)` }}>
    {topEngines.map((engine, index) => ...)}
  </div>

  {/* Bottom row */}
  <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${layout.bottomRow}, 1fr)` }}>
    {bottomEngines.map((engine, index) => ...)}
  </div>
</div>
```

## Fuel Mapping

### Purpose

Maps each engine to its fuel source (tank). This allows:
- Multiple engines to share a fuel tank
- Independent fuel tracking per engine
- Flexible fuel tank assignment

### Default Mapping Strategy

```typescript
const createFuelMapping = (count: number): Record<number, string> => {
  const mapping: Record<number, string> = {};
  for (let i = 0; i < count; i++) {
    if (i % 2 === 0) {
      mapping[i] = 'gasolineLeft';   // Even indices → left tank
    } else {
      mapping[i] = 'gasolineRight';  // Odd indices → right tank
    }
  }
  return mapping;
};
```

### Mapping Examples

**2 Engines:**
```typescript
{
  0: 'gasolineLeft',   // Engine 1 → Left tank
  1: 'gasolineRight'   // Engine 2 → Right tank
}
```

**4 Engines:**
```typescript
{
  0: 'gasolineLeft',   // Engine 1 → Left tank
  1: 'gasolineRight',  // Engine 2 → Right tank
  2: 'gasolineLeft',   // Engine 3 → Left tank
  3: 'gasolineRight'   // Engine 4 → Right tank
}
```

**6 Engines:**
```typescript
{
  0: 'gasolineLeft',   // Engine 1 → Left tank
  1: 'gasolineRight',  // Engine 2 → Right tank
  2: 'gasolineLeft',   // Engine 3 → Left tank
  3: 'gasolineRight',  // Engine 4 → Right tank
  4: 'gasolineLeft',   // Engine 5 → Left tank
  5: 'gasolineRight'   // Engine 6 → Right tank
}
```

### Using Fuel Mapping

```typescript
const FuelPanel = () => {
  const fuelMapping = useStore((s) => s.fuelMapping);
  const engines = useStore((s) => s.engines);

  // Get engines using a specific tank
  const leftEngines = engines.filter((_, idx) =>
    fuelMapping[idx] === 'gasolineLeft'
  );

  // Calculate total consumption for tank
  const leftTankConsumption = leftEngines.reduce(
    (sum, engine) => sum + engine.fuelConsumption,
    0
  );
};
```

## Component Architecture

### Component Hierarchy

```
EnginesPanel
├── EngineCard (×N)
│   ├── Tachometer
│   └── EngineInfoPanel (expandable)
```

### EnginesPanel

Main container component that renders all engines.

**Responsibilities:**
- Get layout configuration
- Render single or double row layout
- Pass correct size to each EngineCard

```typescript
export const EnginesPanel = memo(function EnginesPanel() {
  const engines = useStore((s) => s.engines);
  const engineCount = useStore((s) => s.engineCount);
  const layout = getEnginesLayout(engineCount);

  // Render based on layout.rows...
});
```

### EngineCard

Individual engine display with tachometer and info panel.

**Props:**
```typescript
interface EngineCardProps {
  id: number;              // Engine index (0-based)
  data: EngineData;        // Engine data
  size: number;            // Tachometer size in pixels
}
```

**Features:**
- Displays engine number (1-indexed for user)
- Renders tachometer with dynamic size
- Expandable info panel with details
- Gear indicator

### Tachometer

Circular RPM gauge component.

**Props:**
```typescript
interface TachometerProps {
  rpm: number;           // Current RPM
  maxRpm: number;        // Maximum RPM
  size?: number;         // Size in pixels (default: 310)
  status?: 'ok' | 'warning' | 'error';
}
```

**Scaling:**
- Adapts all internal measurements to size prop
- Maintains proportions at any size
- Smooth animations with Framer Motion

## State Management

### Initialization

```typescript
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
    // ... actions
  };
};
```

### Accessing Engine Data

```typescript
// Get all engines
const engines = useStore((s) => s.engines);

// Get specific engine
const engine = useStore((s) => s.engines[engineIndex]);

// Get engine count
const count = useStore((s) => s.engineCount);

// Update engine
const updateEngine = useStore((s) => s.updateEngine);
updateEngine(2, { rpm: 3500, throttle: 75 });
```

## Examples

### Example 1: 2-Engine Configuration

**Configuration:**
```bash
VITE_ENGINE_COUNT=2
```

**Result:**
- Single row layout
- 310px tachometers
- Engines: [0, 1]
- Fuel mapping: 0→Left, 1→Right

**Visual:**
```
┌─────────────────────────┐
│  [Engine 1]  [Engine 2] │
│   310px       310px     │
└─────────────────────────┘
```

### Example 2: 4-Engine Configuration

**Configuration:**
```bash
VITE_ENGINE_COUNT=4
```

**Result:**
- Single row layout
- 270px tachometers
- Engines: [0, 1, 2, 3]
- Fuel mapping: 0→Left, 1→Right, 2→Left, 3→Right

**Visual:**
```
┌──────────────────────────────────────────────┐
│  [E1]   [E2]   [E3]   [E4]                   │
│  270px  270px  270px  270px                   │
└──────────────────────────────────────────────┘
```

### Example 3: 6-Engine Configuration

**Configuration:**
```bash
VITE_ENGINE_COUNT=6
```

**Result:**
- Two row layout (3+3)
- 245px tachometers
- Engines: [0, 1, 2, 3, 4, 5]
- Fuel mapping: Even→Left, Odd→Right

**Visual:**
```
┌────────────────────────────────────┐
│     [E1]   [E2]   [E3]             │
│     245px  245px  245px             │
│                                     │
│     [E4]   [E5]   [E6]             │
│     245px  245px  245px             │
└────────────────────────────────────┘
```

### Example 4: Custom Fuel Mapping

Override default fuel mapping for custom tank assignment:

```typescript
// All engines share a single center tank
const customMapping: Record<number, string> = {
  0: 'gasolineCenter',
  1: 'gasolineCenter',
  2: 'gasolineCenter',
  3: 'gasolineCenter',
};

// Or: Outer engines use outer tanks, inner use center
const advancedMapping: Record<number, string> = {
  0: 'gasolineLeft',    // Outer left
  1: 'gasolineCenter',  // Inner left
  2: 'gasolineCenter',  // Inner right
  3: 'gasolineRight',   // Outer right
};
```

## Migration Notes

### From Legacy 2-Engine System

**Old code:**
```typescript
const leftEngine = useStore((s) => s.engines.left);
const rightEngine = useStore((s) => s.engines.right);
```

**New code:**
```typescript
const engines = useStore((s) => s.engines);
const leftEngine = engines[0];
const rightEngine = engines[1];
```

### Updating Engine Data

**Old:**
```typescript
updateLeftEngine({ rpm: 3000 });
updateRightEngine({ rpm: 3100 });
```

**New:**
```typescript
updateEngine(0, { rpm: 3000 });
updateEngine(1, { rpm: 3100 });
```

## Performance Considerations

1. **Memoization:** All components use `memo()` to prevent unnecessary re-renders
2. **Selective subscriptions:** Components only subscribe to needed state slices
3. **Zustand optimization:** Store updates are batched automatically
4. **Layout calculation:** Computed once per render, not per engine

## Future Enhancements

Potential improvements for future versions:

1. **Dynamic engine count:** Allow runtime changes without restart
2. **Custom layouts:** User-defined engine arrangements
3. **Engine groups:** Logical grouping (port/starboard, fore/aft)
4. **Advanced fuel mapping UI:** Visual editor for tank assignments
5. **Engine profiles:** Save/load different engine configurations
6. **Asymmetric layouts:** Support odd engine counts with custom positioning

## Conclusion

The multi-engine system provides a robust, scalable architecture for managing 2-6 engines with:
- Clean, maintainable code
- Flexible configuration
- Automatic layout adaptation
- Intelligent fuel mapping
- Excellent performance

The array-based design ensures the system can easily accommodate future requirements and modifications.
