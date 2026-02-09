import { memo } from 'react';
import { useStore } from '@/stores';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Fuel } from '@/components/icons';

export const FuelPanel = memo(function FuelPanel() {
  const fuel = useStore((s) => s.systems.fuel);

  const getColor = (level: number) => {
    if (level < 20) return 'red';
    if (level < 40) return 'amber';
    return 'green';
  };

  const tanks = [
    { label: 'Лев. двиг. 1', data: { level: Math.round((fuel.engine0.level / fuel.engine0.capacity) * 100), capacity: 100 } },
    { label: 'Лев. двиг. 2', data: { level: Math.round((fuel.engine1.level / fuel.engine1.capacity) * 100), capacity: 100 } },
    { label: 'Прав. двиг. 1', data: { level: Math.round((fuel.engine2.level / fuel.engine2.capacity) * 100), capacity: 100 } },
    { label: 'Прав. двиг. 2', data: { level: Math.round((fuel.engine3.level / fuel.engine3.capacity) * 100), capacity: 100 } },
    { label: 'Дизель', data: { level: Math.round((fuel.diesel.level / fuel.diesel.capacity) * 100), capacity: 100 } },
    { label: 'Вода', data: { level: Math.round((fuel.water.level / fuel.water.capacity) * 100), capacity: 100 } },
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
              <span className="text-yacht-primary">{tank.data.level}%</span>
            </div>
            <ProgressBar
              value={tank.data.level}
              color={getColor(tank.data.level)}
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
