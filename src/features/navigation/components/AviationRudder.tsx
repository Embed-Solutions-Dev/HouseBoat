import { memo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/stores';

export const AviationRudder = memo(function AviationRudder() {
  const rawRudderAngle = useStore((s) => s.navigation.rudderAngle);
  // Clamp rudder angle to valid range
  const rudderAngle = Math.max(-45, Math.min(45, rawRudderAngle));

  // Tick marks configuration: -45 to +45 degrees
  const majorTicks = [-45, -30, -15, 0, 15, 30, 45];
  const minorTicks = [-40, -35, -25, -20, -10, -5, 5, 10, 20, 25, 35, 40];

  // Convert rudder angle to horizontal position
  // Range: -45 to +45 maps to 0% to 100% of scale width
  const scaleWidth = 750; // Increased to match wider rudder
  const getPositionFromAngle = (angle: number) => {
    return ((angle + 45) / 90) * scaleWidth;
  };

  return (
    <div
      style={{
        width: 804, // Same as compass
        height: 50, // Same as compass
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Scale container */}
      <div
        style={{
          position: 'relative',
          width: scaleWidth,
          height: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          margin: '0 auto',
          paddingTop: 3,
        }}
      >
        {/* Horizontal scale line */}
        <div
          style={{
            position: 'absolute',
            top: 18,
            left: 0,
            width: '100%',
            height: 2,
            background: 'rgba(120,140,160,0.4)',
          }}
        />

        {/* Major tick marks */}
        {majorTicks.map((angle) => {
          const position = getPositionFromAngle(angle);
          const isCenter = angle === 0;

          return (
            <div
              key={`major-${angle}`}
              style={{
                position: 'absolute',
                top: 0,
                left: position,
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Tick mark */}
              <div
                style={{
                  width: isCenter ? 3 : 2,
                  height: isCenter ? 24 : 18,
                  background: isCenter
                    ? '#e04050'
                    : 'rgba(200,210,230,0.8)',
                  borderRadius: 1,
                  boxShadow: isCenter ? '0 0 6px rgba(224,64,80,0.6)' : 'none',
                }}
              />
            </div>
          );
        })}

        {/* Minor tick marks */}
        {minorTicks.map((angle) => {
          const position = getPositionFromAngle(angle);

          return (
            <div
              key={`minor-${angle}`}
              style={{
                position: 'absolute',
                top: 6,
                left: position,
                transform: 'translateX(-50%)',
                width: 1,
                height: 12,
                background: 'rgba(120,140,160,0.4)',
                borderRadius: 0.5,
              }}
            />
          );
        })}

        {/* Moving pointer/needle */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10,
          }}
          animate={{
            left: getPositionFromAngle(rudderAngle),
          }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 18,
          }}
        >
          {/* Pointer arrow */}
          <svg width="16" height="32" viewBox="0 0 16 32" style={{ filter: 'drop-shadow(0 0 6px rgba(224,64,80,0.7))' }}>
            <defs>
              <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ff6070" />
                <stop offset="50%" stopColor="#e04050" />
                <stop offset="100%" stopColor="#c03040" />
              </linearGradient>
            </defs>
            <path
              d="M 8 2 L 3 10 L 6 10 L 6 30 L 10 30 L 10 10 L 13 10 Z"
              fill="url(#pointerGradient)"
              stroke="#ff6070"
              strokeWidth="0.5"
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
});
