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
