import { memo } from 'react';
import { motion } from 'framer-motion';
import { CamerasPanel } from '@/features/cameras';
import { EnginesPanel } from '@/features/engines';
import { NavigationOverlay } from '@/features/navigation';
import { ControlsPanel } from '@/features/controls';
import { TopBar } from '@/components/TopBar';

export const Dashboard = memo(function Dashboard() {
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

        {/* Engines - two tachometers side by side */}
        <EnginesPanel />
      </div>

      {/* Controls */}
      <div className="w-full max-w-[1048px]">
        <ControlsPanel />
      </div>
    </motion.div>
  );
});
