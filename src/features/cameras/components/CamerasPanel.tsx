import { memo } from 'react';
import { Card } from '@/components/ui/Card';
import { CameraGrid } from './CameraGrid';

export const CamerasPanel = memo(function CamerasPanel() {
  return (
    <Card className="h-full flex flex-col">
      <h2 className="text-lg font-semibold text-yacht-primary mb-4">Камеры</h2>
      <div className="flex-1">
        <CameraGrid />
      </div>
    </Card>
  );
});
