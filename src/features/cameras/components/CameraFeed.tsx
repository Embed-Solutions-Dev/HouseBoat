import { memo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { CameraFeedProps } from '../types';

export const CameraFeed = memo(function CameraFeed({
  feed,
  onClick,
  selected,
  isExpanded = false,
  isEnlarged = false,
}: CameraFeedProps & { isExpanded?: boolean; isEnlarged?: boolean }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Determine size mode: fullscreen > enlarged > normal
  const isLarge = isExpanded || isEnlarged;

  return (
    <div
      onPointerDown={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      style={{
        background: 'linear-gradient(180deg, rgba(12,18,28,0.95) 0%, rgba(6,10,18,0.98) 100%)',
        borderRadius: isExpanded ? 24 : isEnlarged ? 20 : 16,
        border: selected
          ? '2px solid rgba(61,200,140,0.6)'
          : '1px solid rgba(60,80,100,0.2)',
        boxShadow: isExpanded
          ? '0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(100,130,160,0.08)'
          : isEnlarged
            ? '0 8px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(100,130,160,0.08)'
            : '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(100,130,160,0.08)',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        height: (isExpanded || isEnlarged) ? '100%' : 'auto',
        aspectRatio: (isExpanded || isEnlarged) ? undefined : '16/10',
        touchAction: 'manipulation',
      }}
    >
      {/* Video simulation */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(20,30,45,1) 0%, rgba(15,22,35,1) 100%)',
          pointerEvents: 'none',
        }}
      >
        {/* Water horizon */}
        <div
          style={{
            position: 'absolute',
            top: '45%',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(25,40,60,0.8) 0%, rgba(15,25,40,0.9) 100%)',
          }}
        />

        {/* Animated waves */}
        <motion.div
          animate={{ x: [0, -30, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: isLarge ? 3 : 2,
            background: 'rgba(60,100,140,0.3)',
            filter: 'blur(1px)',
          }}
        />
        <motion.div
          animate={{ x: [0, 20, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{
            position: 'absolute',
            top: '60%',
            left: 0,
            right: 0,
            height: isLarge ? 2 : 1,
            background: 'rgba(60,100,140,0.25)',
            filter: 'blur(1px)',
          }}
        />
        <motion.div
          animate={{ x: [0, -15, 0], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{
            position: 'absolute',
            top: '70%',
            left: 0,
            right: 0,
            height: isLarge ? 2 : 1,
            background: 'rgba(60,100,140,0.2)',
            filter: 'blur(1px)',
          }}
        />

        {/* Water reflections */}
        <motion.div
          animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '55%',
            left: '30%',
            width: isLarge ? 80 : 40,
            height: isLarge ? 16 : 8,
            background: 'radial-gradient(ellipse, rgba(100,150,200,0.3) 0%, transparent 70%)',
            filter: 'blur(2px)',
          }}
        />
        <motion.div
          animate={{ opacity: [0.05, 0.2, 0.05], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          style={{
            position: 'absolute',
            top: '65%',
            left: '60%',
            width: isLarge ? 60 : 30,
            height: isLarge ? 12 : 6,
            background: 'radial-gradient(ellipse, rgba(100,150,200,0.25) 0%, transparent 70%)',
            filter: 'blur(2px)',
          }}
        />

        {/* Noise effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* REC indicator */}
      <div
        style={{
          position: 'absolute',
          top: isLarge ? 16 : 8,
          left: isLarge ? 20 : 10,
          display: 'flex',
          alignItems: 'center',
          gap: isLarge ? 10 : 6,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: isLarge ? 10 : 6,
            height: isLarge ? 10 : 6,
            borderRadius: '50%',
            background: '#e53935',
            boxShadow: '0 0 8px rgba(229,57,53,0.8)',
          }}
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: '#e53935',
            }}
          />
        </div>
        <span
          style={{
            fontSize: isLarge ? 14 : 9,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.7)',
            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            letterSpacing: '0.5px',
          }}
        >
          REC
        </span>
      </div>

      {/* Camera label */}
      <div
        style={{
          position: 'absolute',
          bottom: isLarge ? 16 : 8,
          left: isLarge ? 20 : 10,
          fontSize: isLarge ? 16 : 10,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.6)',
          textShadow: '0 1px 3px rgba(0,0,0,0.9)',
          letterSpacing: '0.5px',
          pointerEvents: 'none',
        }}
      >
        {feed.label}
      </div>

      {/* Timestamp */}
      <div
        style={{
          position: 'absolute',
          bottom: isLarge ? 16 : 8,
          right: isLarge ? 20 : 10,
          fontSize: isLarge ? 14 : 9,
          fontFamily: 'monospace',
          color: 'rgba(255,255,255,0.5)',
          textShadow: '0 1px 3px rgba(0,0,0,0.9)',
          pointerEvents: 'none',
        }}
      >
        {time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>

      {/* Focus frame */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isLarge ? 120 : 50,
          height: isLarge ? 120 : 50,
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 2,
          pointerEvents: 'none',
        }}
      >
        <div style={{ position: 'absolute', top: -1, left: -1, width: isLarge ? 16 : 8, height: isLarge ? 16 : 8, borderTop: '2px solid rgba(255,255,255,0.4)', borderLeft: '2px solid rgba(255,255,255,0.4)' }} />
        <div style={{ position: 'absolute', top: -1, right: -1, width: isLarge ? 16 : 8, height: isLarge ? 16 : 8, borderTop: '2px solid rgba(255,255,255,0.4)', borderRight: '2px solid rgba(255,255,255,0.4)' }} />
        <div style={{ position: 'absolute', bottom: -1, left: -1, width: isLarge ? 16 : 8, height: isLarge ? 16 : 8, borderBottom: '2px solid rgba(255,255,255,0.4)', borderLeft: '2px solid rgba(255,255,255,0.4)' }} />
        <div style={{ position: 'absolute', bottom: -1, right: -1, width: isLarge ? 16 : 8, height: isLarge ? 16 : 8, borderBottom: '2px solid rgba(255,255,255,0.4)', borderRight: '2px solid rgba(255,255,255,0.4)' }} />
      </div>
    </div>
  );
});
