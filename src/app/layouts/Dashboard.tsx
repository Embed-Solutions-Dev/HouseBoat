import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CamerasPanel } from '@/features/cameras';
import { EnginesPanel, MiniEngineCard } from '@/features/engines';
import { NavigationOverlay, AviationCompass, AviationRudder } from '@/features/navigation';
import { ControlsPanel } from '@/features/controls';
import { TopBar } from '@/components/TopBar';
import { useStore } from '@/stores';
import type { FuelData } from '@/types';

export const Dashboard = memo(function Dashboard() {
  const navMode = useStore((s) => s.controls.navigation);
  const engines = useStore((s) => s.engines);
  const fuelMapping = useStore((s) => s.fuelMapping);
  const fuel = useStore((s) => s.systems.fuel);

  // Get fuel levels for first two engines (for mini cards in nav mode)
  const getEngineFuelLevel = (engineIndex: number): number => {
    const fuelTankId = fuelMapping[engineIndex] as keyof FuelData;
    const tank = fuel[fuelTankId];
    // Check if tank is a FuelTank object (not consumption which is a number)
    if (tank && typeof tank === 'object' && 'level' in tank && 'capacity' in tank) {
      return Math.round((tank.level / tank.capacity) * 100);
    }
    return 0;
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
      {/* Top metrics bar */}
      <div className="w-full max-w-[1048px] mb-4">
        <TopBar />
      </div>

      {/* Cameras - 2x2 grid */}
      <div className="w-full max-w-[1048px] mb-4">
        <CamerasPanel />
      </div>

      {/* Aviation Compass - Above Engines */}
      <div className="w-full max-w-[1048px] mb-4 flex justify-center">
        <AviationCompass />
      </div>

      {/* Engines */}
      <div className="w-full max-w-[1048px] mb-4 relative">
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
          }}
        >
          <EnginesPanel />
        </motion.div>

        {/* Mini engines in corners - appear in nav mode (first two engines only) */}
        <AnimatePresence>
          {navMode && engines.length >= 2 && (
            <>
              {/* Left mini engine (engine 0) */}
              <motion.div
                initial={{ opacity: 0, x: -100, y: 100 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: -100, y: 100 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                style={{
                  position: 'absolute',
                  bottom: 4,
                  left: 0,
                  zIndex: 50,
                }}
              >
                <MiniEngineCard
                  side="Left"
                  rpm={engines[0].rpm}
                  fuelLevel={getEngineFuelLevel(0)}
                  hasFaults={engines[0].errors.length > 0}
                />
              </motion.div>

              {/* Right mini engine (engine 1) */}
              <motion.div
                initial={{ opacity: 0, x: 100, y: 100 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 100, y: 100 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                style={{
                  position: 'absolute',
                  bottom: 4,
                  right: 0,
                  zIndex: 50,
                }}
              >
                <MiniEngineCard
                  side="Right"
                  rpm={engines[1].rpm}
                  fuelLevel={getEngineFuelLevel(1)}
                  hasFaults={engines[1].errors.length > 0}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Aviation Rudder - Below Engines */}
      <div className="w-full max-w-[1048px] mb-4 flex justify-center">
        <AviationRudder />
      </div>

      {/* Navigation Overlay */}
      <div className="w-full max-w-[1048px] mb-4">
        <NavigationOverlay />
      </div>

      {/* Controls */}
      <div className="w-full max-w-[1048px]">
        <ControlsPanel />
      </div>
    </motion.div>
  );
});
