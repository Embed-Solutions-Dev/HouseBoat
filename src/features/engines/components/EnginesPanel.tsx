import { memo } from 'react';
import { useStore } from '@/stores';
import { Card } from '@/components/ui/Card';
import { EngineCard } from './EngineCard';

export const EnginesPanel = memo(function EnginesPanel() {
  const engines = useStore((s) => s.engines);

  return (
    <Card className="h-full flex flex-col">
      <h2 className="text-lg font-semibold text-yacht-primary mb-4">Двигатели</h2>

      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <EngineCard id="left" data={engines.left} label="Левый" />
        <EngineCard id="right" data={engines.right} label="Правый" />
      </div>
    </Card>
  );
});
