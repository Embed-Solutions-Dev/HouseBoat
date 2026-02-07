import { memo, useState, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/stores';
import { CameraFeed } from './CameraFeed';
import type { CameraId } from '@/types';

const cameraOrder: CameraId[] = ['bow', 'starboard', 'stern', 'port'];

export const CamerasPanel = memo(function CamerasPanel() {
  const { feeds } = useStore((s) => s.cameras);
  const [selectedCamera, setSelectedCamera] = useState<number | null>(null);
  const [fullscreenCamera, setFullscreenCamera] = useState<number | null>(null);
  const lastClickTime = useRef<number>(0);
  const clickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCameraClick = useCallback((idx: number) => {
    const now = Date.now();
    const timeDiff = now - lastClickTime.current;

    // Clear any pending single-click timeout
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
    }

    if (timeDiff < 300) {
      // Double click - go fullscreen
      lastClickTime.current = 0;
      setFullscreenCamera(idx);
    } else {
      // Potential single click - wait to see if it's a double click
      lastClickTime.current = now;
      clickTimeout.current = setTimeout(() => {
        // Single click - toggle selection
        setSelectedCamera((prev) => (prev === idx ? null : idx));
        clickTimeout.current = null;
      }, 300);
    }
  }, []);

  const handleFullscreenClick = useCallback(() => {
    setFullscreenCamera(null);
  }, []);

  // Calculate container aspect ratio based on 2x2 grid with 16/10 cameras + gap
  // 2 columns of 16/10 cameras = total aspect ratio approximately 32/10 for width, 20/10 for height
  // With gap, roughly 8/5 aspect ratio for the container

  const selectedId = selectedCamera !== null ? cameraOrder[selectedCamera] : null;
  const otherCameras = selectedCamera !== null
    ? cameraOrder.map((id, idx) => ({ id, idx })).filter(({ idx }) => idx !== selectedCamera)
    : [];

  return (
    <div
      style={{
        position: 'relative',
        // Fixed aspect ratio container to prevent size changes
        aspectRatio: '2.1 / 1',
        width: '100%',
      }}
    >
      {/* Normal 2x2 grid view */}
      <AnimatePresence mode="wait">
        {selectedCamera === null && fullscreenCamera === null && (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              gap: 12,
            }}
          >
            {cameraOrder.map((id, idx) => (
              <CameraFeed
                key={id}
                feed={feeds[id]}
                selected={false}
                onClick={() => handleCameraClick(idx)}
                isEnlarged
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected camera view - one large, three small */}
      <AnimatePresence mode="wait">
        {selectedCamera !== null && fullscreenCamera === null && selectedId && (
          <motion.div
            key="selected"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gridTemplateRows: 'repeat(3, 1fr)',
              gap: 8,
            }}
          >
            {/* Large selected camera - spans all 3 rows */}
            <div style={{ gridRow: '1 / 4' }}>
              <CameraFeed
                feed={feeds[selectedId]}
                selected={true}
                onClick={() => handleCameraClick(selectedCamera)}
                isEnlarged
              />
            </div>

            {/* Small cameras - one per row */}
            {otherCameras.map(({ id, idx }) => (
              <CameraFeed
                key={id}
                feed={feeds[id]}
                selected={false}
                onClick={() => handleCameraClick(idx)}
                isEnlarged
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded camera overlay - fills camera section only */}
      <AnimatePresence>
        {fullscreenCamera !== null && (
          <motion.div
            key="fullscreen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
            }}
          >
            <CameraFeed
              feed={feeds[cameraOrder[fullscreenCamera]]}
              selected={false}
              onClick={handleFullscreenClick}
              isExpanded
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
