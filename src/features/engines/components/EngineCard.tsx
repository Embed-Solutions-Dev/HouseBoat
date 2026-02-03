import { memo } from 'react';
import { useStore } from '@/stores';
import { Tachometer } from './Tachometer';
import type { EngineCardProps } from '../types';

export const EngineCard = memo(function EngineCard({ id, data, onToggleExpand }: EngineCardProps) {
  const fuel = useStore((s) => s.systems.fuel);

  // Get fuel level for this engine's tank
  const fuelLevel = id === 'left'
    ? Math.round((fuel.tank1.level / fuel.tank1.capacity) * 100)
    : Math.round((fuel.tank2.level / fuel.tank2.capacity) * 100);

  // Generate temp text from engine data
  const tempText = `${data.temperature}°C · ${data.oilPressure} бар`;

  return (
    <Tachometer
      side={id === 'left' ? 'Left' : 'Right'}
      rpm={data.rpm}
      maxRpm={data.maxRpm}
      throttle={data.throttle}
      motorHours={data.hours}
      fuelLevel={fuelLevel}
      tempText={tempText}
      hasFaults={data.errors.length > 0}
      onToggleExpand={onToggleExpand}
    />
  );
});
