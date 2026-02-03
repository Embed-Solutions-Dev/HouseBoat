import type { StateCreator } from 'zustand';
import type { ControlsData } from '@/types';

export interface ControlsSlice {
  controls: ControlsData;
  togglePower: () => void;
  toggleLight: (light: 'parking' | 'running') => void;
  toggleBowThruster: () => void;
  toggleGenerator: () => void;
  toggleNavigation: () => void;
  setControl: (key: keyof ControlsData, value: boolean) => void;
}

export const createControlsSlice: StateCreator<ControlsSlice> = (set) => ({
  controls: {
    power: true,
    lights: { parking: false, running: true },
    bowThruster: false,
    generator: true,
    navigation: false,
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
  toggleNavigation: () =>
    set((state) => ({
      controls: { ...state.controls, navigation: !state.controls.navigation },
    })),
  setControl: (key, value) =>
    set((state) => ({
      controls: { ...state.controls, [key]: value },
    })),
});
