import { memo } from 'react';
import { motion } from 'framer-motion';
import { CamerasPanel } from '@/features/cameras';
import { EnginesPanel } from '@/features/engines';
import { NavigationOverlay, CompassWidget, RudderWidget, SpeedWidget } from '@/features/navigation';
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
      {/* Cameras - 2x2 grid */}
      <div className="w-full max-w-[1048px] mb-4">
        <CamerasPanel />
      </div>

      {/* Top metrics bar */}
      <div className="w-full max-w-[1048px] mb-4">
        <TopBar />
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

          {/* Center Navigation Widgets */}
          <div
            style={{
              height: 340,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingTop: 16,
            }}
          >
            {/* Compass and Rudder side by side */}
            <div style={{ display: 'flex', gap: 30, marginBottom: 16 }}>
              <CompassWidget />
              <RudderWidget />
            </div>
            {/* Speed pill below */}
            <SpeedWidget />
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
      </div>

      {/* Controls */}
      <div className="w-full max-w-[1048px]">
        <ControlsPanel />
      </div>
    </motion.div>
  );
});
