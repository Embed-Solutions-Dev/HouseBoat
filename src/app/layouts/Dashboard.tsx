import { memo } from 'react';
import { motion } from 'framer-motion';
import { CamerasPanel } from '@/features/cameras';
import { EnginesPanel } from '@/features/engines';
import { NavigationOverlay, AviationCompass, AviationRudder } from '@/features/navigation';
import { ControlsPanel } from '@/features/controls';
import { TopBar } from '@/components/TopBar';
import { useStore } from '@/stores';

export const Dashboard = memo(function Dashboard() {
  const navMode = useStore((s) => s.controls.navigation);

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
