import { memo } from 'react';
import { useStore } from '@/stores';
import { EngineCard } from './EngineCard';

interface EnginesPanelProps {
  side?: 'left' | 'right';
}

export const EnginesPanel = memo(function EnginesPanel({ side }: EnginesPanelProps) {
  const engines = useStore((s) => s.engines);

  // If side is specified, render only that engine
  if (side === 'left') {
    return <EngineCard id="left" data={engines.left} />;
  }

  if (side === 'right') {
    return <EngineCard id="right" data={engines.right} />;
  }

  // Default: render both engines
  return (
    <div className="flex items-center justify-center gap-8">
      <EngineCard id="left" data={engines.left} />
      <EngineCard id="right" data={engines.right} />
    </div>
  );
});
