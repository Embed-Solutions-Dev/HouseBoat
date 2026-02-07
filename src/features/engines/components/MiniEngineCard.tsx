import { memo, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { clamp } from '@/utils/math';

const T = {
  textGreen: '#3dc88c',
  textAmber: '#e8a030',
  textRed: '#e04050',
  gaugeActive: '#3dc88c',
};

interface MiniEngineCardProps {
  side: 'Left' | 'Right';
  rpm: number;
  fuelLevel: number;
  hasFaults: boolean;
}

export const MiniEngineCard = memo(function MiniEngineCard({
  side,
  rpm,
  fuelLevel,
  hasFaults,
}: MiniEngineCardProps) {
  const lowFuel = fuelLevel < 25;
  const mediumFuel = fuelLevel >= 25 && fuelLevel < 50;
  const fuelColor = lowFuel ? T.textRed : mediumFuel ? T.textAmber : T.gaugeActive;

  const max = 4000;
  const v = clamp(rpm, 0, max);
  const ratio = v / max;

  const startAngle = 225;
  const sweep = 270;

  const mv = useMotionValue(-startAngle);
  const spring = useSpring(mv, { stiffness: 80, damping: 15 });

  useEffect(() => {
    const targetAngle = -startAngle + ratio * sweep;
    mv.set(targetAngle);
  }, [ratio, mv]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
      {/* Fuel bar above widget */}
      <div style={{ width: 135, display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg style={{ width: 14, height: 14, flexShrink: 0 }} viewBox="0 0 24 24" fill={fuelColor} stroke="none">
          <path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5z" />
        </svg>
        <div
          style={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            background: 'rgba(30,45,60,0.6)',
            border: '1px solid rgba(80,100,120,0.3)',
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

      {/* Mini tachometer */}
      <div
        style={{
          width: 135,
          height: 135,
          borderRadius: '50%',
          background:
            'linear-gradient(165deg, #e8e8e8 0%, #b8b8b8 15%, #909090 30%, #707070 50%, #909090 70%, #b8b8b8 85%, #a0a0a0 100%)',
          boxShadow: hasFaults
            ? '0 4px 16px rgba(0,0,0,0.5), 0 0 20px rgba(224,64,80,0.7), 0 0 40px rgba(224,64,80,0.4)'
            : lowFuel
              ? '0 4px 16px rgba(0,0,0,0.5), 0 0 20px rgba(224,64,80,0.6), 0 0 40px rgba(224,64,80,0.3)'
              : mediumFuel
                ? '0 4px 16px rgba(0,0,0,0.5), 0 0 20px rgba(232,160,48,0.6), 0 0 40px rgba(232,160,48,0.3)'
                : '0 4px 16px rgba(0,0,0,0.5)',
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
            overflow: 'hidden',
          }}
        >
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
                  fill={isRedZone ? 'rgba(224,80,96,0.9)' : 'rgba(200,210,230,0.9)'}
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
            <text x="50" y="66" fill="rgba(150,160,180,0.6)" fontSize="6" fontWeight="500" textAnchor="middle">
              ×1000 об/м
            </text>
          </svg>

          {/* Needle */}
          <motion.div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 3,
              height: 35,
              marginLeft: -1.5,
              marginTop: -35,
              background: 'linear-gradient(180deg, #e04050 0%, #c03040 100%)',
              borderRadius: 2,
              transformOrigin: 'center bottom',
              boxShadow: '0 0 6px rgba(224,64,80,0.6)',
              rotate: spring,
            }}
          />

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
              boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
            }}
          />

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
                color: T.textGreen,
              }}
            >
              ОК
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
