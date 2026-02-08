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
        <div className="flex items-center justify-center gap-8">
          {/* Left group - with depth effect */}
          <div className="flex items-center" style={{ gap: 1, position: 'relative' }}>
            {leftEngines.map((engine, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  zIndex: index === 0 ? 2 : 1,
                  transform: index === 1 ? 'scale(0.92) translateX(-30px) translateY(10px)' : 'none',
                  opacity: index === 1 ? 0.95 : 1,
                }}
              >
                <EngineCard
                  id={index}
                  data={engine}
                  size={index === 1 ? layout.tachometerSize * 1.012 : layout.tachometerSize * 1.1}
                />
              </div>
            ))}
          </div>

          {/* Right group - mirrored depth effect */}
          <div className="flex items-center" style={{ gap: 1, position: 'relative' }}>
            {rightEngines.map((engine, index) => (
              <div
                key={index + 2}
                style={{
                  position: 'relative',
                  zIndex: index === 1 ? 2 : 1, // Engine 3 in front
                  transform: index === 0 ? 'scale(0.92) translateX(30px) translateY(10px)' : 'none', // Engine 2 behind
                  opacity: index === 0 ? 0.95 : 1,
                }}
              >
                <EngineCard
                  id={index + 2}
                  data={engine}
                  size={index === 0 ? layout.tachometerSize * 1.012 : layout.tachometerSize * 1.1}
                />
              </div>
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
