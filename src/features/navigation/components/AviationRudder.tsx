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

export const AviationRudder = memo(function AviationRudder({ screenMode = 'S1' }: { screenMode?: 'S1' | 'S2' | 'S3' }) {
  const rawRudderAngle = useStore((s) => s.navigation.rudderAngle);
  const rudderAngle = Math.max(-45, Math.min(45, rawRudderAngle));

  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;
  const bezelPad = 8;

  // Boat high, pivot near center, scale ticks on the bottom arc
  const boatCenterY = cy - 30;
  const pivotY = cy + 2;

  // Tick marks: -45 to +45
  const ticks: Array<{ angle: number; isMajor: boolean; label: string | null }> = [];
  for (let deg = -45; deg <= 45; deg += 5) {
    const isMajor = deg % 15 === 0;
    const label = isMajor ? `${Math.abs(deg)}` : null;
    ticks.push({ angle: deg, isMajor, label });
  }

  // Map rudder degrees to SVG angle (radians) on the BOTTOM arc
  // 0° rudder → bottom center (90° SVG), -45 → lower-left (135°), +45 → lower-right (45°)
  const getAngleRad = (deg: number) => ((90 - deg) * Math.PI) / 180;

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
          <svg viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', inset: 0 }}>
            {/* Angle readout at top */}
            <text
              x={cx}
              y={24}
              fill={Math.abs(rudderAngle) < 2 ? (screenMode === 'S3' ? '#2da06e' : T.textGreen) : (screenMode === 'S3' ? '#000000' : T.textPrimary)}
              fontSize={16}
              fontWeight="700"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ filter: Math.abs(rudderAngle) < 2 ? 'drop-shadow(0 0 6px rgba(61,200,140,0.6))' : 'none' }}
            >
              {Math.abs(rudderAngle) < 2 ? '0°' : `${rudderAngle > 0 ? '+' : ''}${Math.round(rudderAngle)}°`}
            </text>

            {/* Boat icon - top-down view, high position */}
            <g transform={`translate(${cx}, ${boatCenterY})`}>
              {/* Hull */}
              <path
                d="M 0 -28 C -5 -26 -9 -17 -11 -6 C -12 2 -11 11 -9 18 C -7 24 -4 28 0 30 C 4 28 7 24 9 18 C 11 11 12 2 11 -6 C 9 -17 5 -26 0 -28 Z"
                fill={screenMode === 'S2' ? 'rgba(180,190,200,0.5)' : screenMode === 'S3' ? 'rgba(80,100,130,0.5)' : 'rgba(60,90,120,0.4)'}
                stroke={screenMode === 'S2' ? 'rgba(210,220,230,0.7)' : screenMode === 'S3' ? 'rgba(40,60,90,0.7)' : 'rgba(120,160,200,0.6)'}
                strokeWidth="1.2"
              />
              {/* Deck */}
              <path
                d="M 0 -22 C -3.5 -20 -6 -13 -7 -4 C -7.5 3 -7 10 -6 16 C -4.5 20 -2.5 23 0 25 C 2.5 23 4.5 20 6 16 C 7 10 7.5 3 7 -4 C 6 -13 3.5 -20 0 -22 Z"
                fill={screenMode === 'S2' ? 'rgba(150,160,170,0.6)' : screenMode === 'S3' ? 'rgba(60,80,110,0.6)' : 'rgba(40,65,90,0.5)'}
                stroke="none"
              />
              {/* Cabin */}
              <rect x={-3.5} y={-9} width={7} height={12} rx={2} fill={screenMode === 'S2' ? 'rgba(200,210,220,0.6)' : screenMode === 'S3' ? 'rgba(100,120,150,0.5)' : 'rgba(80,120,160,0.5)'} stroke={screenMode === 'S2' ? 'rgba(220,230,240,0.5)' : screenMode === 'S3' ? 'rgba(60,80,110,0.5)' : 'rgba(120,160,200,0.4)'} strokeWidth="0.8" />
              {/* Bow highlight */}
              <line x1={0} y1={-26} x2={0} y2={-14} stroke={screenMode === 'S2' ? 'rgba(220,230,240,0.5)' : screenMode === 'S3' ? 'rgba(40,60,90,0.5)' : 'rgba(150,190,230,0.4)'} strokeWidth="1" strokeLinecap="round" />
            </g>

            {/* Rudder pivot dot with depth */}
            <defs>
              <radialGradient id="pivotGrad" cx="30%" cy="30%">
                <stop offset="0%" stopColor="#303840" />
                <stop offset="60%" stopColor="#181c20" />
                <stop offset="100%" stopColor="#0a0e12" />
              </radialGradient>
            </defs>
            <circle cx={cx} cy={pivotY} r={5} fill="url(#pivotGrad)" stroke={T.cardBorder} strokeWidth={1.5} />
            <circle cx={cx - 1} cy={pivotY - 1} r={2} fill="rgba(255,255,255,0.15)" />

            {/* Scale arc background - bottom arc */}
            <path
              d={(() => {
                const arcR = r - 5;
                const startA = getAngleRad(-45);
                const endA = getAngleRad(45);
                // Arc from lower-left (135°) to lower-right (45°), going clockwise = short arc on bottom
                return `M ${cx + arcR * Math.cos(startA)} ${cy + arcR * Math.sin(startA)} A ${arcR} ${arcR} 0 0 1 ${cx + arcR * Math.cos(endA)} ${cy + arcR * Math.sin(endA)}`;
              })()}
              fill="none"
              stroke={screenMode === 'S2' ? 'rgba(220,230,240,0.6)' : screenMode === 'S3' ? 'rgba(0,0,0,0.30)' : 'rgba(60,85,110,0.25)'}
              strokeWidth={3}
              strokeLinecap="round"
            />

            {/* Tick marks on bottom arc */}
            {ticks.map((tick) => {
              const a = getAngleRad(tick.angle);
              const outerR = r - 2;
              const innerR = tick.isMajor ? r - 16 : r - 10;
              const labelR = r - 26;

              return (
                <g key={tick.angle}>
                  <line
                    x1={cx + innerR * Math.cos(a)}
                    y1={cy + innerR * Math.sin(a)}
                    x2={cx + outerR * Math.cos(a)}
                    y2={cy + outerR * Math.sin(a)}
                    stroke={tick.angle === 0 ? (screenMode === 'S3' ? '#2da06e' : T.textGreen) : screenMode === 'S2' ? '#e8f4ff' : screenMode === 'S3' ? '#000000' : tick.isMajor ? T.tickMajor : T.tickMinor}
                    strokeWidth={tick.angle === 0 ? 2.5 : tick.isMajor ? 2 : 1}
                    strokeLinecap="round"
                  />
                  {tick.label && tick.angle !== 0 && (
                    <text
                      x={cx + labelR * Math.cos(a)}
                      y={cy + labelR * Math.sin(a)}
                      fill={screenMode === 'S2' ? '#e8f4ff' : screenMode === 'S3' ? '#000000' : T.tickMajor}
                      fontSize={10}
                      fontWeight="500"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {tick.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Port / Starboard labels */}
            <text x={24} y={cy + 20} fill={screenMode === 'S2' ? '#e8f4ff' : screenMode === 'S3' ? '#3a4a5a' : T.textMuted} fontSize={9} fontWeight="600" textAnchor="middle" letterSpacing={0.5}>
              ЛБ
            </text>
            <text x={size - 24} y={cy + 20} fill={screenMode === 'S2' ? '#e8f4ff' : screenMode === 'S3' ? '#3a4a5a' : T.textMuted} fontSize={9} fontWeight="600" textAnchor="middle" letterSpacing={0.5}>
              ПБ
            </text>
          </svg>

          {/* Rotating rudder needle */}
          <motion.div
            style={{
              position: 'absolute',
              left: cx,
              top: pivotY,
              width: 0,
              height: 0,
              transformOrigin: '0 0',
            }}
            animate={{ rotate: rudderAngle }}
            transition={{ type: 'spring', stiffness: 100, damping: 18 }}
          >
            {/* Rudder blade - pointing downward from pivot into the scale */}
            <svg
              width={14}
              height={50}
              viewBox="0 0 14 50"
              style={{
                position: 'absolute',
                left: -7,
                top: 0,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
              }}
            >
              <defs>
                <linearGradient id="rudderBladeGrad" x1="30%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff6070" />
                  <stop offset="40%" stopColor="#e04050" />
                  <stop offset="100%" stopColor="#b03040" />
                </linearGradient>
                <linearGradient id="shaftGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#e0e0e0" />
                  <stop offset="50%" stopColor="#c0c0c0" />
                  <stop offset="100%" stopColor="#a0a0a0" />
                </linearGradient>
              </defs>
              {/* Shaft with metallic gradient */}
              <rect x={5.5} y={0} width={3} height={18} rx={1.5} fill="url(#shaftGrad)" />
              <rect x={6} y={0} width={1} height={18} fill="rgba(255,255,255,0.3)" />
              {/* Blade with depth */}
              <path
                d="M 7 16 L 2 24 L 1 40 C 1 44 3 48 7 48 C 11 48 13 44 13 40 L 12 24 Z"
                fill="url(#rudderBladeGrad)"
                stroke="#ff6070"
                strokeWidth="0.5"
              />
              {/* Blade highlight */}
              <path
                d="M 7 18 L 5 24 L 4.5 38 C 4.5 41 5.5 44 7 44"
                fill="none"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>
        </div>
      </div>
    </div>
  );
});
