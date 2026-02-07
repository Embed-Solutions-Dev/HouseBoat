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
  toggleAnchor: () => void;
}

export const createSystemsSlice: StateCreator<SystemsSlice> = (set) => ({
  systems: {
    fuel: {
      gasolineLeft: { level: 360, capacity: 400 },
      gasolineRight: { level: 92, capacity: 400 },
      diesel: { level: 146, capacity: 200 },
      water: { level: 96, capacity: 200 },
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
  toggleAnchor: () =>
    set((state) => {
      const isDeployed = state.systems.anchor.deployed;
      return {
        systems: {
          ...state.systems,
          anchor: {
            ...state.systems.anchor,
            deployed: !isDeployed,
            position: isDeployed ? 0 : 100,
          },
        },
      };
    }),
});
