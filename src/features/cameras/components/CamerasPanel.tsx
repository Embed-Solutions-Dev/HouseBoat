import { memo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/stores';
import { CameraFeed } from './CameraFeed';
import type { CameraId } from '@/types';

const cameraOrder: CameraId[] = ['bow', 'starboard', 'stern', 'port'];

export const CamerasPanel = memo(function CamerasPanel() {
  const { feeds } = useStore((s) => s.cameras);
  const [expandedCamera, setExpandedCamera] = useState<number | null>(null);

  return (
    <div className="relative">
      {/* 2x2 Grid - hidden when camera is expanded */}
      <motion.div
        animate={{ opacity: expandedCamera !== null ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        className="grid grid-cols-2 gap-3"
        style={{ pointerEvents: expandedCamera !== null ? 'none' : 'auto' }}
      >
        {cameraOrder.map((id, idx) => (
          <CameraFeed
            key={id}
            feed={feeds[id]}
            selected={false}
            onClick={() => setExpandedCamera(idx)}
          />
        ))}
      </motion.div>

      {/* Expanded camera - overlay */}
      <AnimatePresence>
        {expandedCamera !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0"
            style={{ zIndex: 10 }}
          >
            <CameraFeed
              feed={feeds[cameraOrder[expandedCamera]]}
              selected={false}
              onClick={() => setExpandedCamera(null)}
              isExpanded
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
