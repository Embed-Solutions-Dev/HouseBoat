import { memo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/stores';

export const AviationCompass = memo(function AviationCompass() {
  const heading = useStore((s) => s.navigation.heading);

  // Cardinal and intercardinal directions
  const directions = [
    { label: 'N', angle: 0 },
    { label: 'NE', angle: 45 },
    { label: 'E', angle: 90 },
    { label: 'SE', angle: 135 },
    { label: 'S', angle: 180 },
    { label: 'SW', angle: 225 },
    { label: 'W', angle: 270 },
    { label: 'NW', angle: 315 },
  ];

  return (
    <div
      style={{
        width: 240,
        height: 240,
        borderRadius: '50%',
        background: 'linear-gradient(165deg, #e8e8e8 0%, #b8b8b8 15%, #909090 30%, #707070 50%, #909090 70%, #b8b8b8 85%, #a0a0a0 100%)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.8)',
        padding: 6,
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
          overflow: 'hidden',
        }}
      >
        {/* Rotating compass rose */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transformOrigin: 'center center',
          }}
          animate={{ rotate: -heading }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        >
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            {/* Degree tick marks (every 5 degrees) */}
            {Array.from({ length: 72 }).map((_, i) => {
              const deg = i * 5;
              const angle = (deg * Math.PI) / 180;
              const isMajor = deg % 30 === 0;
              const isCardinal = deg % 90 === 0;
              const r1 = isCardinal ? 32 : isMajor ? 36 : 40;
              const r2 = 45;
              return (
                <line
                  key={i}
                  x1={50 + r1 * Math.sin(angle)}
                  y1={50 - r1 * Math.cos(angle)}
                  x2={50 + r2 * Math.sin(angle)}
                  y2={50 - r2 * Math.cos(angle)}
                  stroke={isCardinal ? 'rgba(220,230,240,0.9)' : isMajor ? 'rgba(180,200,220,0.7)' : 'rgba(120,140,160,0.4)'}
                  strokeWidth={isCardinal ? 2.5 : isMajor ? 1.8 : 1}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Cardinal and intercardinal labels */}
            {directions.map(({ label, angle }) => {
              const rad = (angle * Math.PI) / 180;
              const radius = 26;
              const x = 50 + radius * Math.sin(rad);
              const y = 50 - radius * Math.cos(rad);
              const isCardinal = angle % 90 === 0;

              return (
                <text
                  key={label}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isCardinal ? '#3dc88c' : 'rgba(200,210,230,0.8)'}
                  fontSize={isCardinal ? '10' : '7'}
                  fontWeight={isCardinal ? '700' : '600'}
                  fontFamily="system-ui, -apple-system, sans-serif"
                  style={{
                    textShadow: isCardinal ? '0 0 8px rgba(61,200,140,0.6)' : '0 0 4px rgba(0,0,0,0.8)',
                  }}
                >
                  {label}
                </text>
              );
            })}

            {/* Degree numbers (every 30 degrees) */}
            {Array.from({ length: 12 }).map((_, i) => {
              const deg = i * 30;
              const angle = (deg * Math.PI) / 180;
              const radius = 15;
              const x = 50 + radius * Math.sin(angle);
              const y = 50 - radius * Math.cos(angle);

              return (
                <text
                  key={`deg-${deg}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgba(150,170,190,0.6)"
                  fontSize="5"
                  fontWeight="500"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {deg.toString().padStart(3, '0')}
                </text>
              );
            })}
          </svg>
        </motion.div>

        {/* Fixed triangle pointer at top */}
        <svg
          viewBox="0 0 100 100"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          <path
            d="M 50 8 L 46 14 L 54 14 Z"
            fill="#e04050"
            stroke="#ff6070"
            strokeWidth="0.5"
            style={{
              filter: 'drop-shadow(0 0 4px rgba(224,64,80,0.8))',
            }}
          />
        </svg>

        {/* Digital heading display in center */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(10,15,25,0.9)',
            border: '1px solid rgba(80,110,140,0.4)',
            borderRadius: 6,
            padding: '4px 10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#3dc88c',
              textShadow: '0 0 8px rgba(61,200,140,0.6)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '0.05em',
            }}
          >
            {Math.round(heading).toString().padStart(3, '0')}°
          </div>
        </div>

        {/* Center hub */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #d0d0d0 30%, #909090 70%, #606060 100%)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
            zIndex: 10,
            marginTop: 22,
          }}
        />
      </div>
    </div>
  );
});
