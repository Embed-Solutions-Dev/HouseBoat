import { memo, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { clamp } from '@/utils/math';
import type { TachometerProps } from '../types';

const T = {
  cardBg: 'linear-gradient(180deg, #162230 0%, #0c1218 100%)',
  cardBorder: 'rgba(80,110,140,0.25)',
  gaugeBg: 'rgba(60,85,110,0.5)',
  gaugeActive: '#3dc88c',
  gaugeRed: '#e04050',
  tickMajor: 'rgba(180,200,220,0.8)',
  tickMinor: 'rgba(100,120,140,0.5)',
  textPrimary: '#e8f4ff',
  textSecondary: '#7a95a8',
  textMuted: '#4a6070',
  textGreen: '#3dc88c',
  textAmber: '#e8a030',
  textRed: '#e04050',
};

export const Tachometer = memo(function Tachometer({
  side,
  rpm,
  maxRpm,
  throttle,
  motorHours,
  fuelLevel,
  tempText,
  hasFaults,
  onToggleExpand,
  isExpanded = false,
  temperature = 0,
  oilPressure = 0,
  size = 310,
}: TachometerProps) {
  // Don't show fuel warnings if engine is off (rpm = 0)
  const engineOff = rpm === 0 && throttle === 0;
  const lowFuel = !engineOff && fuelLevel < 25;
  const mediumFuel = !engineOff && fuelLevel >= 25 && fuelLevel < 50;
  const v = clamp(rpm, 0, maxRpm);
  const ratio = v / maxRpm;

  const startAngle = 225;
  const sweep = 270;
  const endAngle = -45;

  const mv = useMotionValue(-startAngle);
  const spring = useSpring(mv, { stiffness: 80, damping: 15 });

  useEffect(() => {
    const targetAngle = -startAngle + ratio * sweep;
    mv.set(targetAngle);
  }, [ratio, mv]);

  const scale = size / 310;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;

  // Non-linear font scaling for better readability at small sizes
  // At 240px (scale=0.774), fonts will be ~85% instead of 77%
  const fontScale = Math.max(scale, 0.85 * scale + 0.15);

  const majorStep = 500;
  const minorStep = 100;
  const ticks: Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    isMajor: boolean;
    value: number;
    labelX: number;
    labelY: number;
    isRedZone: boolean;
  }> = [];

  for (let val = 0; val <= maxRpm; val += minorStep) {
    const t = val / maxRpm;
    const angle = ((startAngle - t * sweep) * Math.PI) / 180;
    const isMajor = val % majorStep === 0;
    const isHalf = val % 1000 !== 0 && val % 500 === 0;
    const innerR = isMajor ? (isHalf ? r - 14 : r - 18) : r - 10;
    const outerR = r;

    ticks.push({
      x1: cx + innerR * Math.cos(angle),
      y1: cy - innerR * Math.sin(angle),
      x2: cx + outerR * Math.cos(angle),
      y2: cy - outerR * Math.sin(angle),
      isMajor,
      value: val,
      labelX: cx + (r - 38) * Math.cos(angle),
      labelY: cy - (r - 38) * Math.sin(angle),
      isRedZone: val >= maxRpm * 0.8,
    });
  }

  const redZoneStartAngle = startAngle - 0.8 * sweep;
  const arcR = r - 5;
  const needleLength = r - 20;

  // Fuel arc parameters
  const fuelArcR = r - 5;
  const fuelStartAngle = -125;
  const fuelEndAngle = -55;
  const fuelSweep = 70;
  const fuelRatio = clamp(fuelLevel, 0, 100) / 100;
  const fuelFilledAngle = fuelStartAngle + fuelRatio * fuelSweep;
  const fuelColor = lowFuel ? T.textRed : mediumFuel ? T.textAmber : T.gaugeActive;

  return (
    <div style={{ position: 'relative', minHeight: 360 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>
      <div
        style={{
          position: 'relative',
          width: size + 16 * scale,
          height: size + 16 * scale,
          borderRadius: '50%',
          background: 'linear-gradient(165deg, #e8e8e8 0%, #b8b8b8 15%, #909090 30%, #707070 50%, #909090 70%, #b8b8b8 85%, #a0a0a0 100%)',
          boxShadow: hasFaults
            ? `0 ${8 * scale}px ${32 * scale}px rgba(0,0,0,0.5), 0 ${2 * scale}px ${8 * scale}px rgba(0,0,0,0.3), inset 0 ${1 * scale}px ${2 * scale}px rgba(255,255,255,0.8), 0 0 ${30 * scale}px rgba(224,64,80,0.6), 0 0 ${60 * scale}px rgba(224,64,80,0.3)`
            : lowFuel
              ? `0 ${8 * scale}px ${32 * scale}px rgba(0,0,0,0.5), 0 ${2 * scale}px ${8 * scale}px rgba(0,0,0,0.3), inset 0 ${1 * scale}px ${2 * scale}px rgba(255,255,255,0.8), 0 0 ${30 * scale}px rgba(224,64,80,0.5), 0 0 ${60 * scale}px rgba(224,64,80,0.25)`
              : mediumFuel
                ? `0 ${8 * scale}px ${32 * scale}px rgba(0,0,0,0.5), 0 ${2 * scale}px ${8 * scale}px rgba(0,0,0,0.3), inset 0 ${1 * scale}px ${2 * scale}px rgba(255,255,255,0.8), 0 0 ${30 * scale}px rgba(232,160,48,0.5), 0 0 ${60 * scale}px rgba(232,160,48,0.25)`
                : `0 ${8 * scale}px ${32 * scale}px rgba(0,0,0,0.5), 0 ${2 * scale}px ${8 * scale}px rgba(0,0,0,0.3), inset 0 ${1 * scale}px ${2 * scale}px rgba(255,255,255,0.8)`,
          padding: 8 * scale,
        }}
      >
        {/* Info button - maintain minimum size for usability */}
        <button
          onClick={onToggleExpand}
          style={{
            position: 'absolute',
            top: 13 * scale,
            right: 13 * scale,
            width: Math.max(28, 32 * scale),
            height: Math.max(28, 32 * scale),
            background: hasFaults
              ? 'linear-gradient(145deg, rgba(224,64,80,0.5) 0%, rgba(180,40,60,0.4) 100%)'
              : 'linear-gradient(145deg, rgba(80,110,140,0.4) 0%, rgba(60,90,120,0.3) 100%)',
            border: hasFaults
              ? '1px solid rgba(224,64,80,0.5)'
              : '1px solid rgba(100,130,160,0.3)',
            borderRadius: '50%',
            cursor: 'pointer',
            padding: 0,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: hasFaults
              ? `0 ${2 * scale}px ${6 * scale}px rgba(224,64,80,0.3)`
              : `0 ${2 * scale}px ${6 * scale}px rgba(0,0,0,0.2)`,
          }}
        >
          <span
            style={{
              color: hasFaults ? 'rgba(224,64,80,0.9)' : 'rgba(150,180,210,0.6)',
              fontSize: Math.max(16, 18 * scale),
              fontWeight: 600,
              fontStyle: 'italic',
              fontFamily: 'Georgia, serif',
            }}
          >
            i
          </span>
        </button>

        {/* Inner face */}
        <div
          style={{
            position: 'relative',
            width: size,
            height: size,
            borderRadius: '50%',
            background: T.cardBg,
            boxShadow: `inset 0 ${4 * scale}px ${16 * scale}px rgba(0,0,0,0.6), 0 ${1 * scale}px 0 rgba(255,255,255,0.2)`,
          }}
        >
          <svg viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
            {/* Main RPM arc background */}
            <path
              d={`M ${cx + arcR * Math.cos((startAngle * Math.PI) / 180)} ${cy - arcR * Math.sin((startAngle * Math.PI) / 180)} A ${arcR} ${arcR} 0 1 1 ${cx + arcR * Math.cos((endAngle * Math.PI) / 180)} ${cy - arcR * Math.sin((endAngle * Math.PI) / 180)}`}
              fill="none"
              stroke={T.gaugeBg}
              strokeWidth={4 * scale}
              strokeLinecap="round"
            />

            {/* Red zone on RPM arc */}
            <path
              d={`M ${cx + arcR * Math.cos((redZoneStartAngle * Math.PI) / 180)} ${cy - arcR * Math.sin((redZoneStartAngle * Math.PI) / 180)} A ${arcR} ${arcR} 0 0 1 ${cx + arcR * Math.cos((endAngle * Math.PI) / 180)} ${cy - arcR * Math.sin((endAngle * Math.PI) / 180)}`}
              fill="none"
              stroke="rgba(224,64,80,0.5)"
              strokeWidth={4 * scale}
              strokeLinecap="round"
            />

            {/* Fuel arc background */}
            <path
              d={`M ${cx + fuelArcR * Math.cos((fuelStartAngle * Math.PI) / 180)} ${cy - fuelArcR * Math.sin((fuelStartAngle * Math.PI) / 180)} A ${fuelArcR} ${fuelArcR} 0 0 0 ${cx + fuelArcR * Math.cos((fuelEndAngle * Math.PI) / 180)} ${cy - fuelArcR * Math.sin((fuelEndAngle * Math.PI) / 180)}`}
              fill="none"
              stroke={T.gaugeBg}
              strokeWidth={6 * scale}
              strokeLinecap="round"
            />

            {/* Fuel arc filled */}
            {fuelRatio > 0 && (
              <path
                d={`M ${cx + fuelArcR * Math.cos((fuelStartAngle * Math.PI) / 180)} ${cy - fuelArcR * Math.sin((fuelStartAngle * Math.PI) / 180)} A ${fuelArcR} ${fuelArcR} 0 0 0 ${cx + fuelArcR * Math.cos((fuelFilledAngle * Math.PI) / 180)} ${cy - fuelArcR * Math.sin((fuelFilledAngle * Math.PI) / 180)}`}
                fill="none"
                stroke={fuelColor}
                strokeWidth={6 * scale}
                strokeLinecap="round"
              />
            )}

            {/* Tick marks */}
            {ticks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={tick.x1}
                  y1={tick.y1}
                  x2={tick.x2}
                  y2={tick.y2}
                  stroke={tick.isRedZone ? T.gaugeRed : tick.isMajor ? T.tickMajor : T.tickMinor}
                  strokeWidth={tick.isMajor ? 2.5 * scale : 1 * scale}
                  strokeLinecap="round"
                />
                {tick.value % 1000 === 0 && (
                  <text
                    x={tick.labelX}
                    y={tick.labelY}
                    fill={tick.isRedZone ? T.gaugeRed : T.textPrimary}
                    fontSize={24 * fontScale}
                    fontWeight="600"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {tick.value / 1000}
                  </text>
                )}
              </g>
            ))}

            {/* Center circle */}
            <circle cx={cx} cy={cy} r={16 * scale} fill="#0a1015" stroke={T.cardBorder} strokeWidth={2 * scale} />
          </svg>

          {/* Animated needle */}
          <motion.div
            style={{
              position: 'absolute',
              left: cx,
              top: cy,
              transformOrigin: '0 0',
              rotate: spring,
              zIndex: 10,
            }}
          >
            <svg
              width={needleLength + 5}
              height={30 * scale}
              viewBox={`0 0 ${needleLength + 5} 30`}
              style={{
                position: 'absolute',
                left: 0,
                top: -15 * scale,
                filter: `drop-shadow(0 ${2 * scale}px ${4 * scale}px rgba(0,0,0,0.5))`,
              }}
            >
              <defs>
                <linearGradient id={`needleGrad${side}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ff5065" />
                  <stop offset="50%" stopColor="#d42040" />
                  <stop offset="100%" stopColor="#901030" />
                </linearGradient>
              </defs>
              {/* Shadow */}
              <path
                d={`M 4 13 L ${needleLength - 10} 14 L ${needleLength} 15 L ${needleLength - 10} 16 L 4 17 Z`}
                fill="rgba(0,0,0,0.3)"
              />
              {/* Needle */}
              <path
                d={`M 0 12 L ${needleLength - 10} 13 L ${needleLength} 15 L ${needleLength - 10} 17 L 0 18 Z`}
                fill={`url(#needleGrad${side})`}
              />
            </svg>

            {/* Center hub */}
            <svg
              width={44 * scale}
              height={44 * scale}
              viewBox="0 0 44 44"
              style={{
                position: 'absolute',
                left: -22 * scale,
                top: -22 * scale,
                filter: `drop-shadow(0 ${2 * scale}px ${4 * scale}px rgba(0,0,0,0.4))`,
              }}
            >
              <defs>
                <linearGradient id={`frame${side}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d0d0d0" />
                  <stop offset="30%" stopColor="#909090" />
                  <stop offset="70%" stopColor="#606060" />
                  <stop offset="100%" stopColor="#a0a0a0" />
                </linearGradient>
              </defs>
              <circle cx="22" cy="22" r="20" fill={`url(#frame${side})`} />
              <circle cx="22" cy="22" r="16" fill="#101010" />
              {/* Concentric rings */}
              {Array.from({ length: 7 }).map((_, i) => {
                const rr = 3 + i * 2;
                return (
                  <g key={i}>
                    <circle cx="22" cy="22" r={rr} fill="none" stroke="rgba(0,0,0,0.8)" strokeWidth="0.8" />
                    <circle cx="22" cy="22" r={rr + 0.5} fill="none" stroke="rgba(50,50,50,0.3)" strokeWidth="0.4" />
                  </g>
                );
              })}
              <circle cx="22" cy="22" r="2" fill="#080808" />
            </svg>
          </motion.div>

          {/* Throttle - left of center */}
          <div style={{ position: 'absolute', top: cy, left: cx - 66 * scale, transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <div style={{ fontSize: 9 * fontScale, color: T.textMuted }}>ГАЗ</div>
            <div style={{ fontSize: 16 * fontScale, fontWeight: 600, color: T.textSecondary }}>{throttle}%</div>
          </div>

          {/* Motor hours - right of center */}
          <div style={{ position: 'absolute', top: cy, left: cx + 66 * scale, transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <div style={{ fontSize: 9 * fontScale, color: T.textMuted }}>МОТОЧАСЫ</div>
            <div style={{ fontSize: 16 * fontScale, fontWeight: 600, color: T.textSecondary, fontVariantNumeric: 'tabular-nums' }}>
              {motorHours.toLocaleString()}
            </div>
          </div>

          {/* Status indicator */}
          <div style={{ position: 'absolute', bottom: 202 * scale, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
            {hasFaults ? (
              <div style={{ filter: `drop-shadow(0 0 ${8 * scale}px rgba(255,60,60,0.8))` }}>
                <svg style={{ width: 28 * scale, height: 28 * scale }} viewBox="0 0 24 24" fill="none" stroke={T.textRed} strokeWidth="2">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <circle cx="12" cy="17" r="0.6" fill={T.textRed} />
                </svg>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 11 * fontScale, color: T.textGreen }}>{tempText.split(' · ')[0]}</div>
                <div style={{ fontSize: 11 * fontScale, color: T.textGreen, marginTop: 2 * scale }}>{tempText.split(' · ')[1]}</div>
              </>
            )}
          </div>

          {/* RPM multiplier label */}
          <div style={{ position: 'absolute', bottom: 102 * scale, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
            <div style={{ fontSize: 10 * fontScale, color: 'rgba(150,160,180,0.6)', fontWeight: 500 }}>×1000 об/мин</div>
          </div>

          {/* Fuel pump icon */}
          <div style={{ position: 'absolute', bottom: 28 * scale, left: 0, right: 0, textAlign: 'center' }}>
            <svg style={{ width: 27 * scale, height: 27 * scale }} viewBox="0 0 24 24" fill={fuelColor} stroke="none">
              <path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info panel popup - appears directly over the widget */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Full screen backdrop to catch clicks anywhere */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggleExpand}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 98,
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 99,
                background: 'linear-gradient(180deg, rgba(12,18,28,0.98) 0%, rgba(6,10,16,0.99) 100%)',
                borderRadius: 20 * scale,
                border: '1px solid rgba(60,80,100,0.3)',
                boxShadow: `0 ${8 * scale}px ${32 * scale}px rgba(0,0,0,0.5), inset 0 ${1 * scale}px 0 rgba(100,130,160,0.1)`,
                padding: 20 * scale,
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
              {/* Title */}
              <div style={{ fontSize: 14 * fontScale, fontWeight: 500, color: T.textSecondary, letterSpacing: 0.5 * scale, marginBottom: 20 * scale }}>
                {side === 'Left' ? 'ЛЕВЫЙ' : side === 'Right' ? 'ПРАВЫЙ' : side.toUpperCase()} ДВИГАТЕЛЬ
              </div>

              {/* Info grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12 * scale,
                  width: '100%',
                  maxWidth: 280 * scale,
                }}
              >
                {/* RPM */}
                <div
                  style={{
                    padding: `${12 * scale}px ${14 * scale}px`,
                    background: 'rgba(30,45,60,0.4)',
                    border: '1px solid rgba(80,100,120,0.3)',
                    borderRadius: 12 * scale,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 10 * fontScale, color: T.textMuted, marginBottom: 4 * scale }}>ОБОРОТЫ</div>
                  <div style={{ fontSize: 22 * fontScale, fontWeight: 600, color: T.textPrimary }}>{Math.round(rpm).toLocaleString()}</div>
                  <div style={{ fontSize: 9 * fontScale, color: T.textMuted }}>об/мин</div>
                </div>

                {/* Throttle */}
                <div
                  style={{
                    padding: `${12 * scale}px ${14 * scale}px`,
                    background: 'rgba(30,45,60,0.4)',
                    border: '1px solid rgba(80,100,120,0.3)',
                    borderRadius: 12 * scale,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 10 * fontScale, color: T.textMuted, marginBottom: 4 * scale }}>ГАЗ</div>
                  <div style={{ fontSize: 22 * fontScale, fontWeight: 600, color: T.textPrimary }}>{throttle}%</div>
                </div>

                {/* Temperature */}
                <div
                  style={{
                    padding: `${12 * scale}px ${14 * scale}px`,
                    background: temperature > 100 ? 'rgba(224,64,80,0.15)' : 'rgba(30,45,60,0.4)',
                    border: `1px solid ${temperature > 100 ? 'rgba(224,64,80,0.5)' : temperature > 90 ? 'rgba(232,160,48,0.5)' : 'rgba(61,200,140,0.3)'}`,
                    borderRadius: 12 * scale,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 10 * fontScale, color: T.textMuted, marginBottom: 4 * scale }}>ТЕМПЕРАТУРА</div>
                  <div style={{ fontSize: 22 * fontScale, fontWeight: 600, color: temperature > 100 ? T.textRed : temperature > 90 ? T.textAmber : T.textGreen }}>
                    {temperature}°C
                  </div>
                </div>

                {/* Oil Pressure */}
                <div
                  style={{
                    padding: `${12 * scale}px ${14 * scale}px`,
                    background: oilPressure < 2 ? 'rgba(224,64,80,0.15)' : 'rgba(30,45,60,0.4)',
                    border: `1px solid ${oilPressure < 2 ? 'rgba(224,64,80,0.5)' : oilPressure < 3 ? 'rgba(232,160,48,0.5)' : 'rgba(61,200,140,0.3)'}`,
                    borderRadius: 12 * scale,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 10 * fontScale, color: T.textMuted, marginBottom: 4 * scale }}>ДАВЛ. МАСЛА</div>
                  <div style={{ fontSize: 22 * fontScale, fontWeight: 600, color: oilPressure < 2 ? T.textRed : oilPressure < 3 ? T.textAmber : T.textGreen }}>
                    {oilPressure} бар
                  </div>
                </div>

                {/* Motor Hours */}
                <div
                  style={{
                    padding: `${12 * scale}px ${14 * scale}px`,
                    background: 'rgba(30,45,60,0.4)',
                    border: '1px solid rgba(80,100,120,0.3)',
                    borderRadius: 12 * scale,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 10 * fontScale, color: T.textMuted, marginBottom: 4 * scale }}>МОТОЧАСЫ</div>
                  <div style={{ fontSize: 22 * fontScale, fontWeight: 600, color: T.textPrimary }}>{motorHours.toLocaleString()}</div>
                </div>

                {/* Fuel Level */}
                <div
                  style={{
                    padding: `${12 * scale}px ${14 * scale}px`,
                    background: lowFuel ? 'rgba(224,64,80,0.15)' : 'rgba(30,45,60,0.4)',
                    border: `1px solid ${lowFuel ? 'rgba(224,64,80,0.5)' : mediumFuel ? 'rgba(232,160,48,0.5)' : 'rgba(61,200,140,0.3)'}`,
                    borderRadius: 12 * scale,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 10 * fontScale, color: T.textMuted, marginBottom: 4 * scale }}>ТОПЛИВО</div>
                  <div style={{ fontSize: 22 * fontScale, fontWeight: 600, color: fuelColor }}>{fuelLevel}%</div>
                </div>
              </div>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});
