# Multi-Engine Support Design (2-6 Engines)

**Date:** 2026-02-08
**Branch:** `houseboat-four-plus-engines`
**Status:** Approved for implementation

## Overview

Adapt the HouseBoat Dashboard to support 2-6 engines (currently supports only 2). Engines will be arranged horizontally with aviation-styled navigation components.

## Requirements

1. **Engine Count:** Support 2-6 engines with dynamic layout
2. **Layout:** Horizontal arrangement with responsive rows:
   - 2-4 engines: single row
   - 5 engines: 3 top + 2 bottom
   - 6 engines: 3 top + 3 bottom
3. **Navigation:** Aviation-styled compass (above engines) and rudder (below engines)
4. **Fuel System:** Configurable mapping between engines and fuel tanks
5. **Compatibility:** Keep existing features (info popup, navigation mode, animations)

## Architecture Changes

### 1. State Management (Zustand)

**enginesSlice.ts** - Refactor from fixed left/right to dynamic array:

```typescript
export interface EnginesSlice {
  engines: EngineData[];              // Array instead of {left, right}
  engineCount: number;                // 2-6 engines
  fuelMapping: Record<number, string>; // engineIndex → fuelTankId
  expandedEngine: number | null;      // Index of expanded engine
  updateEngine: (index: number, data: Partial<EngineData>) => void;
  setEngineGear: (index: number, gear: GearPosition) => void;
  setExpandedEngine: (index: number | null) => void;
  toggleExpandedEngine: (index: number) => void;
}
```

**Fuel Mapping Example:**
```typescript
fuelMapping: {
  0: 'gasolineLeft',   // Engine 0 uses left tank
  1: 'gasolineRight',  // Engine 1 uses right tank
  2: 'gasolineLeft',   // Engine 2 uses left tank
  3: 'diesel',         // Engine 3 uses diesel tank
}
```

### 2. Type System

**types/index.ts** - Update EngineId:
```typescript
// Old: export type EngineId = 'left' | 'right';
export type EngineId = number; // 0-5
```

### 3. Configuration

**config/constants.ts** - Add engine configuration:
```typescript
export const ENGINE_CONFIG = {
  count: Number(import.meta.env.VITE_ENGINE_COUNT) || 2,
  maxEngines: 6,
  minEngines: 2,
};
```

## Component Structure

### Dashboard Layout (Vertical Stack)

```
┌─────────────────────────────────────┐
│           TopBar (Metrics)          │
├─────────────────────────────────────┤
│         CamerasPanel (2x2)          │
├─────────────────────────────────────┤
│       AviationCompass (NEW)         │
├─────────────────────────────────────┤
│                                     │
│         Engines Grid (Dynamic)      │
│  [Tach] [Tach] [Tach] [Tach] ...   │
│                                     │
├─────────────────────────────────────┤
│       AviationRudder (NEW)          │
├─────────────────────────────────────┤
│       Navigation Overlay            │
├─────────────────────────────────────┤
│          ControlsPanel              │
└─────────────────────────────────────┘
```

### Removed Elements
- ❌ Center logo between engines
- ❌ Mini engine cards in navigation mode
- ❌ Animated compass/rudder positioning

### New Components

#### AviationCompass
- **Location:** Above engines
- **Design:** Circular aviation gyroscope style
- **Features:**
  - 0-360° rotating scale
  - Cardinal directions (N, E, S, W, NE, SE, SW, NW)
  - Fixed triangle pointer at top
  - Digital heading in center
  - Metallic texture matching tachometer
  - Size: ~200-250px diameter

#### AviationRudder
- **Location:** Below engines
- **Design:** Horizontal aviation indicator
- **Features:**
  - Horizontal scale (-45° to +45°)
  - Vertical moving pointer
  - Tick marks: -45, -30, -15, 0, +15, +30, +45
  - Digital angle value below
  - Size: ~300px width × 80-100px height

## Engines Grid Logic

### Layout Algorithm

```typescript
const getEnginesLayout = (count: number) => {
  if (count <= 4) {
    return {
      rows: 1,
      columns: count,
      topRow: count,
      bottomRow: 0
    };
  } else if (count === 5) {
    return {
      rows: 2,
      topRow: 3,
      bottomRow: 2
    };
  } else { // 6
    return {
      rows: 2,
      topRow: 3,
      bottomRow: 3
    };
  }
};
```

### CSS Grid Structure

**2-4 engines (single row):**
```css
display: grid;
grid-template-columns: repeat(N, 1fr);
gap: 12px;
```

**5-6 engines (two rows):**
```jsx
<div className="engines-container">
  <div className="top-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
    {/* First 3 engines */}
  </div>
  <div className="bottom-row" style={{ gridTemplateColumns: 'repeat(N, 1fr)' }}>
    {/* Remaining engines */}
  </div>
</div>
```

### Tachometer Scaling

| Engine Count | Size | Notes |
|--------------|------|-------|
| 2 | 310px | Full size (current) |
| 3-4 | 280px | Slightly smaller |
| 5-6 | 240px | Compact |

Scale proportionally: fonts, icons, padding, stroke widths.

## Navigation Mode Changes

### Behavior

**When `controls.navigation === true`:**

1. **Engines:**
   - `opacity: 0.3`
   - `scale: 0.85`
   - `pointerEvents: 'none'`

2. **Compass/Rudder:**
   - Remain visible (no animation)
   - Static positioning

3. **Navigation Overlay:**
   - Expand to full width
   - Increase z-index above engines
   - Show map prominently

### Removed Features
- Mini engine cards in corners
- Animated compass/rudder fly-out
- Complex absolute positioning

## Migration & Compatibility

### Default Configuration
```typescript
// Store initialization - backwards compatible
engines: [
  { ...initialEngine, rpm: 2350, throttle: 62 }, // Index 0 (was 'left')
  { ...initialEngine, rpm: 2410, throttle: 64 }, // Index 1 (was 'right')
],
fuelMapping: {
  0: 'gasolineLeft',
  1: 'gasolineRight',
}
```

### Configuration Methods
1. **Environment Variable:** `VITE_ENGINE_COUNT=4`
2. **Config File:** `/src/config/constants.ts`
3. **Future:** API/Admin panel

### Error Handling
- Validate `engineCount` (2-6), fallback to 2
- Check fuel tank exists in `fuelMapping`
- Graceful degradation: show 0% if tank not found
- Console warnings for configuration issues

## Implementation Plan

### Phase 1: Core Data Structure
1. Update `enginesSlice.ts` - array-based structure
2. Update `types/index.ts` - EngineId type
3. Add configuration in `constants.ts`
4. Update store initialization

### Phase 2: Engine Components
1. Refactor `EnginesPanel.tsx` - dynamic grid
2. Update `EngineCard.tsx` - accept index prop
3. Update `Tachometer.tsx` - scaling logic
4. Implement layout algorithm

### Phase 3: Navigation Components
1. Create `AviationCompass.tsx`
2. Create `AviationRudder.tsx`
3. Remove old compass/rudder positioning
4. Update `Dashboard.tsx` layout

### Phase 4: Navigation Mode
1. Simplify nav mode logic
2. Remove mini engine cards
3. Update `NavigationOverlay.tsx`
4. Test with 2-6 engines

### Phase 5: Testing & Polish
1. Visual testing (2, 3, 4, 5, 6 engines)
2. Info popup for each engine
3. Navigation mode transitions
4. Responsive behavior
5. Demo mode updates

## Testing Checklist

- [ ] 2 engines: matches current behavior
- [ ] 3 engines: single row, proper spacing
- [ ] 4 engines: single row, scaled down
- [ ] 5 engines: 3+2 layout
- [ ] 6 engines: 3+3 layout
- [ ] Info popup works for all engines
- [ ] Navigation mode: engines fade/scale
- [ ] Fuel mapping: correct tank per engine
- [ ] Aviation compass: smooth rotation
- [ ] Aviation rudder: smooth movement
- [ ] Responsive on different screen sizes

## Non-Goals (Out of Scope)

- Admin panel for configuration (future)
- Real-time engine data (use existing demo/WebSocket)
- Changes to TopBar, CamerasPanel, ControlsPanel
- New engine parameters/metrics

## Success Criteria

1. Dashboard supports 2-6 engines dynamically
2. Aviation-styled navigation components
3. Fuel mapping system in place
4. All existing features work (info popup, nav mode)
5. Visual quality matches current design
6. No regressions in 2-engine configuration

---

**Approved by:** User
**Ready for implementation:** Yes
