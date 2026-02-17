import { memo } from 'react';
import { useStore } from '@/stores';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Fuel } from '@/components/icons';
import { ENGINE_CONFIG, ENGINE_LABELS } from '@/config/constants';

export const FuelPanel = memo(function FuelPanel() {
  const fuel = useStore((s) => s.systems.fuel);

  const getColor = (level: number) => {
    if (level < 20) return 'red';
    if (level < 40) return 'amber';
    return 'green';
  };

  const getTankLevel = (key: string) => {
    const tank = fuel[key as keyof typeof fuel];
    if (!tank || typeof tank !== 'object' || !('level' in tank) || !('capacity' in tank)) return 0;
    return Math.round((tank.level / tank.capacity) * 100);
  };

  // Engine tanks based on actual engine count
  const engineTanks = Array.from({ length: ENGINE_CONFIG.count }, (_, i) => ({
    label: ENGINE_LABELS[i] || `Двигатель ${i + 1}`,
    level: getTankLevel(`engine${i}`),
  }));

  const tanks = [
    ...engineTanks,
    { label: 'Дизель', level: getTankLevel('diesel') },
    { label: 'Вода', level: getTankLevel('water') },
  ];

  return (
    <Card className="p-3">
      <div className="flex items-center gap-2 mb-3">
        <Fuel className="w-4 h-4 text-yacht-secondary" />
        <span className="text-sm font-medium text-yacht-primary">Топливо</span>
      </div>

      <div className="space-y-2">
        {tanks.map((tank, i) => (
          <div key={i}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-yacht-secondary">{tank.label}</span>
              <span className="text-yacht-primary">{tank.level}%</span>
            </div>
            <ProgressBar
              value={tank.level}
              color={getColor(tank.level)}
              size="sm"
            />
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-yacht-border">
        <div className="flex justify-between text-xs">
          <span className="text-yacht-secondary">Расход</span>
          <span className="text-yacht-primary">{fuel.consumption} л/ч</span>
        </div>
      </div>
    </Card>
  );
});
