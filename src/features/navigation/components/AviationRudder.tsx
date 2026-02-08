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
  const scaleWidth = 260;
  const getPositionFromAngle = (angle: number) => {
    return ((angle + 45) / 90) * scaleWidth;
  };

  return (
    <div
      style={{
        width: 300,
        height: 90,
        borderRadius: 8,
        background: 'linear-gradient(165deg, #e8e8e8 0%, #b8b8b8 15%, #909090 30%, #707070 50%, #909090 70%, #b8b8b8 85%, #a0a0a0 100%)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.8)',
        padding: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 6,
          background: 'linear-gradient(145deg, rgba(10,15,25,0.98) 0%, rgba(5,8,15,1) 100%)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 0',
        }}
      >
        {/* Scale container */}
        <div
          style={{
            position: 'relative',
            width: scaleWidth,
            height: 40,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          {/* Horizontal scale line */}
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: 0,
              width: '100%',
              height: 2,
              background: 'rgba(120,140,160,0.4)',
            }}
          />

          {/* Major tick marks with labels */}
          {majorTicks.map((angle) => {
            const position = getPositionFromAngle(angle);
            const isCenter = angle === 0;

            return (
              <div
                key={`major-${angle}`}
                style={{
                  position: 'absolute',
                  bottom: 0,
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
                    height: isCenter ? 20 : 14,
                    background: isCenter
                      ? '#e04050'
                      : 'rgba(200,210,230,0.8)',
                    borderRadius: 1,
                    boxShadow: isCenter ? '0 0 6px rgba(224,64,80,0.6)' : 'none',
                  }}
                />
                {/* Label */}
                <div
                  style={{
                    marginTop: 3,
                    fontSize: 9,
                    fontWeight: isCenter ? 700 : 600,
                    color: isCenter ? '#e04050' : 'rgba(150,170,190,0.7)',
                    textShadow: isCenter ? '0 0 4px rgba(224,64,80,0.4)' : 'none',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  {angle > 0 ? `+${angle}` : angle}°
                </div>
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
                  bottom: 12,
                  left: position,
                  transform: 'translateX(-50%)',
                  width: 1,
                  height: 8,
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
              bottom: 0,
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
            <svg width="16" height="28" viewBox="0 0 16 28" style={{ filter: 'drop-shadow(0 0 6px rgba(224,64,80,0.7))' }}>
              <defs>
                <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ff6070" />
                  <stop offset="50%" stopColor="#e04050" />
                  <stop offset="100%" stopColor="#c03040" />
                </linearGradient>
              </defs>
              <path
                d="M 8 2 L 3 10 L 6 10 L 6 26 L 10 26 L 10 10 L 13 10 Z"
                fill="url(#pointerGradient)"
                stroke="#ff6070"
                strokeWidth="0.5"
              />
            </svg>
          </motion.div>
        </div>

        {/* Digital angle display */}
        <div
          style={{
            marginTop: 6,
            background: 'rgba(10,15,25,0.9)',
            border: '1px solid rgba(80,110,140,0.4)',
            borderRadius: 6,
            padding: '4px 14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
          }}
        >
          <motion.div
            key={Math.round(rudderAngle)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#3dc88c',
              textShadow: '0 0 8px rgba(61,200,140,0.6)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '0.05em',
            }}
          >
            {rudderAngle >= 0 ? '+' : ''}{Math.round(rudderAngle)}°
          </motion.div>
        </div>
      </div>
    </div>
  );
});
