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
