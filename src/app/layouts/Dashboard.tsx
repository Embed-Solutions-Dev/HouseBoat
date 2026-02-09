import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CamerasPanel } from '@/features/cameras';
import { EnginesPanel, MiniEngineCard } from '@/features/engines';
import { NavigationOverlay, AviationCompass, AviationRudder } from '@/features/navigation';
import { ControlsPanel } from '@/features/controls';
import { TopBar } from '@/components/TopBar';
import { useStore } from '@/stores';
import { ENGINE_LABELS } from '@/config/constants';

export const Dashboard = memo(function Dashboard() {
  const navMode = useStore((s) => s.controls.navigation);
  const engines = useStore((s) => s.engines);
  const fuel = useStore((s) => s.systems.fuel);
  const fuelMapping = useStore((s) => s.fuelMapping);

  // Helper to get fuel level for engine
  const getFuelLevel = (engineIndex: number): number => {
    const tankName = fuelMapping[engineIndex] as keyof typeof fuel;
    if (!tankName || tankName === 'consumption') return 0;
    const tank = fuel[tankName];
    if (!tank || typeof tank !== 'object' || !('level' in tank) || !('capacity' in tank)) return 0;
    return Math.round((tank.level / tank.capacity) * 100);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #0f1a25 0%, #080d12 50%, #000 100%)',
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Cameras - 2x2 grid */}
      <div className="w-full max-w-[1048px] mb-5">
        <CamerasPanel />
      </div>

      {/* Top metrics bar */}
      <div className="w-full max-w-[1048px] mb-5">
        <TopBar />
      </div>

      {/* Aviation Compass - Above Engines */}
      <div className="w-full max-w-[1048px] mb-6 flex justify-center">
        <AviationCompass />
      </div>

      {/* Engines with Navigation overlay */}
      <div className="w-full max-w-[1400px] mb-6 relative">
        {/* Navigation map overlay - behind engines */}
        <NavigationOverlay />

        {/* Engines panel - handles all engines with dynamic layout */}
        <motion.div
          animate={{
            opacity: navMode ? 0 : 1,
            scale: navMode ? 0.95 : 1,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          style={{
            paddingTop: 16,
            pointerEvents: navMode ? 'none' : 'auto',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <EnginesPanel />
        </motion.div>

        {/* Mini engines in corners - appear in nav mode */}
        <AnimatePresence>
          {navMode && (
            <>
              {/* Left engines - stacked vertically */}
              <motion.div
                initial={{ opacity: 0, x: -100, y: 100 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: -100, y: 100 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                style={{
                  position: 'absolute',
                  bottom: -10,
                  left: 179,
                  zIndex: 50,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  transform: 'scale(0.9)',
                }}
              >
                {/* Engine 0 - Левый двигатель 1 */}
                <MiniEngineCard
                  key="engine-0"
                  side={ENGINE_LABELS[0] || 'Двигатель 1'}
                  rpm={engines[0]?.rpm || 0}
                  fuelLevel={getFuelLevel(0)}
                  hasFaults={engines[0]?.errors.length > 0}
                />
                {/* Engine 1 - Левый двигатель 2 */}
                <MiniEngineCard
                  key="engine-1"
                  side={ENGINE_LABELS[1] || 'Двигатель 2'}
                  rpm={engines[1]?.rpm || 0}
                  fuelLevel={getFuelLevel(1)}
                  hasFaults={engines[1]?.errors.length > 0}
                />
              </motion.div>

              {/* Right engines - stacked vertically */}
              <motion.div
                initial={{ opacity: 0, x: 100, y: 100 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 100, y: 100 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                style={{
                  position: 'absolute',
                  bottom: -10,
                  right: 179,
                  zIndex: 50,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  transform: 'scale(0.9)',
                }}
              >
                {/* Engine 2 - Правый двигатель 1 */}
                <MiniEngineCard
                  key="engine-2"
                  side={ENGINE_LABELS[2] || 'Двигатель 3'}
                  rpm={engines[2]?.rpm || 0}
                  fuelLevel={getFuelLevel(2)}
                  hasFaults={engines[2]?.errors.length > 0}
                />
                {/* Engine 3 - Правый двигатель 2 - OFF */}
                <MiniEngineCard
                  key="engine-3"
                  side={ENGINE_LABELS[3] || 'Двигатель 4'}
                  rpm={0}
                  fuelLevel={0}
                  hasFaults={false}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Aviation Rudder with Scale and Coordinates - Below Engines */}
      <div className="w-full max-w-[1048px] flex justify-center items-center" style={{ marginBottom: 1, position: 'relative' }}>
        <AnimatePresence>
          {navMode && (
            <>
              {/* Scale - left of rudder */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                style={{ position: 'absolute', left: 16 }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div
                    style={{
                      width: 80,
                      height: 4,
                      background: 'rgba(150,180,210,0.6)',
                      borderRadius: 2,
                      position: 'relative',
                    }}
                  >
                    <div style={{ position: 'absolute', left: 0, top: -2, width: 2, height: 8, background: 'rgba(150,180,210,0.6)' }} />
                    <div style={{ position: 'absolute', right: 0, top: -2, width: 2, height: 8, background: 'rgba(150,180,210,0.6)' }} />
                  </div>
                  <span style={{ fontSize: 9, color: 'rgba(150,180,210,0.7)', fontWeight: 500 }}>500 м</span>
                </div>
              </motion.div>

              {/* Coordinates - right of rudder */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                style={{ position: 'absolute', right: 16, textAlign: 'right' }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontFamily: 'monospace',
                    color: 'rgba(150,180,210,0.7)',
                    fontWeight: 500,
                    lineHeight: 1.4,
                  }}
                >
                  <div>52°22&apos;14.3&quot;N</div>
                  <div>4°53&apos;28.7&quot;E</div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AviationRudder />
      </div>

      {/* Controls */}
      <div className="w-full max-w-[1048px] mb-4">
        <ControlsPanel />
      </div>
    </motion.div>
  );
});
