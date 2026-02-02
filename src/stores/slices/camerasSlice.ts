import type { StateCreator } from 'zustand';
import type { CameraId, CameraFeed } from '@/types';

export interface CamerasSlice {
  cameras: {
    feeds: Record<CameraId, CameraFeed>;
    selectedCamera: CameraId | null;
  };
  selectCamera: (id: CameraId | null) => void;
  toggleCamera: (id: CameraId) => void;
}

export const createCamerasSlice: StateCreator<CamerasSlice> = (set) => ({
  cameras: {
    feeds: {
      bow: { url: '', active: true, label: 'Нос' },
      stern: { url: '', active: true, label: 'Корма' },
      port: { url: '', active: true, label: 'Левый борт' },
      starboard: { url: '', active: true, label: 'Правый борт' },
    },
    selectedCamera: null,
  },
  selectCamera: (id) =>
    set((state) => ({
      cameras: { ...state.cameras, selectedCamera: id },
    })),
  toggleCamera: (id) =>
    set((state) => ({
      cameras: {
        ...state.cameras,
        feeds: {
          ...state.cameras.feeds,
          [id]: {
            ...state.cameras.feeds[id],
            active: !state.cameras.feeds[id].active,
          },
        },
      },
    })),
});
