import { memo, useCallback } from 'react';
import { useStore } from '@/stores';
import { Tachometer } from './Tachometer';
import type { EngineCardProps } from '../types';

export const EngineCard = memo(function EngineCard({ id, data }: EngineCardProps) {
  const fuel = useStore((s) => s.systems.fuel);
  const toggleExpandedEngine = useStore((s) => s.toggleExpandedEngine);
  const expandedEngine = useStore((s) => s.expandedEngine);

  // Get fuel level for this engine's tank
  const fuelLevel = id === 'left'
    ? Math.round((fuel.gasolineLeft.level / fuel.gasolineLeft.capacity) * 100)
    : Math.round((fuel.gasolineRight.level / fuel.gasolineRight.capacity) * 100);

  // Generate temp text from engine data
  const tempText = `${data.temperature}°C · ${data.oilPressure} бар`;

  const handleToggleExpand = useCallback(() => {
    toggleExpandedEngine(id === 'left' ? 'Left' : 'Right');
  }, [id, toggleExpandedEngine]);

  const isExpanded = expandedEngine === (id === 'left' ? 'Left' : 'Right');

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
      onToggleExpand={handleToggleExpand}
      isExpanded={isExpanded}
      temperature={data.temperature}
      oilPressure={data.oilPressure}
    />
  );
});
