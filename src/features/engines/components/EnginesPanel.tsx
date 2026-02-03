import { memo } from 'react';
import { useStore } from '@/stores';
import { EngineCard } from './EngineCard';

export const EnginesPanel = memo(function EnginesPanel() {
  const engines = useStore((s) => s.engines);

  return (
    <div className="flex items-center justify-center gap-8">
      <EngineCard id="left" data={engines.left} label="Левый" />
      <EngineCard id="right" data={engines.right} label="Правый" />
    </div>
  );
});
