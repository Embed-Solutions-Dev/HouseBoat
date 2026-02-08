import { memo, useCallback } from 'react';
import { useStore } from '@/stores';
import { Tachometer } from './Tachometer';
import type { EngineCardProps } from '../types';

export const EngineCard = memo(function EngineCard({ id, data, size = 310 }: EngineCardProps) {
  const fuel = useStore((s) => s.systems.fuel);
  const fuelMapping = useStore((s) => s.fuelMapping);
  const toggleExpandedEngine = useStore((s) => s.toggleExpandedEngine);
  const expandedEngine = useStore((s) => s.expandedEngine);

  // Get fuel tank ID from mapping
  const fuelTankId = fuelMapping[id];

  // Get fuel level for this engine's tank
  const fuelLevel = (() => {
    const tank = fuel[fuelTankId as keyof typeof fuel];
    if (!tank || typeof tank !== 'object' || !('level' in tank)) {
      console.warn(`Fuel tank "${fuelTankId}" not found for engine ${id}`);
      return 0;
    }
    return Math.round((tank.level / tank.capacity) * 100);
  })();

  // Generate temp text from engine data
  const tempText = `${data.temperature}°C · ${data.oilPressure} бар`;

  const handleToggleExpand = useCallback(() => {
    toggleExpandedEngine(id);
  }, [id, toggleExpandedEngine]);

  const isExpanded = expandedEngine === id;

  return (
    <Tachometer
      side={`Engine ${id + 1}` as 'Left' | 'Right'} // Temp compatibility
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
      size={size}
    />
  );
});
