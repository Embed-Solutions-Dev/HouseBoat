import { memo } from 'react';
import { useStore } from '@/stores';
import { CameraFeed } from './CameraFeed';
import type { CameraId } from '@/types';
import type { CameraGridProps } from '../types';

const cameraOrder: CameraId[] = ['bow', 'stern', 'port', 'starboard'];

export const CameraGrid = memo(function CameraGrid({ onCameraSelect }: CameraGridProps) {
  const { feeds, selectedCamera } = useStore((s) => s.cameras);
  const selectCamera = useStore((s) => s.selectCamera);

  const handleSelect = (id: CameraId) => {
    selectCamera(selectedCamera === id ? null : id);
    onCameraSelect?.(id);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {cameraOrder.map((id) => (
        <CameraFeed
          key={id}
          id={id}
          feed={feeds[id]}
          selected={selectedCamera === id}
          onClick={() => handleSelect(id)}
        />
      ))}
    </div>
  );
});
