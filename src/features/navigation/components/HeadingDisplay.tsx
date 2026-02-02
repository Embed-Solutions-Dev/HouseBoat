import { memo } from 'react';
import { degreesToCardinal } from '@/utils/math';
import type { HeadingDisplayProps } from '../types';

export const HeadingDisplay = memo(function HeadingDisplay({ heading }: HeadingDisplayProps) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-yacht-primary">
        {Math.round(heading)}°
      </div>
      <div className="text-sm text-yacht-secondary mt-1">
        {degreesToCardinal(heading)}
      </div>
    </div>
  );
});
