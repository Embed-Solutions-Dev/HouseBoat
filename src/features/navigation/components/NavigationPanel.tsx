import { memo } from 'react';
import { useStore } from '@/stores';
import { Card } from '@/components/ui/Card';
import { Compass } from './Compass';
import { RudderGauge } from './RudderGauge';
import { SpeedDisplay } from './SpeedDisplay';
import { HeadingDisplay } from './HeadingDisplay';

export const NavigationPanel = memo(function NavigationPanel() {
  const navigation = useStore((s) => s.navigation);

  return (
    <Card className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-yacht-primary">Навигация</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        {/* Speed and Heading */}
        <div className="flex gap-12">
          <SpeedDisplay speed={navigation.speed} />
          <HeadingDisplay heading={navigation.heading} />
        </div>

        {/* Compass */}
        <Compass heading={navigation.heading} size={150} />

        {/* Rudder */}
        <div className="w-full max-w-xs">
          <RudderGauge angle={navigation.rudderAngle} />
        </div>

        {/* Coordinates */}
        <div className="text-center text-sm text-yacht-secondary">
          <div>{navigation.position.lat.toFixed(4)}°N</div>
          <div>{navigation.position.lng.toFixed(4)}°E</div>
        </div>
      </div>
    </Card>
  );
});
