import type { StateCreator } from 'zustand';
import type { EngineData, EngineId } from '@/types';

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

export const createEnginesSlice: StateCreator<EnginesSlice> = (set) => ({
  engines: {
    left: { ...initialEngine, rpm: 2350, throttle: 62, gear: 'F' },
    right: { ...initialEngine, rpm: 2410, throttle: 64, gear: 'F', hours: 1243 },
  },
  expandedEngine: null,
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
  setExpandedEngine: (engine) => set({ expandedEngine: engine }),
  toggleExpandedEngine: (engine) =>
    set((state) => ({
      expandedEngine: state.expandedEngine === engine ? null : engine,
    })),
});
