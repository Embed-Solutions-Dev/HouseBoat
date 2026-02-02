import { memo } from 'react';
import { useStore } from '@/stores';
import { Card } from '@/components/ui/Card';
import { Battery, Fuel, Wifi, WifiOff } from '@/components/icons';

export const TopBar = memo(function TopBar() {
  const electrical = useStore((s) => s.systems.electrical);
  const fuel = useStore((s) => s.systems.fuel);
  const navigation = useStore((s) => s.navigation);
  const connection = useStore((s) => s.connection);

  const avgFuel = Math.round(
    (fuel.tank1.level + fuel.tank2.level + fuel.tank3.level) / 3
  );

  return (
    <Card className="px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left - Battery */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yacht-card-light flex items-center justify-center">
            <Battery className="w-5 h-5 text-yacht-green" />
          </div>
          <div>
            <div className="text-lg font-semibold text-yacht-primary">
              {electrical.voltage.toFixed(1)}V
            </div>
            <div className="text-xs text-yacht-muted">{electrical.batteryPercent}%</div>
          </div>
        </div>

        {/* Center - Speed & Heading */}
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-yacht-primary">
              {navigation.speed.toFixed(1)}
            </div>
            <div className="text-xs text-yacht-secondary">узлов</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yacht-primary">
              {Math.round(navigation.heading)}°
            </div>
            <div className="text-xs text-yacht-secondary">курс</div>
          </div>
        </div>

        {/* Right - Fuel & Connection */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yacht-card-light flex items-center justify-center">
              <Fuel className="w-5 h-5 text-yacht-green" />
            </div>
            <div>
              <div className="text-lg font-semibold text-yacht-primary">{avgFuel}%</div>
              <div className="text-xs text-yacht-muted">топливо</div>
            </div>
          </div>

          <div className="w-10 h-10 rounded-full bg-yacht-card-light flex items-center justify-center">
            {connection.status === 'connected' ? (
              <Wifi className="w-5 h-5 text-yacht-green" />
            ) : (
              <WifiOff className="w-5 h-5 text-yacht-red" />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
});
