import { memo } from 'react';
import type { SpeedDisplayProps } from '../types';

export const SpeedDisplay = memo(function SpeedDisplay({ speed, unit = 'уз' }: SpeedDisplayProps) {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-yacht-primary">
        {speed.toFixed(1)}
      </div>
      <div className="text-sm text-yacht-secondary mt-1">{unit}</div>
    </div>
  );
});
