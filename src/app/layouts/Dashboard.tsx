import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CamerasPanel } from '@/features/cameras';
import { EnginesPanel, MiniEngineCard } from '@/features/engines';
import { NavigationOverlay, AviationCompass, AviationRudder, AviationCompassV1, AviationRudderV1 } from '@/features/navigation';
import { ControlsPanel } from '@/features/controls';
import { TopBar } from '@/components/TopBar';
import { useStore } from '@/stores';
import { ENGINE_LABELS, ENGINE_CONFIG } from '@/config/constants';

export const Dashboard = memo(function Dashboard() {
  const [uiVersion, setUiVersion] = useState<'V1' | 'V2'>('V2');
  const [screenMode, setScreenMode] = useState<'S1' | 'S2' | 'S3'>('S1');
  const [isLocked, setIsLocked] = useState(false);
  const navMode = useStore((s) => s.controls.navigation);
  const engines = useStore((s) => s.engines);
  const fuel = useStore((s) => s.systems.fuel);
  const fuelMapping = useStore((s) => s.fuelMapping);
  const engineCount = ENGINE_CONFIG.count;

  // Helper to get fuel level for engine
  const getFuelLevel = (engineIndex: number): number => {
    const tankName = fuelMapping[engineIndex] as keyof typeof fuel;
    if (!tankName || tankName === 'consumption') return 0;
    const tank = fuel[tankName];
    if (!tank || typeof tank !== 'object' || !('level' in tank) || !('capacity' in tank)) return 0;
    return Math.round((tank.level / tank.capacity) * 100);
  };

  // Color scheme based on screen mode
  const bgStyle = screenMode === 'S2'
    ? { background: '#000000', padding: 5 }
    : screenMode === 'S3'
      ? { background: '#ffffff', padding: 5 }
      : { background: 'radial-gradient(ellipse at 50% 30%, #0f1a25 0%, #080d12 50%, #000 100%)', padding: 5 };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center"
      style={bgStyle}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Main content wrapper with lock prevention */}
      <div style={{ pointerEvents: isLocked ? 'none' : 'auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Cameras - 2x2 grid */}
        <div className="w-full max-w-[1070px]">
          <CamerasPanel screenMode={screenMode} />
        </div>

      {/* Top metrics bar */}
      <div className="w-full max-w-[1070px]" style={{ marginTop: 4 }}>
        <TopBar screenMode={screenMode} />
      </div>

      {/* Lock button - left aligned under TopBar, always clickable */}
      <div className="w-full max-w-[1070px]" style={{ marginTop: 6, display: 'flex', justifyContent: 'flex-start', pointerEvents: 'auto' }}>
        <button
          onClick={() => setIsLocked(!isLocked)}
          style={{
            padding: '8px',
            borderRadius: 10,
            border: screenMode === 'S2' ? '1px solid rgba(120,140,160,0.5)' : screenMode === 'S3' ? '1px solid rgba(0,0,0,0.30)' : '1px solid rgba(60,80,100,0.3)',
            background: isLocked
              ? (screenMode === 'S2' ? '#000000' : screenMode === 'S3' ? 'rgba(255,255,255,1)' : 'linear-gradient(180deg, rgba(12,18,28,0.95) 0%, rgba(6,10,18,0.98) 100%)')
              : (screenMode === 'S2' ? 'rgba(224,64,80,0.2)' : screenMode === 'S3' ? 'rgba(192,53,74,0.15)' : 'linear-gradient(145deg, rgba(224,64,80,0.15) 0%, rgba(180,40,60,0.1) 100%)'),
            boxShadow: screenMode === 'S3' ? '0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.5)' : '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(100,130,160,0.08)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            pointerEvents: 'auto',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isLocked ? '#e04050' : (screenMode === 'S2' ? '#ffffff' : screenMode === 'S3' ? '#1a1a2e' : '#7a95a8')} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {isLocked ? (
              <>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </>
            ) : (
              <>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Compass - centered, overlaps top of engines area */}
      <motion.div
        className="w-full max-w-[1070px] flex justify-center"
        style={{
          marginTop: 28,
          marginBottom: uiVersion === 'V1' ? 8 : -158,
          position: 'relative',
          zIndex: 1,
          visibility: navMode && uiVersion === 'V2' ? 'hidden' : 'visible',
        }}
        animate={{ opacity: navMode && uiVersion === 'V2' ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {uiVersion === 'V1' ? <AviationCompassV1 screenMode={screenMode} /> : <AviationCompass screenMode={screenMode} />}
      </motion.div>

      {/* Engines with Navigation overlay */}
      <div className="w-full max-w-[1070px] relative" style={{ zIndex: 2 }}>
        {/* Navigation map overlay - behind engines */}
        <NavigationOverlay screenMode={screenMode} />

        {/* Engines panel */}
        <motion.div
          animate={{
            opacity: navMode ? 0 : 1,
            scale: navMode ? 0.95 : 1,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          style={{
            pointerEvents: navMode ? 'none' : 'auto',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <EnginesPanel screenMode={screenMode} />
        </motion.div>

        {/* Houseboat Logo - centered over engines, hidden in nav mode */}
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
          animate={{ opacity: navMode ? 0 : 0.6 }}
          transition={{ duration: 0.3 }}
        >
          <svg width="112" height="72" viewBox="600 -100 1620 750">
            <path
              fill={screenMode === 'S2' ? '#2a3a4a' : screenMode === 'S3' ? '#1a1a2e' : '#2a3a4a'}
              d="M1798.09 319.87c-4.35,-12.65 -31.56,-22.61 -26.42,-5.52 2.53,29.43 7.74,74.72 -23.19,131.9 -34.39,29.27 5.18,34.93 43.53,16.19 64.03,-24.99 12.21,-119.88 6.08,-142.57zm-498.41 -195.06l0 0 -0.42 0 0 54.51 47.15 0c-0.78,-30.15 -21.5,-54.51 -46.73,-54.51zm-17.11 0.05l0 0c-24.28,1.3 -43.89,25.15 -44.65,54.46l44.65 0 0 -54.46zm-44.67 74.57l0 0 0 51 44.67 0 0 -51 -44.67 0zm61.36 51l0 0 47.17 0 0 -51 -47.17 0 0 51zm488.43 -118.7l0 0c-75.64,39.65 -105.96,79.31 -167.43,107.06 -14.5,6.53 -30.65,12.67 -48.33,18.34l0 -102.15c0,-34.71 -28.38,-63.1 -63.09,-63.1 -34.71,0 -63.1,28.39 -63.1,63.1l0 130.53c-114.9,17.14 -260.31,19.42 -421.05,-2.18 209.11,99.93 576.41,33.58 705.24,-76.57 38.48,-32.89 101.67,-75.25 149.43,-91.4 151.13,-55.09 221.23,-5.03 260.55,84.96 -7.9,31.59 -71.1,31.12 -109.89,46.44 -109.8,30.41 -134.33,31.14 -244.26,11.66 -12.86,-0.26 -32.74,10.03 -27.17,24.4 10.58,216.03 -71.36,208.7 -255.45,232.26 -61.99,2.97 -1.08,-78.65 13.4,-87.72 46.13,-48.5 75.84,-52.86 86.21,-69.64 14.88,-26.72 3.03,-38.46 -31.76,-15.84 -142.22,60.11 -308.64,63.74 -496.17,18.12 -193.15,147.77 -382.49,16.88 -304.72,-13.59 67.62,-23.73 138.17,-42.34 211.83,-55.51l-26.05 -41.91c50.95,-25.54 95,-62.9 135.37,-106.56 212.3,-195.78 446.39,-180.44 696.44,-10.7z"
            />
          </svg>
        </motion.div>

        {/* Nav mode instruments - compass, rudder, mini engines at corners */}
        <AnimatePresence>
          {navMode && (() => {
            const half = Math.ceil(engineCount / 2);
            const leftEngines = engines.slice(0, half);
            const rightEngines = engines.slice(half);
            return (
              <>
                {/* Compass - top left (V2 only) */}
                {uiVersion === 'V2' && (
                  <motion.div
                    initial={{ opacity: 0, x: -50, y: -50 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: -50, y: -50 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    style={{
                      position: 'absolute',
                      top: 15,
                      left: 15,
                      zIndex: 50,
                    }}
                  >
                    <div style={{ transform: 'scale(0.65)', transformOrigin: 'top left' }}>
                      <AviationCompass screenMode={screenMode} />
                    </div>
                  </motion.div>
                )}

                {/* Rudder - top right (V2 only) */}
                {uiVersion === 'V2' && (
                  <motion.div
                    initial={{ opacity: 0, x: 50, y: -50 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: 50, y: -50 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    style={{
                      position: 'absolute',
                      top: 15,
                      right: 15,
                      zIndex: 50,
                    }}
                  >
                    <div style={{ transform: 'scale(0.65)', transformOrigin: 'top right' }}>
                      <AviationRudder screenMode={screenMode} />
                    </div>
                  </motion.div>
                )}

                {/* Left engines - bottom left */}
                <motion.div
                  initial={{ opacity: 0, x: -50, y: 50 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: -50, y: 50 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  style={{
                    position: 'absolute',
                    bottom: -10,
                    left: 15,
                    zIndex: 50,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    transform: 'scale(0.9)',
                  }}
                >
                  {leftEngines.map((engine, i) => (
                    <MiniEngineCard
                      key={`engine-${i}`}
                      side={ENGINE_LABELS[i] || `Двигатель ${i + 1}`}
                      rpm={engine?.rpm || 0}
                      throttle={engine?.throttle || 0}
                      fuelLevel={getFuelLevel(i)}
                      hasFaults={engine?.errors.length > 0}
                      screenMode={screenMode}
                    />
                  ))}
                </motion.div>

                {/* Right engines - bottom right */}
                <motion.div
                  initial={{ opacity: 0, x: 50, y: 50 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: 50, y: 50 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  style={{
                    position: 'absolute',
                    bottom: -10,
                    right: 15,
                    zIndex: 50,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    transform: 'scale(0.9)',
                  }}
                >
                  {rightEngines.map((engine, i) => {
                    const idx = half + i;
                    return (
                      <MiniEngineCard
                        key={`engine-${idx}`}
                        side={ENGINE_LABELS[idx] || `Двигатель ${idx + 1}`}
                        rpm={engine?.rpm || 0}
                        throttle={engine?.throttle || 0}
                        fuelLevel={getFuelLevel(idx)}
                        hasFaults={engine?.errors.length > 0}
                        screenMode={screenMode}
                      />
                    );
                  })}
                </motion.div>
              </>
            );
          })()}
        </AnimatePresence>
      </div>

      {/* Rudder - centered, overlaps bottom of engines area */}
      <motion.div
        className="w-full max-w-[1070px] flex justify-center"
        style={{
          marginTop: uiVersion === 'V1' ? 53 : -158,
          marginBottom: uiVersion === 'V1' ? -37 : 28,
          position: 'relative',
          zIndex: 1,
          visibility: navMode && uiVersion === 'V2' ? 'hidden' : 'visible',
        }}
        animate={{ opacity: navMode && uiVersion === 'V2' ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {uiVersion === 'V1' ? <AviationRudderV1 screenMode={screenMode} /> : <AviationRudder screenMode={screenMode} />}
      </motion.div>

      {/* Version toggle - above power button */}
      <div className="w-full max-w-[1070px]" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, position: 'relative', zIndex: 3 }}>
        {/* UI Version (V1/V2) */}
        <div
          style={{
            display: 'flex',
            gap: 3,
            padding: 3,
            borderRadius: 10,
            border: screenMode === 'S2' ? '1px solid rgba(120,140,160,0.5)' : screenMode === 'S3' ? '1px solid rgba(0,0,0,0.30)' : '1px solid rgba(60,80,100,0.3)',
            background: screenMode === 'S2' ? '#000000' : screenMode === 'S3' ? 'rgba(255,255,255,1)' : 'linear-gradient(180deg, rgba(12,18,28,0.95) 0%, rgba(6,10,18,0.98) 100%)',
            boxShadow: screenMode === 'S3' ? '0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.5)' : '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(100,130,160,0.08)',
          }}
        >
          {(['V1', 'V2'] as const).map((v) => {
            const active = v === uiVersion;
            return (
              <button
                key={v}
                onClick={() => setUiVersion(v)}
                style={{
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  border: 'none',
                  borderRadius: 7,
                  cursor: 'pointer',
                  color: active ? (screenMode === 'S3' ? '#006838' : '#e8f4ff') : screenMode === 'S2' ? '#e8f4ff' : screenMode === 'S3' ? '#1a1a2e' : '#7a95a8',
                  background: active
                    ? (screenMode === 'S3' ? 'linear-gradient(145deg, rgba(0,104,56,0.25) 0%, rgba(0,80,40,0.18) 100%)' : 'linear-gradient(145deg, rgba(61,200,140,0.25) 0%, rgba(40,150,110,0.2) 100%)')
                    : 'transparent',
                  boxShadow: active ? (screenMode === 'S3' ? '0 0 12px rgba(0,104,56,0.4), inset 0 1px 0 rgba(0,104,56,0.2)' : '0 0 12px rgba(61,200,140,0.3), inset 0 1px 0 rgba(61,200,140,0.2)') : 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(60,80,100,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {v}
              </button>
            );
          })}
        </div>

        {/* Screen Mode (S1/S2/S3) */}
        <div
          style={{
            display: 'flex',
            gap: 3,
            padding: 3,
            borderRadius: 10,
            border: screenMode === 'S2' ? '1px solid rgba(120,140,160,0.5)' : screenMode === 'S3' ? '1px solid rgba(0,0,0,0.30)' : '1px solid rgba(60,80,100,0.3)',
            background: screenMode === 'S2' ? '#000000' : screenMode === 'S3' ? 'rgba(255,255,255,1)' : 'linear-gradient(180deg, rgba(12,18,28,0.95) 0%, rgba(6,10,18,0.98) 100%)',
            boxShadow: screenMode === 'S3' ? '0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.5)' : '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(100,130,160,0.08)',
          }}
        >
          {(['S1', 'S2', 'S3'] as const).map((s) => {
            const active = s === screenMode;
            return (
              <button
                key={s}
                onClick={() => setScreenMode(s)}
                style={{
                  padding: '4px 9px',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  border: 'none',
                  borderRadius: 7,
                  cursor: 'pointer',
                  color: active ? (screenMode === 'S3' ? '#006838' : '#e8f4ff') : screenMode === 'S2' ? '#e8f4ff' : screenMode === 'S3' ? '#1a1a2e' : '#7a95a8',
                  background: active
                    ? (screenMode === 'S3' ? 'linear-gradient(145deg, rgba(0,104,56,0.25) 0%, rgba(0,80,40,0.18) 100%)' : 'linear-gradient(145deg, rgba(61,200,140,0.25) 0%, rgba(40,150,110,0.2) 100%)')
                    : 'transparent',
                  boxShadow: active ? (screenMode === 'S3' ? '0 0 12px rgba(0,104,56,0.4), inset 0 1px 0 rgba(0,104,56,0.2)' : '0 0 12px rgba(61,200,140,0.3), inset 0 1px 0 rgba(61,200,140,0.2)') : 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(60,80,100,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

        {/* Controls */}
        <div className="w-full max-w-[1070px]">
          <ControlsPanel screenMode={screenMode} />
        </div>
      </div>
    </motion.div>
  );
});
