import { memo } from 'react';
import { FuelPanel } from '@/features/fuel';
import { ElectricalPanel } from '@/features/electrical';
import { WeatherPanel } from '@/features/weather';
import { ControlsPanel } from '@/features/controls';

export const BottomBar = memo(function BottomBar() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <FuelPanel />
      <ElectricalPanel />
      <WeatherPanel />
      <ControlsPanel />
    </div>
  );
});
