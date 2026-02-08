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
    // Special case for 4 engines: group left (0,1) and right (2,3)
    if (engineCount === 4) {
      const leftEngines = engines.slice(0, 2);
      const rightEngines = engines.slice(2, 4);

      return (
        <div className="flex items-center justify-center gap-20">
          {/* Left group - unified instrument with shared housing */}
          <div
            className="flex"
            style={{
              gap: 0,
              padding: '12px',
              borderRadius: '24px',
              background: 'linear-gradient(165deg, #e8e8e8 0%, #b8b8b8 15%, #909090 30%, #707070 50%, #909090 70%, #b8b8b8 85%, #a0a0a0 100%)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.8)',
            }}
          >
            {leftEngines.map((engine, index) => (
              <EngineCard
                key={index}
                id={index}
                data={engine}
                size={layout.tachometerSize}
              />
            ))}
          </div>

          {/* Right group - unified instrument with shared housing */}
          <div
            className="flex"
            style={{
              gap: 0,
              padding: '12px',
              borderRadius: '24px',
              background: 'linear-gradient(165deg, #e8e8e8 0%, #b8b8b8 15%, #909090 30%, #707070 50%, #909090 70%, #b8b8b8 85%, #a0a0a0 100%)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.8)',
            }}
          >
            {rightEngines.map((engine, index) => (
              <EngineCard
                key={index + 2}
                id={index + 2}
                data={engine}
                size={layout.tachometerSize}
              />
            ))}
          </div>
        </div>
      );
    }

    // Default uniform grid for 2-3 engines
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
