import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CamerasPanel } from '@/features/cameras';
import { EnginesPanel, MiniEngineCard } from '@/features/engines';
import { NavigationOverlay, CompassWidget, RudderWidget } from '@/features/navigation';
import { ControlsPanel } from '@/features/controls';
import { TopBar } from '@/components/TopBar';
import { useStore } from '@/stores';

export const Dashboard = memo(function Dashboard() {
  const navMode = useStore((s) => s.controls.navigation);
  const leftEngine = useStore((s) => s.engines.left);
  const rightEngine = useStore((s) => s.engines.right);
  const fuel = useStore((s) => s.systems.fuel);

  const leftFuelLevel = Math.round((fuel.tank1.level / fuel.tank1.capacity) * 100);
  const rightFuelLevel = Math.round((fuel.tank2.level / fuel.tank2.capacity) * 100);

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
      <div className="w-full max-w-[1048px] mb-4">
        <CamerasPanel />
      </div>

      {/* Top metrics bar */}
      <div className="w-full max-w-[1048px] mb-4 relative" style={{ zIndex: 60 }}>
        <TopBar />

        {/* Compass - flies to top left in nav mode */}
        <motion.div
          animate={{
            x: navMode ? -456 : 0,
            y: navMode ? 100 : 0,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            marginLeft: -67,
            zIndex: 70,
            pointerEvents: 'none',
          }}
        >
          <div style={{ transform: 'translateY(calc(100% + 4px))', pointerEvents: 'auto' }}>
            <CompassWidget />
          </div>
        </motion.div>

        {/* Rudder - flies to top right in nav mode */}
        <motion.div
          animate={{
            x: navMode ? 456 : 0,
            y: navMode ? 100 : 0,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            marginLeft: -67,
            zIndex: 70,
            pointerEvents: 'none',
          }}
        >
          <div style={{ transform: 'translateY(calc(100% + 193px))', pointerEvents: 'auto' }}>
            <RudderWidget />
          </div>
        </motion.div>
      </div>

      {/* Engines with Navigation overlay */}
      <div className="w-full max-w-[1048px] mb-4 relative">
        {/* Navigation map overlay - behind engines */}
        <NavigationOverlay />

        {/* Engines - three columns: left tach, nav widgets, right tach */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 8,
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Left Engine */}
          <motion.div
            animate={{
              opacity: navMode ? 0 : 1,
              scale: navMode ? 0.5 : 1,
              x: navMode ? -170 : 0,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            style={{
              marginRight: -50,
              paddingTop: 16,
              pointerEvents: navMode ? 'none' : 'auto',
            }}
          >
            <EnginesPanel side="left" />
          </motion.div>

          {/* Center - Logo only (compass and rudder moved to absolute positioning) */}
          <div
            style={{
              height: 340,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 40,
              position: 'relative',
              overflow: 'visible',
            }}
          >
            {/* Houseboat logo */}
            <motion.div
              animate={{ opacity: navMode ? 0 : 0.6 }}
              transition={{ duration: 0.3 }}
              style={{ marginTop: 12 }}
            >
              <svg width="75" height="48" viewBox="600 -100 1620 750">
                <path
                  fill="#2a3a4a"
                  d="M1798.09 319.87c-4.35,-12.65 -31.56,-22.61 -26.42,-5.52 2.53,29.43 7.74,74.72 -23.19,131.9 -34.39,29.27 5.18,34.93 43.53,16.19 64.03,-24.99 12.21,-119.88 6.08,-142.57zm-498.41 -195.06l0 0 -0.42 0 0 54.51 47.15 0c-0.78,-30.15 -21.5,-54.51 -46.73,-54.51zm-17.11 0.05l0 0c-24.28,1.3 -43.89,25.15 -44.65,54.46l44.65 0 0 -54.46zm-44.67 74.57l0 0 0 51 44.67 0 0 -51 -44.67 0zm61.36 51l0 0 47.17 0 0 -51 -47.17 0 0 51zm488.43 -118.7l0 0c-75.64,39.65 -105.96,79.31 -167.43,107.06 -14.5,6.53 -30.65,12.67 -48.33,18.34l0 -102.15c0,-34.71 -28.38,-63.1 -63.09,-63.1 -34.71,0 -63.1,28.39 -63.1,63.1l0 130.53c-114.9,17.14 -260.31,19.42 -421.05,-2.18 209.11,99.93 576.41,33.58 705.24,-76.57 38.48,-32.89 101.67,-75.25 149.43,-91.4 151.13,-55.09 221.23,-5.03 260.55,84.96 -7.9,31.59 -71.1,31.12 -109.89,46.44 -109.8,30.41 -134.33,31.14 -244.26,11.66 -12.86,-0.26 -32.74,10.03 -27.17,24.4 10.58,216.03 -71.36,208.7 -255.45,232.26 -61.99,2.97 -1.08,-78.65 13.4,-87.72 46.13,-48.5 75.84,-52.86 86.21,-69.64 14.88,-26.72 3.03,-38.46 -31.76,-15.84 -142.22,60.11 -308.64,63.74 -496.17,18.12 -193.15,147.77 -382.49,16.88 -304.72,-13.59 67.62,-23.73 138.17,-42.34 211.83,-55.51l-26.05 -41.91c50.95,-25.54 95,-62.9 135.37,-106.56 212.3,-195.78 446.39,-180.44 696.44,-10.7z"
                />
              </svg>
            </motion.div>
          </div>

          {/* Right Engine */}
          <motion.div
            animate={{
              opacity: navMode ? 0 : 1,
              scale: navMode ? 0.5 : 1,
              x: navMode ? 170 : 0,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            style={{
              marginLeft: -50,
              paddingTop: 16,
              pointerEvents: navMode ? 'none' : 'auto',
            }}
          >
            <EnginesPanel side="right" />
          </motion.div>
        </div>

        {/* Mini engines in corners - appear in nav mode */}
        <AnimatePresence>
          {navMode && (
            <>
              {/* Left mini engine */}
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
                  rpm={leftEngine.rpm}
                  fuelLevel={leftFuelLevel}
                  hasFaults={leftEngine.errors.length > 0}
                />
              </motion.div>

              {/* Right mini engine */}
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
                  rpm={rightEngine.rpm}
                  fuelLevel={rightFuelLevel}
                  hasFaults={rightEngine.errors.length > 0}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="w-full max-w-[1048px]">
        <ControlsPanel />
      </div>
    </motion.div>
  );
});
