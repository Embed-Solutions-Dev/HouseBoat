import { memo } from 'react';
import { useStore } from '@/stores';
import { EngineCard } from './EngineCard';
import { getEnginesLayout } from '@/utils/engineLayout';

export const EnginesPanel = memo(function EnginesPanel({ screenMode = 'S1' }: { screenMode?: 'S1' | 'S2' | 'S3' }) {
  const engines = useStore((s) => s.engines);
  const engineCount = useStore((s) => s.engineCount);
  const expandedEngine = useStore((s) => s.expandedEngine);

  // Get layout configuration based on engine count
  const layout = getEnginesLayout(engineCount);

  // For single row layout (2-4 engines)
  if (layout.rows === 1) {
    // Special case for 4 engines: group left (0,1) and right (2,3)
    if (engineCount === 4) {
      const leftEngines = engines.slice(0, 2);
      const rightEngines = engines.slice(2, 4);

      return (
        <div className="flex items-center justify-center gap-1" style={{ maxWidth: '100%', overflow: 'visible', transform: 'scale(0.9)' }}>
          {/* Left group - with depth effect */}
          <div className="flex items-center" style={{ gap: 1, position: 'relative', marginRight: -65 }}>
            {leftEngines.map((engine, index) => {
              const engineId = index;
              const isExpanded = expandedEngine === engineId;
              return (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    zIndex: isExpanded ? 100 : (index === 0 ? 2 : 1),
                    transform: index === 1 ? 'scale(0.92) translateX(-30px) translateY(10px)' : 'none',
                    opacity: index === 1 ? 0.95 : 1,
                  }}
                >
                  <EngineCard
                    id={engineId}
                    data={engine}
                    screenMode={screenMode}
                    size={index === 1 ? layout.tachometerSize * 0.97 : layout.tachometerSize * 1.05}
                  />
                </div>
              );
            })}
          </div>

          {/* Right group - mirrored depth effect */}
          <div className="flex items-center" style={{ gap: 1, position: 'relative', marginLeft: -65 }}>
            {rightEngines.map((engine, index) => {
              const engineId = index + 2;
              const isExpanded = expandedEngine === engineId;
              // Engine 3 (index 1) in front with z:2, Engine 2 (index 0) behind with z:1
              const baseZIndex = index === 1 ? 2 : 1;
              const zIndex = isExpanded ? 100 : baseZIndex;
              return (
                <div
                  key={index + 2}
                  style={{
                    position: 'relative',
                    zIndex,
                    transform: index === 0 ? 'scale(0.92) translateX(30px) translateY(10px)' : 'none', // Engine 2 behind
                    opacity: index === 0 ? 0.95 : 1,
                    pointerEvents: 'auto',
                  }}
                >
                  <EngineCard
                    id={engineId}
                    data={engine}
                    screenMode={screenMode}
                    size={index === 0 ? layout.tachometerSize * 0.97 : layout.tachometerSize * 1.05}
                  />
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Default uniform grid for 2-3 engines
    // Special handling for 2 engines with equal spacing from edges and logo
    if (engineCount === 2) {
      return (
        <div className="flex items-center justify-between w-full" style={{ padding: '0 35px' }}>
          <EngineCard id={0} data={engines[0]} size={layout.tachometerSize} screenMode={screenMode} />
          <EngineCard id={1} data={engines[1]} size={layout.tachometerSize} screenMode={screenMode} />
        </div>
      );
    }

    // For 3 engines, use grid without logo
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
            screenMode={screenMode}
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
            screenMode={screenMode}
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
            screenMode={screenMode}
          />
        ))}
      </div>
    </div>
  );
});
