import { memo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/stores';

export const AviationCompass = memo(function AviationCompass() {
  const heading = useStore((s) => s.navigation.heading);

  // Generate compass tape marks (0-360 degrees, repeating)
  const generateTapeMarks = () => {
    const marks = [];
    // Generate three full rotations for smooth scrolling
    for (let rotation = -1; rotation <= 1; rotation++) {
      for (let deg = 0; deg < 360; deg += 5) {
        const actualDeg = deg + rotation * 360;
        const isMajor = deg % 30 === 0;
        const isCardinal = deg % 90 === 0;

        marks.push({
          degree: actualDeg,
          displayDeg: deg,
          isMajor,
          isCardinal,
          label: deg === 0 ? 'N' : deg === 90 ? 'E' : deg === 180 ? 'S' : deg === 270 ? 'W' :
                 deg === 45 ? 'NE' : deg === 135 ? 'SE' : deg === 225 ? 'SW' : deg === 315 ? 'NW' : null,
        });
      }
    }
    return marks;
  };

  const marks = generateTapeMarks();

  // Calculate tape position (pixels per degree)
  const pixelsPerDegree = 3;
  const tapeOffset = -heading * pixelsPerDegree;

  return (
    <div
      style={{
        width: 450,
        height: 80,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
        {/* Moving compass tape */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            height: '100%',
            display: 'flex',
            alignItems: 'flex-end',
            paddingBottom: 8,
          }}
          animate={{ x: tapeOffset }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          {marks.map((mark, i) => {
            const x = mark.degree * pixelsPerDegree;

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x,
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                {/* Tick mark */}
                <div
                  style={{
                    width: mark.isCardinal ? 2.5 : mark.isMajor ? 2 : 1,
                    height: mark.isCardinal ? 24 : mark.isMajor ? 18 : 12,
                    background: mark.isCardinal
                      ? 'linear-gradient(180deg, rgba(220,230,240,0.9) 0%, rgba(180,200,220,0.6) 100%)'
                      : mark.isMajor
                      ? 'rgba(180,200,220,0.7)'
                      : 'rgba(120,140,160,0.4)',
                    borderRadius: 1,
                    boxShadow: mark.isCardinal ? '0 0 4px rgba(220,230,240,0.5)' : 'none',
                  }}
                />

                {/* Labels (only cardinal and intercardinal directions) */}
                {mark.label && (
                  <div
                    style={{
                      fontSize: mark.isCardinal ? 16 : 12,
                      fontWeight: mark.isCardinal ? 700 : 600,
                      color: mark.isCardinal ? '#3dc88c' : 'rgba(200,210,230,0.8)',
                      textShadow: mark.isCardinal
                        ? '0 0 8px rgba(61,200,140,0.6)'
                        : '0 0 4px rgba(0,0,0,0.8)',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {mark.label}
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>

        {/* Center reference marker (fixed triangle pointing down) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          {/* Triangle pointer */}
          <svg width="20" height="12" style={{ filter: 'drop-shadow(0 2px 4px rgba(224,64,80,0.8))' }}>
            <path
              d="M 10 12 L 4 0 L 16 0 Z"
              fill="#e04050"
              stroke="#ff6070"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Digital heading display */}
        <div
          style={{
            position: 'absolute',
            top: 4,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(10,15,25,0.95)',
            border: '1px solid rgba(80,110,140,0.5)',
            borderRadius: 4,
            padding: '2px 12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontSize: 18,
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

    </div>
  );
});
