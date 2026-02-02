import { memo } from 'react';
import { useStore } from '@/stores';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Battery } from '@/components/icons';

export const ElectricalPanel = memo(function ElectricalPanel() {
  const electrical = useStore((s) => s.systems.electrical);

  const getBatteryColor = (pct: number) => {
    if (pct < 20) return 'red';
    if (pct < 40) return 'amber';
    return 'green';
  };

  return (
    <Card className="p-3">
      <div className="flex items-center gap-2 mb-3">
        <Battery className="w-4 h-4 text-yacht-secondary" />
        <span className="text-sm font-medium text-yacht-primary">Электрика</span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-yacht-secondary">Батарея</span>
            <span className="text-yacht-primary">{electrical.batteryPercent}%</span>
          </div>
          <ProgressBar
            value={electrical.batteryPercent}
            color={getBatteryColor(electrical.batteryPercent)}
            size="sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-yacht-secondary">Напряжение</span>
            <div className="text-yacht-primary font-medium">{electrical.voltage.toFixed(1)}V</div>
          </div>
          <div>
            <span className="text-yacht-secondary">Ток</span>
            <div className="text-yacht-primary font-medium">{electrical.current}A</div>
          </div>
        </div>
      </div>
    </Card>
  );
});
