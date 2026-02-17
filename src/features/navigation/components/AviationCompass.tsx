import { memo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/stores';

const T = {
  cardBg: 'linear-gradient(180deg, #162230 0%, #0c1218 100%)',
  cardBorder: 'rgba(80,110,140,0.25)',
  tickMajor: 'rgba(180,200,220,0.8)',
  tickMinor: 'rgba(100,120,140,0.5)',
  textPrimary: '#e8f4ff',
  textMuted: '#4a6070',
  textGreen: '#3dc88c',
};

const cardinalLabel = (deg: number): string | null => {
  switch (deg) {
    case 0: return 'N';
    case 45: return 'N/E';
    case 90: return 'E';
    case 135: return 'S/E';
    case 180: return 'S';
    case 225: return 'S/W';
    case 270: return 'W';
    case 315: return 'N/W';
    default: return null;
  }
};

export const AviationCompass = memo(function AviationCompass({ screenMode = 'S1' }: { screenMode?: 'S1' | 'S2' | 'S3' }) {
  const heading = useStore((s) => s.navigation.heading);

  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;
  const bezelPad = 8;

  // Generate tick marks every 5 degrees
  const ticks: Array<{ deg: number; isCardinal: boolean; isDirection: boolean; label: string | null }> = [];
  for (let deg = 0; deg < 360; deg += 5) {
    const isCardinal = deg % 90 === 0;
    const isDirection = deg % 45 === 0;
    const label = isDirection ? cardinalLabel(deg) : null;
    ticks.push({ deg, isCardinal, isDirection, label });
  }

  // Convert compass degrees to SVG angle (radians)
  // 0° (N) = top (270° in SVG math coords)
  const degToRad = (deg: number) => ((deg - 90) * Math.PI) / 180;

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer metallic bezel */}
      <div
        style={{
          position: 'relative',
          width: size + 16,
          height: size + 16,
          borderRadius: '50%',
          background: screenMode === 'S3' ? 'linear-gradient(165deg, #909090 0%, #787878 15%, #606060 30%, #505050 50%, #606060 70%, #787878 85%, #6a6a6a 100%)' : 'linear-gradient(165deg, #e8e8e8 0%, #b8b8b8 15%, #909090 30%, #707070 50%, #909090 70%, #b8b8b8 85%, #a0a0a0 100%)',
          boxShadow: screenMode === 'S3' ? '0 8px 32px rgba(0,0,0,0.30), 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.9)' : '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.8)',
          padding: bezelPad,
        }}
      >
        {/* Inner face */}
        <div
          style={{
            position: 'relative',
            width: size,
            height: size,
            borderRadius: '50%',
            background: screenMode === 'S2' ? '#000000' : screenMode === 'S3' ? 'radial-gradient(circle at 35% 35%, rgba(230,235,240,0.8) 0%, #f0f2f5 30%, #e8ecf0 70%, #dde2e8 100%)' : 'radial-gradient(circle at 35% 35%, rgba(30,45,65,0.8) 0%, #162230 30%, #0c1218 70%, #080e14 100%)',
            boxShadow: screenMode === 'S3' ? 'inset 0 2px 10px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.5)' : 'inset 0 4px 20px rgba(0,0,0,0.7), inset 0 -2px 8px rgba(255,255,255,0.03), 0 1px 0 rgba(255,255,255,0.2)',
            overflow: 'hidden',
          }}
        >
          {/* Fixed heading readout above boat */}
          <div
            style={{
              position: 'absolute',
              top: cy - 46,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 20,
            }}
          >
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: screenMode === 'S3' ? '#000000' : T.textPrimary,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {String(Math.round(heading) % 360).padStart(3, '0')}°
            </span>
          </div>

          {/* Fixed lubber line triangle at top */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 15,
            }}
          >
            <svg width="16" height="10" style={{ filter: 'drop-shadow(0 1px 3px rgba(224,64,80,0.8))' }}>
              <path d="M 8 10 L 2 0 L 14 0 Z" fill="#e04050" stroke="#ff6070" strokeWidth="0.5" />
            </svg>
          </div>

          {/* Rotating compass card */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              transformOrigin: 'center center',
            }}
            animate={{ rotate: -heading }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          >
            <svg viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', inset: 0 }}>
              {/* Outer ring */}
              <circle cx={cx} cy={cy} r={r - 2} fill="none" stroke={screenMode === 'S2' ? 'rgba(220,230,240,0.4)' : screenMode === 'S3' ? 'rgba(0,0,0,0.25)' : 'rgba(60,85,110,0.2)'} strokeWidth={1} />

              {/* Tick marks and labels */}
              {ticks.map((tick) => {
                const a = degToRad(tick.deg);
                const outerR = r - 2;
                const isMajor = tick.deg % 10 === 0;
                const innerR = tick.isCardinal ? r - 20 : tick.isDirection ? r - 14 : isMajor ? r - 10 : r - 7;
                const labelR = r - 32;

                return (
                  <g key={tick.deg}>
                    <line
                      x1={cx + innerR * Math.cos(a)}
                      y1={cy + innerR * Math.sin(a)}
                      x2={cx + outerR * Math.cos(a)}
                      y2={cy + outerR * Math.sin(a)}
                      stroke={tick.isCardinal ? (screenMode === 'S3' ? '#000000' : T.textPrimary) : screenMode === 'S2' ? '#e8f4ff' : screenMode === 'S3' ? '#000000' : tick.isDirection ? T.tickMajor : T.tickMinor}
                      strokeWidth={tick.isCardinal ? 2.5 : tick.isDirection ? 1.5 : isMajor ? 1 : 0.6}
                      strokeLinecap="round"
                    />
                    {tick.label && (
                      <text
                        x={cx + labelR * Math.cos(a)}
                        y={cy + labelR * Math.sin(a)}
                        fill={tick.isCardinal ? (screenMode === 'S3' ? '#000000' : T.textPrimary) : (screenMode === 'S3' ? '#000000' : 'rgba(200,210,230,0.7)')}
                        fontSize={tick.isCardinal ? 16 : 9}
                        fontWeight={tick.isCardinal ? 700 : 500}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {tick.label}
                      </text>
                    )}
                  </g>
                );
              })}

            </svg>
          </motion.div>

          {/* Fixed center - boat icon */}
          <svg
            viewBox={`0 0 ${size} ${size}`}
            style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}
          >
            {/* Center boat silhouette */}
            <g transform={`translate(${cx}, ${cy})`}>
              <path
                d="M 0 -16 C -3 -14 -5 -9 -6 -2 C -6.5 3 -6 8 -5 12 C -4 15 -2 17 0 18 C 2 17 4 15 5 12 C 6 8 6.5 3 6 -2 C 5 -9 3 -14 0 -16 Z"
                fill={screenMode === 'S2' ? 'rgba(200,210,220,0.5)' : screenMode === 'S3' ? 'rgba(80,100,130,0.4)' : 'rgba(80,120,160,0.4)'}
                stroke={screenMode === 'S2' ? 'rgba(220,230,240,0.7)' : screenMode === 'S3' ? 'rgba(60,80,110,0.6)' : 'rgba(120,160,200,0.6)'}
                strokeWidth="1"
              />
              {/* Bow line */}
              <line x1={0} y1={-14} x2={0} y2={-6} stroke={screenMode === 'S2' ? 'rgba(230,240,250,0.6)' : screenMode === 'S3' ? 'rgba(40,60,90,0.5)' : 'rgba(150,190,230,0.5)'} strokeWidth="1" strokeLinecap="round" />
            </g>

            {/* Center dot */}
            <circle cx={cx} cy={cy} r={2.5} fill={screenMode === 'S3' ? '#d0d5dc' : '#0a1015'} stroke={screenMode === 'S3' ? 'rgba(0,0,0,0.30)' : T.cardBorder} strokeWidth={1} />
          </svg>
        </div>
      </div>
    </div>
  );
});
