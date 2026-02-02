import { memo } from 'react';
import { motion } from 'framer-motion';
import { TopBar } from '@/components/TopBar';
import { BottomBar } from '@/components/BottomBar';
import { NavigationPanel } from '@/features/navigation';
import { EnginesPanel } from '@/features/engines';
import { CamerasPanel } from '@/features/cameras';

export const Dashboard = memo(function Dashboard() {
  return (
    <motion.div
      className="h-screen p-4 flex flex-col gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Top Bar */}
      <TopBar />

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Left - Cameras */}
        <div className="col-span-3">
          <CamerasPanel />
        </div>

        {/* Center - Navigation */}
        <div className="col-span-6">
          <NavigationPanel />
        </div>

        {/* Right - Engines */}
        <div className="col-span-3">
          <EnginesPanel />
        </div>
      </div>

      {/* Bottom Bar */}
      <BottomBar />
    </motion.div>
  );
});
