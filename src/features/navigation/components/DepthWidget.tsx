import { memo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const DepthWidget = memo(function DepthWidget({ screenMode = 'S1' }: { screenMode?: 'S1' | 'S2' | 'S3' }) {
  // Depth history for sonar chart
  const [depthHistory, setDepthHistory] = useState<number[]>(() => {
    const initial: number[] = [];
    let depth = 8.5;
    for (let i = 0; i < 40; i++) {
      depth += (Math.random() - 0.5) * 0.8;
      depth = Math.max(2, Math.min(15, depth));
      initial.push(depth);
    }
    return initial;
  });

  // Update depth periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setDepthHistory((prev) => {
        const lastDepth = prev[prev.length - 1];
        const newDepth = Math.max(2, Math.min(15, lastDepth + (Math.random() - 0.5) * 0.6));
        return [...prev.slice(1), newDepth];
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const currentDepth = depthHistory[depthHistory.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        position: 'absolute',
        top: 110,
        left: 'calc(50% + 85px)',
        width: 138,
        height: 76,
        borderRadius: 16,
        background: screenMode === 'S3' ? 'linear-gradient(145deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,1) 100%)' : 'linear-gradient(145deg, rgba(15,22,35,0.97) 0%, rgba(8,12,22,0.98) 50%, rgba(5,8,15,1) 100%)',
        boxShadow: screenMode === 'S3' ? '0 4px 16px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.5)' : '0 8px 24px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 1px rgba(100,140,200,0.1)',
        border: screenMode === 'S3' ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(80,100,130,0.2)',
        overflow: 'hidden',
        zIndex: 3,
      }}
    >
      {/* Inner shadow */}
      <div
        style={{
          position: 'absolute',
          inset: 3,
          borderRadius: 13,
          boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.6)',
          pointerEvents: 'none',
        }}
      />

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 6,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 8,
          color: screenMode === 'S3' ? 'rgba(60,80,110,0.7)' : 'rgba(150,180,210,0.6)',
          letterSpacing: 1,
        }}
      >
        ГЛУБИНА
      </div>

      {/* Current depth */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 8,
          display: 'flex',
          alignItems: 'baseline',
          gap: 2,
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: screenMode === 'S2' ? '#ffffff' : screenMode === 'S3' ? '#3070b0' : '#50a0ff',
            textShadow: screenMode === 'S2' ? '0 0 15px rgba(255,255,255,0.5)' : screenMode === 'S3' ? '0 0 10px rgba(48,112,176,0.3)' : '0 0 15px rgba(80,160,255,0.5)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {currentDepth.toFixed(1)}
        </span>
        <span style={{ fontSize: 10, color: screenMode === 'S2' ? 'rgba(255,255,255,0.7)' : screenMode === 'S3' ? 'rgba(48,112,176,0.7)' : 'rgba(80,160,255,0.6)' }}>м</span>
      </div>

      {/* Depth chart */}
      <div
        style={{
          position: 'absolute',
          bottom: 6,
          left: 6,
          right: 6,
          height: 28,
          borderRadius: 6,
          background: screenMode === 'S3' ? 'rgba(220,230,240,0.4)' : 'rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
      >
        <svg width="126" height="28" viewBox="0 0 126 28" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="depthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={screenMode === 'S3' ? 'rgba(48,112,176,0.3)' : 'rgba(80,160,255,0.4)'} />
              <stop offset="100%" stopColor={screenMode === 'S3' ? 'rgba(30,80,150,0.1)' : 'rgba(40,100,180,0.1)'} />
            </linearGradient>
          </defs>
          {/* Filled area */}
          <path
            d={`M 0 ${((depthHistory[0] - 2) / 13) * 28} ${depthHistory
              .map((d, i) => `L ${(i / (depthHistory.length - 1)) * 126} ${((d - 2) / 13) * 28}`)
              .join(' ')} L 126 28 L 0 28 Z`}
            fill="url(#depthGradient)"
          />
          {/* Line */}
          <path
            d={`M 0 ${((depthHistory[0] - 2) / 13) * 28} ${depthHistory
              .map((d, i) => `L ${(i / (depthHistory.length - 1)) * 126} ${((d - 2) / 13) * 28}`)
              .join(' ')}`}
            fill="none"
            stroke={screenMode === 'S3' ? 'rgba(48,112,176,0.7)' : 'rgba(80,160,255,0.8)'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 0 3px rgba(80,160,255,0.6))' }}
          />
        </svg>
      </div>
    </motion.div>
  );
});
