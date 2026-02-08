import { memo } from 'react';
import { useStore } from '@/stores';
import { EngineCard } from './EngineCard';
import { getEnginesLayout } from '@/utils/engineLayout';

export const EnginesPanel = memo(function EnginesPanel() {
  const engines = useStore((s) => s.engines);
  const engineCount = useStore((s) => s.engineCount);

  // Get layout configuration based on engine count
  const layout = getEnginesLayout(engineCount);

  // For single row layout (2-4 engines)
  if (layout.rows === 1) {
    return (
      <div
        className="grid gap-6 items-center justify-center"
        style={{
          gridTemplateColumns: `repeat(${layout.topRow}, 1fr)`,
        }}
      >
        {engines.map((engine, index) => (
          <EngineCard
            key={index}
            id={index}
            data={engine}
            size={layout.tachometerSize}
          />
        ))}
      </div>
    );
  }

  // For two-row layout (5-6 engines)
  const topEngines = engines.slice(0, layout.topRow);
  const bottomEngines = engines.slice(layout.topRow);

  return (
    <div className="flex flex-col gap-6 items-center justify-center">
      {/* Top row */}
      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: `repeat(${layout.topRow}, 1fr)`,
        }}
      >
        {topEngines.map((engine, index) => (
          <EngineCard
            key={index}
            id={index}
            data={engine}
            size={layout.tachometerSize}
          />
        ))}
      </div>

      {/* Bottom row */}
      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: `repeat(${layout.bottomRow}, 1fr)`,
        }}
      >
        {bottomEngines.map((engine, index) => (
          <EngineCard
            key={index + layout.topRow}
            id={index + layout.topRow}
            data={engine}
            size={layout.tachometerSize}
          />
        ))}
      </div>
    </div>
  );
});
