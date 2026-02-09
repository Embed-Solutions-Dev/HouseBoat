import { memo } from 'react';
import { useStore } from '@/stores';
import { EngineCard } from './EngineCard';
import { getEnginesLayout } from '@/utils/engineLayout';

export const EnginesPanel = memo(function EnginesPanel() {
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
          <div className="flex items-center" style={{ gap: 1, position: 'relative', marginRight: -15 }}>
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
                    size={index === 1 ? layout.tachometerSize * 0.97 : layout.tachometerSize * 1.05}
                  />
                </div>
              );
            })}
          </div>

          {/* Center - Houseboat Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.6,
              marginTop: -180,
            }}
          >
            <svg width="112" height="72" viewBox="600 -100 1620 750">
              <path
                fill="#2a3a4a"
                d="M1798.09 319.87c-4.35,-12.65 -31.56,-22.61 -26.42,-5.52 2.53,29.43 7.74,74.72 -23.19,131.9 -34.39,29.27 5.18,34.93 43.53,16.19 64.03,-24.99 12.21,-119.88 6.08,-142.57zm-498.41 -195.06l0 0 -0.42 0 0 54.51 47.15 0c-0.78,-30.15 -21.5,-54.51 -46.73,-54.51zm-17.11 0.05l0 0c-24.28,1.3 -43.89,25.15 -44.65,54.46l44.65 0 0 -54.46zm-44.67 74.57l0 0 0 51 44.67 0 0 -51 -44.67 0zm61.36 51l0 0 47.17 0 0 -51 -47.17 0 0 51zm488.43 -118.7l0 0c-75.64,39.65 -105.96,79.31 -167.43,107.06 -14.5,6.53 -30.65,12.67 -48.33,18.34l0 -102.15c0,-34.71 -28.38,-63.1 -63.09,-63.1 -34.71,0 -63.1,28.39 -63.1,63.1l0 130.53c-114.9,17.14 -260.31,19.42 -421.05,-2.18 209.11,99.93 576.41,33.58 705.24,-76.57 38.48,-32.89 101.67,-75.25 149.43,-91.4 151.13,-55.09 221.23,-5.03 260.55,84.96 -7.9,31.59 -71.1,31.12 -109.89,46.44 -109.8,30.41 -134.33,31.14 -244.26,11.66 -12.86,-0.26 -32.74,10.03 -27.17,24.4 10.58,216.03 -71.36,208.7 -255.45,232.26 -61.99,2.97 -1.08,-78.65 13.4,-87.72 46.13,-48.5 75.84,-52.86 86.21,-69.64 14.88,-26.72 3.03,-38.46 -31.76,-15.84 -142.22,60.11 -308.64,63.74 -496.17,18.12 -193.15,147.77 -382.49,16.88 -304.72,-13.59 67.62,-23.73 138.17,-42.34 211.83,-55.51l-26.05 -41.91c50.95,-25.54 95,-62.9 135.37,-106.56 212.3,-195.78 446.39,-180.44 696.44,-10.7z"
              />
            </svg>
          </div>

          {/* Right group - mirrored depth effect */}
          <div className="flex items-center" style={{ gap: 1, position: 'relative', marginLeft: -15 }}>
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
    // Special handling for 2 engines with logo in center
    if (engineCount === 2) {
      return (
        <div className="flex items-center justify-center gap-8">
          <EngineCard id={0} data={engines[0]} size={layout.tachometerSize} />

          {/* Center - Houseboat Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.6,
              marginTop: -180,
            }}
          >
            <svg width="112" height="72" viewBox="600 -100 1620 750">
              <path
                fill="#2a3a4a"
                d="M1798.09 319.87c-4.35,-12.65 -31.56,-22.61 -26.42,-5.52 2.53,29.43 7.74,74.72 -23.19,131.9 -34.39,29.27 5.18,34.93 43.53,16.19 64.03,-24.99 12.21,-119.88 6.08,-142.57zm-498.41 -195.06l0 0 -0.42 0 0 54.51 47.15 0c-0.78,-30.15 -21.5,-54.51 -46.73,-54.51zm-17.11 0.05l0 0c-24.28,1.3 -43.89,25.15 -44.65,54.46l44.65 0 0 -54.46zm-44.67 74.57l0 0 0 51 44.67 0 0 -51 -44.67 0zm61.36 51l0 0 47.17 0 0 -51 -47.17 0 0 51zm488.43 -118.7l0 0c-75.64,39.65 -105.96,79.31 -167.43,107.06 -14.5,6.53 -30.65,12.67 -48.33,18.34l0 -102.15c0,-34.71 -28.38,-63.1 -63.09,-63.1 -34.71,0 -63.1,28.39 -63.1,63.1l0 130.53c-114.9,17.14 -260.31,19.42 -421.05,-2.18 209.11,99.93 576.41,33.58 705.24,-76.57 38.48,-32.89 101.67,-75.25 149.43,-91.4 151.13,-55.09 221.23,-5.03 260.55,84.96 -7.9,31.59 -71.1,31.12 -109.89,46.44 -109.8,30.41 -134.33,31.14 -244.26,11.66 -12.86,-0.26 -32.74,10.03 -27.17,24.4 10.58,216.03 -71.36,208.7 -255.45,232.26 -61.99,2.97 -1.08,-78.65 13.4,-87.72 46.13,-48.5 75.84,-52.86 86.21,-69.64 14.88,-26.72 3.03,-38.46 -31.76,-15.84 -142.22,60.11 -308.64,63.74 -496.17,18.12 -193.15,147.77 -382.49,16.88 -304.72,-13.59 67.62,-23.73 138.17,-42.34 211.83,-55.51l-26.05 -41.91c50.95,-25.54 95,-62.9 135.37,-106.56 212.3,-195.78 446.39,-180.44 696.44,-10.7z"
              />
            </svg>
          </div>

          <EngineCard id={1} data={engines[1]} size={layout.tachometerSize} />
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
