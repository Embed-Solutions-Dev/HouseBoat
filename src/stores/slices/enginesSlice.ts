import type { StateCreator } from 'zustand';
import type { EngineData } from '@/types';
import { ENGINE_CONFIG } from '@/config/constants';

export type ExpandedEngine = number | null; // Engine index

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
  return Array.from({ length: count }, (_, i) => {
    // Engine 3 (Правый двигатель 2) is turned off
    if (i === 3) {
      return {
        ...initialEngine,
        rpm: 0,
        throttle: 0,
        gear: 'N' as const,
        hours: 1244,
        status: 'ok' as const,
      };
    }

    // Other engines running normally
    return {
      ...initialEngine,
      rpm: i === 0 ? 2350 : 2410 + i * 10,
      throttle: i === 0 ? 62 : 64 + i,
      gear: 'F' as const,
      hours: 1247 - i,
    };
  });
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
