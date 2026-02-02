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
