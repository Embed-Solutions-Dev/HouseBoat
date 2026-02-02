import { memo } from 'react';
import { Tachometer } from './Tachometer';
import type { EngineCardProps } from '../types';

export const EngineCard = memo(function EngineCard({ data, label }: EngineCardProps) {
  return (
    <div className="flex flex-col items-center">
      <Tachometer
        rpm={data.rpm}
        maxRpm={data.maxRpm}
        throttle={data.throttle}
        gear={data.gear}
        label={label}
        size={180}
      />
      <div className="mt-8 text-center">
        <div className="text-xs text-yacht-secondary">
          {data.hours} моточасов
        </div>
        {data.errors.length > 0 && (
          <div className="mt-1 text-xs text-yacht-red">
            {data.errors.length} ошибок
          </div>
        )}
      </div>
    </div>
  );
});
