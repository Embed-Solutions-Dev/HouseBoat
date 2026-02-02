import { memo } from 'react';
import { useStore } from '@/stores';
import { Card } from '@/components/ui/Card';
import { Thermometer, Wind, Waves } from '@/components/icons';

export const WeatherPanel = memo(function WeatherPanel() {
  const weather = useStore((s) => s.systems.weather);

  return (
    <Card className="p-3">
      <div className="flex items-center gap-2 mb-3">
        <Waves className="w-4 h-4 text-yacht-secondary" />
        <span className="text-sm font-medium text-yacht-primary">Погода</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Thermometer className="w-3 h-3 text-yacht-secondary" />
          <div>
            <div className="text-yacht-secondary">Вода</div>
            <div className="text-yacht-primary font-medium">{weather.waterTemp}°C</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Thermometer className="w-3 h-3 text-yacht-secondary" />
          <div>
            <div className="text-yacht-secondary">Воздух</div>
            <div className="text-yacht-primary font-medium">{weather.airTemp}°C</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Wind className="w-3 h-3 text-yacht-secondary" />
          <div>
            <div className="text-yacht-secondary">Ветер</div>
            <div className="text-yacht-primary font-medium">{weather.windSpeed} м/с</div>
          </div>
        </div>

        <div>
          <div className="text-yacht-secondary">Давление</div>
          <div className="text-yacht-primary font-medium">{weather.pressure} гПа</div>
        </div>
      </div>
    </Card>
  );
});
