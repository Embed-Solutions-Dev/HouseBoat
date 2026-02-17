import { memo, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { clamp } from '@/utils/math';

const T = {
  textGreen: '#3dc88c',
  textAmber: '#e8a030',
  textRed: '#e04050',
  textMuted: '#7a95a8',
  gaugeActive: '#3dc88c',
};

interface MiniEngineCardProps {
  side: string;
  rpm: number;
  throttle: number;
  fuelLevel: number;
  hasFaults: boolean;
  screenMode?: 'S1' | 'S2' | 'S3';
}

export const MiniEngineCard = memo(function MiniEngineCard({
  side,
  rpm,
  throttle,
  fuelLevel,
  hasFaults,
  screenMode = 'S1',
}: MiniEngineCardProps) {
  const engineOff = rpm === 0 && throttle === 0;
  const lowFuel = !engineOff && fuelLevel < 25;
  const mediumFuel = !engineOff && fuelLevel >= 25 && fuelLevel < 50;
  const fuelColor = engineOff ? T.textMuted : lowFuel ? T.textRed : mediumFuel ? T.textAmber : T.gaugeActive;

  const max = 4000;
  const startAngle = 225;
  const sweep = 270;

  const mv = useMotionValue(startAngle);
  const spring = useSpring(mv, { stiffness: 80, damping: 15 });

  useEffect(() => {
    const v = clamp(rpm, 0, max);
    const ratio = v / max;
    const targetAngle = startAngle + ratio * sweep;
    mv.set(targetAngle);
  }, [rpm, mv, max, startAngle, sweep]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
      {/* Mini tachometer */}
      <div
        style={{
          width: 135,
          height: 135,
          borderRadius: '50%',
          background: screenMode === 'S3'
            ? 'linear-gradient(165deg, #909090 0%, #787878 15%, #606060 30%, #505050 50%, #606060 70%, #787878 85%, #6a6a6a 100%)'
            : 'linear-gradient(165deg, #e8e8e8 0%, #b8b8b8 15%, #909090 30%, #707070 50%, #909090 70%, #b8b8b8 85%, #a0a0a0 100%)',
          boxShadow: (hasFaults || lowFuel)
            ? (screenMode === 'S3'
              ? '0 2px 8px rgba(0,0,0,0.2), 0 0 20px rgba(192,53,74,0.4), 0 0 40px rgba(192,53,74,0.2)'
              : '0 4px 16px rgba(0,0,0,0.5), 0 0 20px rgba(224,64,80,0.7), 0 0 40px rgba(224,64,80,0.4)')
            : (screenMode === 'S3'
              ? '0 2px 8px rgba(0,0,0,0.2)'
              : '0 4px 16px rgba(0,0,0,0.5)'),
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
            background: screenMode === 'S2' ? '#000000' : screenMode === 'S3' ? 'radial-gradient(circle at 35% 35%, rgba(230,235,240,0.9) 0%, rgba(220,228,238,0.98) 30%, rgba(210,218,228,1) 70%, rgba(200,208,218,1) 100%)' : 'radial-gradient(circle at 35% 35%, rgba(25,35,50,0.9) 0%, rgba(15,22,35,0.98) 30%, rgba(8,12,20,1) 70%, rgba(5,8,12,1) 100%)',
            boxShadow: screenMode === 'S3' ? 'inset 0 1px 6px rgba(0,0,0,0.12)' : 'inset 0 2px 10px rgba(0,0,0,0.7), inset 0 -1px 4px rgba(255,255,255,0.03)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Inner highlight for depth */}
          <div
            style={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              width: '35%',
              height: '35%',
              borderRadius: '50%',
              background: screenMode === 'S3' ? 'radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, transparent 70%)' : 'radial-gradient(circle at center, rgba(80,100,130,0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          {/* Scale */}
          <svg viewBox="0 0 100 100" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            {/* Tick marks every 100 RPM */}
            {Array.from({ length: 41 }).map((_, i) => {
              const val = i * 100;
              const t = val / max;
              const angle = ((startAngle - t * sweep) * Math.PI) / 180;
              const isMajor = val % 1000 === 0;
              const isMedium = val % 500 === 0 && !isMajor;
              const r1 = isMajor ? 42 : isMedium ? 43.5 : 45;
              const r2 = 46;
              const isRedZone = val >= max * 0.8;
              return (
                <line
                  key={i}
                  x1={50 + r1 * Math.cos(angle)}
                  y1={50 - r1 * Math.sin(angle)}
                  x2={50 + r2 * Math.cos(angle)}
                  y2={50 - r2 * Math.sin(angle)}
                  stroke={
                    isRedZone
                      ? isMajor
                        ? 'rgba(224,80,96,1)'
                        : isMedium
                          ? 'rgba(224,80,96,0.85)'
                          : 'rgba(224,80,96,0.6)'
                      : screenMode === 'S3'
                      ? '#000000'
                      : isMajor
                        ? 'rgba(200,210,230,0.9)'
                        : isMedium
                          ? 'rgba(180,190,210,0.7)'
                          : 'rgba(150,165,185,0.5)'
                  }
                  strokeWidth={isMajor ? 1.5 : isMedium ? 1 : 0.75}
                  strokeLinecap="round"
                />
              );
            })}
            {/* Numbers 0-4 */}
            {[0, 1, 2, 3, 4].map((num) => {
              const t = (num * 1000) / max;
              const angle = ((startAngle - t * sweep) * Math.PI) / 180;
              const isRedZone = num >= 4 * 0.8;
              return (
                <text
                  key={num}
                  x={50 + 35 * Math.cos(angle)}
                  y={50 - 35 * Math.sin(angle)}
                  fill={isRedZone ? 'rgba(224,80,96,0.9)' : screenMode === 'S3' ? '#000000' : 'rgba(200,210,230,0.9)'}
                  fontSize="9"
                  fontWeight="600"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {num}
                </text>
              );
            })}
            {/* x1000 label */}
            <text x="50" y="66" fill={screenMode === 'S3' ? 'rgba(30,40,60,0.8)' : 'rgba(150,160,180,0.6)'} fontSize="6" fontWeight="500" textAnchor="middle">
              ×1000 об/м
            </text>
          </svg>

          {/* Needle with metallic look */}
          <motion.div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 3,
              height: 35,
              marginLeft: -1.5,
              marginTop: -35,
              background: screenMode === 'S3' ? 'linear-gradient(180deg, #d04050 0%, #c0354a 50%, #a02838 100%)' : 'linear-gradient(180deg, #ff6070 0%, #e04050 50%, #c03040 100%)',
              borderRadius: 2,
              transformOrigin: 'center bottom',
              boxShadow: screenMode === 'S3' ? '0 0 6px rgba(192,53,74,0.5), 0 1px 3px rgba(0,0,0,0.3)' : '0 0 8px rgba(224,64,80,0.7), 0 1px 3px rgba(0,0,0,0.5)',
              rotate: spring,
            }}
          >
            {/* Needle highlight */}
            <div
              style={{
                position: 'absolute',
                left: 0.5,
                top: 2,
                width: 1,
                height: 25,
                background: screenMode === 'S3' ? 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 80%)' : 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 80%)',
                borderRadius: 1,
              }}
            />
          </motion.div>

          {/* Center hub with depth */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: screenMode === 'S3' ? 'radial-gradient(circle at 30% 30%, #e8e8e8 0%, #d0d0d0 35%, #b0b0b0 70%, #909090 100%)' : 'radial-gradient(circle at 30% 30%, #f0f0f0 0%, #c0c0c0 35%, #808080 70%, #505050 100%)',
              boxShadow: screenMode === 'S3' ? '0 1px 3px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.5)' : '0 2px 5px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.3)',
            }}
          >
            {/* Inner dark circle */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: screenMode === 'S3' ? 'radial-gradient(circle at 30% 30%, #c0c5cc 0%, #b0b5bc 50%, #a0a5ac 100%)' : 'radial-gradient(circle at 30% 30%, #202830 0%, #101820 50%, #080c10 100%)',
              }}
            />
          </div>

          {/* Status at bottom */}
          {hasFaults ? (
            <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)' }}>
              <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke={T.textRed} strokeWidth="2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <circle cx="12" cy="17" r="0.6" fill={T.textRed} />
              </svg>
            </div>
          ) : (
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 11,
                fontWeight: 600,
                color: engineOff ? (screenMode === 'S3' ? '#3a4a5a' : T.textMuted) : (screenMode === 'S3' ? '#2da06e' : T.textGreen),
              }}
            >
              {engineOff ? 'OFF' : 'ОК'}
            </div>
          )}
        </div>
      </div>

      {/* Fuel bar below widget */}
      <div style={{ width: 135, display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg style={{ width: 14, height: 14, flexShrink: 0 }} viewBox="0 0 24 24" fill={screenMode === 'S3' ? (engineOff ? '#3a4a5a' : fuelColor) : fuelColor} stroke="#000000" strokeWidth="0.5">
          <path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5z" />
        </svg>
        <div
          style={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            background: screenMode === 'S3' ? 'rgba(200,210,225,0.6)' : 'rgba(30,45,60,0.6)',
            border: screenMode === 'S3' ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(80,100,120,0.3)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${fuelLevel}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${fuelColor} 0%, ${fuelColor}88 100%)`,
              borderRadius: 2,
            }}
          />
        </div>
        <div style={{ fontSize: 10, color: fuelColor, width: 28, textAlign: 'right' }}>{fuelLevel}%</div>
      </div>
    </div>
  );
});
