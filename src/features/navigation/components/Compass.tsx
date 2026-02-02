import { memo } from 'react';
import { motion } from 'framer-motion';
import type { CompassProps } from '../types';

export const Compass = memo(function Compass({ heading, size = 135 }: CompassProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(165deg, #e8e8e8 0%, #b8b8b8 15%, #909090 30%, #707070 50%, #909090 70%, #b8b8b8 85%, #a0a0a0 100%)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        padding: 5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'linear-gradient(145deg, rgba(10,15,25,0.98) 0%, rgba(5,8,15,1) 100%)',
          position: 'relative',
        }}
      >
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          animate={{ rotate: -heading }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {Array.from({ length: 36 }).map((_, i) => {
              const angle = (i * 10 * Math.PI) / 180;
              const isMajor = i % 9 === 0;
              const r1 = isMajor ? 38 : 42;
              const r2 = 48;
              return (
                <line
                  key={i}
                  x1={50 + r1 * Math.sin(angle)}
                  y1={50 - r1 * Math.cos(angle)}
                  x2={50 + r2 * Math.sin(angle)}
                  y2={50 - r2 * Math.cos(angle)}
                  stroke={isMajor ? 'rgba(200,210,230,0.8)' : 'rgba(150,160,180,0.4)'}
                  strokeWidth={isMajor ? 2 : 1}
                />
              );
            })}
            <text x="50" y="20" fill="rgba(200,210,230,0.6)" fontSize="9" fontWeight="500" textAnchor="middle" dominantBaseline="middle">С</text>
            <text x="50" y="80" fill="rgba(200,210,230,0.6)" fontSize="9" fontWeight="500" textAnchor="middle" dominantBaseline="middle" transform="rotate(180 50 80)">Ю</text>
            <text x="80" y="50" fill="rgba(200,210,230,0.6)" fontSize="9" fontWeight="500" textAnchor="middle" dominantBaseline="middle" transform="rotate(90 80 50)">В</text>
            <text x="20" y="50" fill="rgba(200,210,230,0.6)" fontSize="9" fontWeight="500" textAnchor="middle" dominantBaseline="middle" transform="rotate(-90 20 50)">З</text>
          </svg>
        </motion.div>
        {/* Red marker at top */}
        <div
          style={{
            position: 'absolute',
            top: -18,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
            borderTop: '11px solid #d44050',
            filter: 'drop-shadow(0 0 4px rgba(212,64,80,0.6))',
          }}
        />
      </div>
    </div>
  );
});
