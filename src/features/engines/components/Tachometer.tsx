import { memo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
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
  screenMode = 'S1',
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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targetAngle = -startAngle + ratio * sweep;
    mv.set(targetAngle);
  }, [ratio, mv]);

  // Get container position for portal positioning
  const getContainerRect = () => {
    if (!containerRef.current) return null;
    return containerRef.current.getBoundingClientRect();
  };

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
  const fuelColor = engineOff ? T.textMuted : lowFuel ? T.textRed : mediumFuel ? T.textAmber : T.gaugeActive;

  return (
    <div ref={containerRef} style={{ position: 'relative', minHeight: 360 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>
      <div
        style={{
          position: 'relative',
          width: size + 16 * scale,
          height: size + 16 * scale,
          borderRadius: '50%',
          background: screenMode === 'S3'
            ? 'conic-gradient(from 200deg, #a0a0a0, #686868 25%, #909090 40%, #585858 55%, #808080 70%, #686868 85%, #a0a0a0)'
            : 'conic-gradient(from 200deg, #d8d8d8, #888888 25%, #c0c0c0 40%, #686868 55%, #a8a8a8 70%, #888888 85%, #d8d8d8)',
          boxShadow: (hasFaults || lowFuel)
            ? (screenMode === 'S3'
              ? `0 ${6 * scale}px ${24 * scale}px rgba(0,0,0,0.25), 0 ${2 * scale}px ${8 * scale}px rgba(0,0,0,0.15), inset 0 ${1 * scale}px ${3 * scale}px rgba(255,255,255,1), inset 0 ${-1 * scale}px ${2 * scale}px rgba(0,0,0,0.15), 0 0 ${40 * scale}px rgba(224,64,80,1), 0 0 ${80 * scale}px rgba(224,64,80,0.8), 0 0 ${120 * scale}px rgba(224,64,80,0.5)`
              : screenMode === 'S2'
              ? `0 ${4 * scale}px ${16 * scale}px rgba(0,0,0,0.8), 0 ${2 * scale}px ${6 * scale}px rgba(0,0,0,0.5), inset 0 ${1 * scale}px ${2 * scale}px rgba(255,255,255,0.15), 0 0 ${30 * scale}px rgba(224,64,80,0.9), 0 0 ${60 * scale}px rgba(224,64,80,0.6)`
              : `0 ${10 * scale}px ${40 * scale}px rgba(0,0,0,0.6), 0 ${4 * scale}px ${12 * scale}px rgba(0,0,0,0.4), inset 0 ${1 * scale}px ${3 * scale}px rgba(255,255,255,0.9), inset 0 ${-1 * scale}px ${2 * scale}px rgba(0,0,0,0.3), 0 0 ${30 * scale}px rgba(224,64,80,0.9), 0 0 ${60 * scale}px rgba(224,64,80,0.6)`)
            : (screenMode === 'S3'
              ? `0 ${6 * scale}px ${24 * scale}px rgba(0,0,0,0.25), 0 ${2 * scale}px ${8 * scale}px rgba(0,0,0,0.15), inset 0 ${1 * scale}px ${3 * scale}px rgba(255,255,255,1), inset 0 ${-1 * scale}px ${2 * scale}px rgba(0,0,0,0.15)`
              : screenMode === 'S2'
              ? `0 ${4 * scale}px ${16 * scale}px rgba(0,0,0,0.8), 0 ${2 * scale}px ${6 * scale}px rgba(0,0,0,0.5), inset 0 ${1 * scale}px ${2 * scale}px rgba(255,255,255,0.15)`
              : `0 ${10 * scale}px ${40 * scale}px rgba(0,0,0,0.6), 0 ${4 * scale}px ${12 * scale}px rgba(0,0,0,0.4), inset 0 ${1 * scale}px ${3 * scale}px rgba(255,255,255,0.9), inset 0 ${-1 * scale}px ${2 * scale}px rgba(0,0,0,0.3)`),
          padding: 8 * scale,
        }}
      >
        {/* Info button - maintain minimum size for usability */}
        <button
          onClick={onToggleExpand}
          style={{
            position: 'absolute',
            top: 13 * scale,
            ...(side.includes('Правый') || side === 'Right'
              ? { right: 13 * scale }
              : { left: 13 * scale }),
            width: Math.max(28, 32 * scale),
            height: Math.max(28, 32 * scale),
            background: screenMode === 'S2'
              ? (hasFaults
                ? 'linear-gradient(145deg, rgba(224,64,80,0.5) 0%, rgba(180,40,60,0.4) 100%)'
                : 'rgba(0,0,0,0.6)')
              : screenMode === 'S3'
              ? (hasFaults
                ? 'linear-gradient(145deg, rgba(224,64,80,0.5) 0%, rgba(180,40,60,0.4) 100%)'
                : 'rgba(220,228,240,0.5)')
              : (hasFaults
                ? 'linear-gradient(145deg, rgba(224,64,80,0.5) 0%, rgba(180,40,60,0.4) 100%)'
                : 'linear-gradient(145deg, rgba(80,110,140,0.4) 0%, rgba(60,90,120,0.3) 100%)'),
            border: screenMode === 'S2'
              ? (hasFaults ? '1px solid rgba(224,64,80,0.5)' : '1px solid rgba(200,220,240,0.6)')
              : screenMode === 'S3'
              ? (hasFaults ? '1px solid rgba(224,64,80,0.5)' : '1px solid rgba(0,0,0,0.30)')
              : (hasFaults ? '1px solid rgba(224,64,80,0.5)' : '1px solid rgba(100,130,160,0.3)'),
            borderRadius: '50%',
            cursor: 'pointer',
            padding: 0,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: hasFaults
              ? `0 ${2 * scale}px ${6 * scale}px rgba(224,64,80,0.3)`
              : screenMode === 'S3'
              ? `0 ${2 * scale}px ${6 * scale}px rgba(0,0,0,0.18)`
              : `0 ${2 * scale}px ${6 * scale}px rgba(0,0,0,0.2)`,
          }}
        >
          <span
            style={{
              color: hasFaults ? 'rgba(224,64,80,0.9)' : screenMode === 'S2' ? '#ffffff' : screenMode === 'S3' ? 'rgba(60,80,110,0.6)' : 'rgba(150,180,210,0.6)',
              fontSize: Math.max(16, 18 * scale),
              fontWeight: 600,
              fontStyle: 'italic',
              fontFamily: 'Georgia, serif',
            }}
          >
            i
          </span>
        </button>

        {/* Inner bevel ring */}
        <div style={{
          position: 'absolute',
          inset: 8 * scale,
          borderRadius: '50%',
          background: screenMode === 'S2'
            ? 'linear-gradient(160deg, #1a1a1a 0%, #0a0a0a 50%, #1a1a1a 100%)'
            : screenMode === 'S3'
            ? 'linear-gradient(160deg, #b8b8b8 0%, #888888 50%, #a0a0a0 100%)'
            : 'linear-gradient(160deg, #4a4a4a 0%, #2a2a2a 50%, #3a3a3a 100%)',
          boxShadow: screenMode === 'S3'
            ? `inset 0 ${2 * scale}px ${4 * scale}px rgba(0,0,0,0.3), inset 0 ${-1 * scale}px ${2 * scale}px rgba(255,255,255,0.5)`
            : `inset 0 ${2 * scale}px ${4 * scale}px rgba(0,0,0,0.6), inset 0 ${-1 * scale}px ${2 * scale}px rgba(255,255,255,0.1)`,
          zIndex: 0,
        }} />

        {/* Inner face */}
        <div
          style={{
            position: 'relative',
            width: size,
            height: size,
            borderRadius: '50%',
            background: screenMode === 'S2' ? '#000000' : screenMode === 'S3' ? 'radial-gradient(circle at 35% 35%, rgba(230,235,240,0.8) 0%, #f0f2f5 30%, #e8ecf0 70%, #dde2e8 100%)' : `radial-gradient(circle at 35% 35%, rgba(30,45,65,0.8) 0%, #162230 30%, #0c1218 70%, #080e14 100%)`,
            boxShadow: screenMode === 'S3'
              ? `inset 0 ${4 * scale}px ${15 * scale}px rgba(0,0,0,0.18), inset 0 ${-2 * scale}px ${6 * scale}px rgba(255,255,255,0.6), inset ${2 * scale}px 0 ${6 * scale}px rgba(0,0,0,0.08), inset ${-2 * scale}px 0 ${6 * scale}px rgba(0,0,0,0.08)`
              : screenMode === 'S2'
              ? `inset 0 ${4 * scale}px ${16 * scale}px rgba(0,0,0,0.9), inset 0 ${-2 * scale}px ${6 * scale}px rgba(255,255,255,0.02)`
              : `inset 0 ${6 * scale}px ${25 * scale}px rgba(0,0,0,0.8), inset 0 ${-3 * scale}px ${10 * scale}px rgba(255,255,255,0.04), inset ${3 * scale}px 0 ${8 * scale}px rgba(0,0,0,0.3), inset ${-3 * scale}px 0 ${8 * scale}px rgba(0,0,0,0.3)`,
          }}
        >
          <svg viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
            {/* Emboss filter for raised tick marks */}
            <defs>
              <filter id={`tickRaise-${side}`} x="-30%" y="-30%" width="160%" height="160%">
                {/* Dark shadow below — creates depth */}
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.8" result="blur1" />
                <feOffset in="blur1" dx="0" dy={screenMode === 'S3' ? '0.4' : '1.2'} result="shadowOff" />
                <feFlood floodColor="black" floodOpacity={screenMode === 'S3' ? '0.15' : screenMode === 'S2' ? '0.7' : '0.55'} result="shadowColor" />
                <feComposite in="shadowColor" in2="shadowOff" operator="in" result="shadow" />
                {/* Light highlight above — top edge catches light */}
                <feGaussianBlur in="SourceAlpha" stdDeviation="0.4" result="blur2" />
                <feOffset in="blur2" dx="0" dy={screenMode === 'S3' ? '-0.2' : '-0.6'} result="highlightOff" />
                <feFlood floodColor={screenMode === 'S3' ? 'white' : '#b0d0f0'} floodOpacity={screenMode === 'S3' ? '0.05' : screenMode === 'S2' ? '0.15' : '0.2'} result="highlightColor" />
                <feComposite in="highlightColor" in2="highlightOff" operator="in" result="highlight" />
                {/* Combine: shadow → source → highlight */}
                <feMerge>
                  <feMergeNode in="shadow" />
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode in="highlight" />
                </feMerge>
              </filter>
            </defs>

            {/* Main RPM arc background */}
            <path
              d={`M ${cx + arcR * Math.cos((startAngle * Math.PI) / 180)} ${cy - arcR * Math.sin((startAngle * Math.PI) / 180)} A ${arcR} ${arcR} 0 1 1 ${cx + arcR * Math.cos((endAngle * Math.PI) / 180)} ${cy - arcR * Math.sin((endAngle * Math.PI) / 180)}`}
              fill="none"
              stroke={screenMode === 'S2' ? 'transparent' : screenMode === 'S3' ? 'rgba(100,120,150,0.25)' : T.gaugeBg}
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
              stroke={screenMode === 'S2' ? 'transparent' : screenMode === 'S3' ? 'rgba(100,120,150,0.25)' : T.gaugeBg}
              strokeWidth={6 * scale}
              strokeLinecap="round"
            />

            {/* Fuel arc filled */}
            {fuelRatio > 0 && !engineOff && (
              <path
                d={`M ${cx + fuelArcR * Math.cos((fuelStartAngle * Math.PI) / 180)} ${cy - fuelArcR * Math.sin((fuelStartAngle * Math.PI) / 180)} A ${fuelArcR} ${fuelArcR} 0 0 0 ${cx + fuelArcR * Math.cos((fuelFilledAngle * Math.PI) / 180)} ${cy - fuelArcR * Math.sin((fuelFilledAngle * Math.PI) / 180)}`}
                fill="none"
                stroke={fuelColor}
                strokeWidth={6 * scale}
                strokeLinecap="round"
              />
            )}

            {/* Fuel arc tick marks at 25% intervals */}
            <g filter={`url(#tickRaise-${side})`}>
            {[0, 25, 50, 75, 100].map((pct) => {
              const t = pct / 100;
              const angle = ((fuelStartAngle + t * fuelSweep) * Math.PI) / 180;
              const isMajor = pct === 0 || pct === 50 || pct === 100;
              const outerR = fuelArcR + 5;
              const innerR = isMajor ? fuelArcR - 9 : fuelArcR - 6;
              return (
                <line
                  key={`fuel-tick-${pct}`}
                  x1={cx + innerR * Math.cos(angle)}
                  y1={cy - innerR * Math.sin(angle)}
                  x2={cx + outerR * Math.cos(angle)}
                  y2={cy - outerR * Math.sin(angle)}
                  stroke={screenMode === 'S2' ? '#e8f4ff' : screenMode === 'S3' ? '#000000' : isMajor ? T.tickMajor : T.tickMinor}
                  strokeWidth={isMajor ? 2 * scale : 1 * scale}
                  strokeLinecap="round"
                />
              );
            })}
            </g>

            {/* Tick marks */}
            <g filter={`url(#tickRaise-${side})`}>
            {ticks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={tick.x1}
                  y1={tick.y1}
                  x2={tick.x2}
                  y2={tick.y2}
                  stroke={tick.isRedZone ? T.gaugeRed : screenMode === 'S2' ? '#e8f4ff' : screenMode === 'S3' ? '#000000' : tick.isMajor ? T.tickMajor : T.tickMinor}
                  strokeWidth={tick.isMajor ? 2.5 * scale : 1 * scale}
                  strokeLinecap="round"
                />
                {tick.value % 1000 === 0 && (
                  <text
                    x={tick.labelX}
                    y={tick.labelY}
                    fill={tick.isRedZone ? T.gaugeRed : screenMode === 'S2' ? '#e8f4ff' : screenMode === 'S3' ? '#000000' : T.textPrimary}
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
            </g>

            {/* Center circle */}
            <circle cx={cx} cy={cy} r={16 * scale} fill={screenMode === 'S3' ? '#d0d5dc' : '#0a1015'} stroke={screenMode === 'S3' ? 'rgba(0,0,0,0.30)' : T.cardBorder} strokeWidth={2 * scale} />
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
                filter: screenMode === 'S3'
                  ? `drop-shadow(0 ${3 * scale}px ${8 * scale}px rgba(0,0,0,0.35)) drop-shadow(0 ${1 * scale}px ${2 * scale}px rgba(0,0,0,0.2))`
                  : `drop-shadow(0 ${3 * scale}px ${8 * scale}px rgba(0,0,0,0.7)) drop-shadow(0 ${1 * scale}px ${2 * scale}px rgba(0,0,0,0.5))`,
              }}
            >
              <defs>
                <linearGradient id={`needleGrad${side}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={screenMode === 'S3' ? '#808080' : '#ffffff'} />
                  <stop offset="50%" stopColor={screenMode === 'S3' ? '#606060' : '#e8e8e8'} />
                  <stop offset="100%" stopColor={screenMode === 'S3' ? '#404040' : '#c0c0c0'} />
                </linearGradient>
              </defs>
              {/* Needle base shadow */}
              <path
                d={`M 4 13 L ${needleLength - 10} 14 L ${needleLength} 15 L ${needleLength - 10} 16 L 4 17 Z`}
                fill={screenMode === 'S3' ? 'rgba(0,0,0,0.30)' : 'rgba(0,0,0,0.4)'}
              />
              {/* Needle body with metallic gradient */}
              <path
                d={`M 0 12 L ${needleLength - 10} 13 L ${needleLength} 15 L ${needleLength - 10} 17 L 0 18 Z`}
                fill={`url(#needleGrad${side})`}
                stroke={screenMode === 'S3' ? '#c0354a' : '#e04050'}
                strokeWidth="1.5"
                strokeLinejoin="miter"
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
                filter: `drop-shadow(0 ${3 * scale}px ${8 * scale}px rgba(0,0,0,0.5)) drop-shadow(0 ${1 * scale}px ${3 * scale}px rgba(0,0,0,0.3))`,
              }}
            >
              <defs>
                <radialGradient id={`hubGrad${side}`} cx="35%" cy="35%">
                  <stop offset="0%" stopColor="#f0f0f0" />
                  <stop offset="40%" stopColor="#c0c0c0" />
                  <stop offset="70%" stopColor="#808080" />
                  <stop offset="100%" stopColor="#606060" />
                </radialGradient>
              </defs>
              <circle cx="22" cy="22" r="20" fill={`url(#hubGrad${side})`} />
              <circle cx="22" cy="22" r="16" fill={screenMode === 'S3' ? '#c0c5cc' : '#101010'} />
              {/* Concentric rings */}
              {Array.from({ length: 7 }).map((_, i) => {
                const rr = 3 + i * 2;
                return (
                  <g key={i}>
                    <circle cx="22" cy="22" r={rr} fill="none" stroke={screenMode === 'S3' ? 'rgba(0,0,0,0.30)' : 'rgba(0,0,0,0.8)'} strokeWidth="0.8" />
                    <circle cx="22" cy="22" r={rr + 0.5} fill="none" stroke={screenMode === 'S3' ? 'rgba(120,130,140,0.3)' : 'rgba(50,50,50,0.3)'} strokeWidth="0.4" />
                  </g>
                );
              })}
              <circle cx="22" cy="22" r="2" fill={screenMode === 'S3' ? '#a0a5ac' : '#080808'} />
            </svg>
          </motion.div>

          {/* Throttle - left of center */}
          <div style={{ position: 'absolute', top: cy, left: cx - 66 * scale, transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <div style={{ fontSize: 9 * fontScale, color: screenMode === 'S2' ? '#e8f4ff' : screenMode === 'S3' ? '#3a4a5a' : T.textMuted }}>ГАЗ</div>
            <div style={{ fontSize: 16 * fontScale, fontWeight: 600, color: screenMode === 'S2' ? '#e8f4ff' : screenMode === 'S3' ? '#1a1a2e' : T.textSecondary }}>{throttle}%</div>
          </div>

          {/* Motor hours - right of center */}
          <div style={{ position: 'absolute', top: cy, left: cx + 66 * scale, transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <div style={{ fontSize: 9 * fontScale, color: screenMode === 'S2' ? '#e8f4ff' : screenMode === 'S3' ? '#3a4a5a' : T.textMuted }}>МОТОЧАСЫ</div>
            <div style={{ fontSize: 16 * fontScale, fontWeight: 600, color: screenMode === 'S2' ? '#e8f4ff' : screenMode === 'S3' ? (engineOff ? '#3a4a5a' : '#1a1a2e') : (engineOff ? T.textMuted : T.textSecondary), fontVariantNumeric: 'tabular-nums' }}>
              {engineOff ? '----' : motorHours.toLocaleString()}
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
            ) : engineOff ? (
              <div style={{ fontSize: 18 * fontScale, fontWeight: 600, color: screenMode === 'S2' ? '#e8f4ff' : screenMode === 'S3' ? '#3a4a5a' : T.textMuted }}>OFF</div>
            ) : (
              <>
                <div style={{ fontSize: 11 * fontScale, color: screenMode === 'S3' ? '#2da06e' : T.textGreen }}>{tempText.split(' · ')[0]}</div>
                <div style={{ fontSize: 11 * fontScale, color: screenMode === 'S3' ? '#2da06e' : T.textGreen, marginTop: 2 * scale }}>{tempText.split(' · ')[1]}</div>
              </>
            )}
          </div>

          {/* RPM multiplier label */}
          <div style={{ position: 'absolute', bottom: 102 * scale, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
            <div style={{ fontSize: 10 * fontScale, color: screenMode === 'S2' ? '#e8f4ff' : screenMode === 'S3' ? 'rgba(30,40,60,0.8)' : 'rgba(150,160,180,0.6)', fontWeight: 500 }}>×1000 об/мин</div>
          </div>

          {/* Fuel pump icon */}
          <div style={{ position: 'absolute', bottom: 28 * scale, left: 0, right: 0, textAlign: 'center' }}>
            <svg style={{ width: 27 * scale, height: 27 * scale }} viewBox="0 0 24 24" fill={screenMode === 'S2' ? (engineOff ? '#ffffff' : fuelColor) : screenMode === 'S3' ? (engineOff ? '#3a4a5a' : fuelColor) : fuelColor} stroke="#000000" strokeWidth="0.5">
              <path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5z" />
            </svg>
          </div>

          {/* Glass reflection */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: screenMode === 'S2'
              ? 'radial-gradient(ellipse 70% 50% at 35% 25%, rgba(255,255,255,0.06) 0%, transparent 70%)'
              : screenMode === 'S3'
              ? 'radial-gradient(ellipse 70% 50% at 35% 25%, rgba(255,255,255,0.4) 0%, transparent 70%)'
              : 'radial-gradient(ellipse 70% 50% at 35% 25%, rgba(180,210,240,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 5,
          }} />
        </div>
      </div>

      {/* Info panel popup - rendered in portal to avoid transform issues */}
      {isExpanded && (() => {
        const rect = getContainerRect();
        if (!rect) return null;

        return createPortal(
          <div
            onClick={onToggleExpand}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9998,
              background: 'rgba(0,0,0,0.75)',
              cursor: 'pointer',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'fixed',
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: screenMode === 'S2' ? '#000000' : screenMode === 'S3' ? 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 100%)' : 'linear-gradient(180deg, rgba(12,18,28,0.98) 0%, rgba(6,10,16,0.99) 100%)',
                borderRadius: 20 * scale,
                border: screenMode === 'S2' ? '1px solid rgba(120,140,160,0.5)' : screenMode === 'S3' ? '1px solid rgba(0,0,0,0.25)' : '1px solid rgba(60,80,100,0.3)',
                boxShadow: `0 ${8 * scale}px ${32 * scale}px rgba(0,0,0,0.5), inset 0 ${1 * scale}px 0 rgba(100,130,160,0.1)`,
                padding: 20 * scale,
                cursor: 'default',
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
              <div style={{ fontSize: 14 * fontScale, fontWeight: 500, color: screenMode === 'S2' ? '#ffffff' : screenMode === 'S3' ? '#1a1a2e' : T.textSecondary, letterSpacing: 0.5 * scale, marginBottom: 20 * scale }}>
                {side === 'Left' ? 'ЛЕВЫЙ ДВИГАТЕЛЬ' : side === 'Right' ? 'ПРАВЫЙ ДВИГАТЕЛЬ' : side.toUpperCase()}
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
                    background: screenMode === 'S2' ? 'rgba(0,0,0,0.6)' : screenMode === 'S3' ? 'rgba(220,228,240,0.6)' : 'rgba(30,45,60,0.4)',
                    border: screenMode === 'S2' ? '1px solid rgba(120,140,160,0.5)' : screenMode === 'S3' ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(80,100,120,0.3)',
                    borderRadius: 12 * scale,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 10 * fontScale, color: screenMode === 'S2' ? '#ffffff' : screenMode === 'S3' ? '#3a4a5a' : T.textMuted, marginBottom: 4 * scale }}>ОБОРОТЫ</div>
                  <div style={{ fontSize: 22 * fontScale, fontWeight: 600, color: screenMode === 'S2' ? '#ffffff' : screenMode === 'S3' ? '#000000' : T.textPrimary }}>{Math.round(rpm).toLocaleString()}</div>
                  <div style={{ fontSize: 9 * fontScale, color: screenMode === 'S2' ? '#ffffff' : screenMode === 'S3' ? '#3a4a5a' : T.textMuted }}>об/мин</div>
                </div>

                {/* Throttle */}
                <div
                  style={{
                    padding: `${12 * scale}px ${14 * scale}px`,
                    background: screenMode === 'S2' ? 'rgba(0,0,0,0.6)' : screenMode === 'S3' ? 'rgba(220,228,240,0.6)' : 'rgba(30,45,60,0.4)',
                    border: screenMode === 'S2' ? '1px solid rgba(120,140,160,0.5)' : screenMode === 'S3' ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(80,100,120,0.3)',
                    borderRadius: 12 * scale,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 10 * fontScale, color: screenMode === 'S2' ? '#ffffff' : screenMode === 'S3' ? '#3a4a5a' : T.textMuted, marginBottom: 4 * scale }}>ГАЗ</div>
                  <div style={{ fontSize: 22 * fontScale, fontWeight: 600, color: screenMode === 'S2' ? '#ffffff' : screenMode === 'S3' ? '#000000' : T.textPrimary }}>{throttle}%</div>
                </div>

                {/* Temperature */}
                <div
                  style={{
                    padding: `${12 * scale}px ${14 * scale}px`,
                    background: screenMode === 'S2'
                      ? (temperature > 100 ? 'rgba(224,64,80,0.15)' : 'rgba(0,0,0,0.6)')
                      : screenMode === 'S3'
                      ? (temperature > 100 ? 'rgba(192,53,74,0.1)' : 'rgba(220,228,240,0.6)')
                      : (temperature > 100 ? 'rgba(224,64,80,0.15)' : 'rgba(30,45,60,0.4)'),
                    border: screenMode === 'S2'
                      ? `1px solid ${temperature > 100 ? 'rgba(224,64,80,0.5)' : temperature > 90 ? 'rgba(232,160,48,0.5)' : 'rgba(61,200,140,0.3)'}`
                      : screenMode === 'S3'
                      ? `1px solid ${temperature > 100 ? 'rgba(192,53,74,0.4)' : temperature > 90 ? 'rgba(192,128,32,0.4)' : 'rgba(45,160,110,0.3)'}`
                      : `1px solid ${temperature > 100 ? 'rgba(224,64,80,0.5)' : temperature > 90 ? 'rgba(232,160,48,0.5)' : 'rgba(61,200,140,0.3)'}`,
                    borderRadius: 12 * scale,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 10 * fontScale, color: screenMode === 'S2' ? '#ffffff' : screenMode === 'S3' ? '#3a4a5a' : T.textMuted, marginBottom: 4 * scale }}>ТЕМПЕРАТУРА</div>
                  <div style={{ fontSize: 22 * fontScale, fontWeight: 600, color: engineOff ? (screenMode === 'S2' ? '#ffffff' : screenMode === 'S3' ? '#3a4a5a' : T.textMuted) : temperature > 100 ? (screenMode === 'S3' ? '#c0354a' : T.textRed) : temperature > 90 ? (screenMode === 'S3' ? '#c08020' : T.textAmber) : (screenMode === 'S3' ? '#2da06e' : T.textGreen) }}>
                    {engineOff ? 'OFF' : `${temperature}°C`}
                  </div>
                </div>

                {/* Oil Pressure */}
                <div
                  style={{
                    padding: `${12 * scale}px ${14 * scale}px`,
                    background: screenMode === 'S2'
                      ? (engineOff ? 'rgba(0,0,0,0.6)' : oilPressure < 2 ? 'rgba(224,64,80,0.15)' : 'rgba(0,0,0,0.6)')
                      : screenMode === 'S3'
                      ? (engineOff ? 'rgba(220,228,240,0.6)' : oilPressure < 2 ? 'rgba(192,53,74,0.1)' : 'rgba(220,228,240,0.6)')
                      : (engineOff ? 'rgba(30,45,60,0.4)' : oilPressure < 2 ? 'rgba(224,64,80,0.15)' : 'rgba(30,45,60,0.4)'),
                    border: screenMode === 'S2'
                      ? `1px solid ${engineOff ? 'rgba(120,140,160,0.5)' : oilPressure < 2 ? 'rgba(224,64,80,0.5)' : oilPressure < 3 ? 'rgba(232,160,48,0.5)' : 'rgba(61,200,140,0.3)'}`
                      : screenMode === 'S3'
                      ? `1px solid ${engineOff ? 'rgba(0,0,0,0.2)' : oilPressure < 2 ? 'rgba(192,53,74,0.4)' : oilPressure < 3 ? 'rgba(192,128,32,0.4)' : 'rgba(45,160,110,0.3)'}`
                      : `1px solid ${engineOff ? 'rgba(60,80,100,0.3)' : oilPressure < 2 ? 'rgba(224,64,80,0.5)' : oilPressure < 3 ? 'rgba(232,160,48,0.5)' : 'rgba(61,200,140,0.3)'}`,
                    borderRadius: 12 * scale,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 10 * fontScale, color: screenMode === 'S2' ? '#ffffff' : screenMode === 'S3' ? '#3a4a5a' : T.textMuted, marginBottom: 4 * scale }}>ДАВЛ. МАСЛА</div>
                  <div style={{ fontSize: 22 * fontScale, fontWeight: 600, color: engineOff ? (screenMode === 'S2' ? '#ffffff' : screenMode === 'S3' ? '#3a4a5a' : T.textMuted) : oilPressure < 2 ? (screenMode === 'S3' ? '#c0354a' : T.textRed) : oilPressure < 3 ? (screenMode === 'S3' ? '#c08020' : T.textAmber) : (screenMode === 'S3' ? '#2da06e' : T.textGreen) }}>
                    {engineOff ? 'OFF' : `${oilPressure} бар`}
                  </div>
                </div>

                {/* Motor Hours */}
                <div
                  style={{
                    padding: `${12 * scale}px ${14 * scale}px`,
                    background: screenMode === 'S2' ? 'rgba(0,0,0,0.6)' : screenMode === 'S3' ? 'rgba(220,228,240,0.6)' : 'rgba(30,45,60,0.4)',
                    border: screenMode === 'S2' ? '1px solid rgba(120,140,160,0.5)' : screenMode === 'S3' ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(80,100,120,0.3)',
                    borderRadius: 12 * scale,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 10 * fontScale, color: screenMode === 'S2' ? '#ffffff' : screenMode === 'S3' ? '#3a4a5a' : T.textMuted, marginBottom: 4 * scale }}>МОТОЧАСЫ</div>
                  <div style={{ fontSize: 22 * fontScale, fontWeight: 600, color: screenMode === 'S2' ? '#ffffff' : screenMode === 'S3' ? '#000000' : T.textPrimary }}>{motorHours.toLocaleString()}</div>
                </div>

                {/* Fuel Level */}
                <div
                  style={{
                    padding: `${12 * scale}px ${14 * scale}px`,
                    background: screenMode === 'S2'
                      ? (lowFuel ? 'rgba(224,64,80,0.15)' : 'rgba(0,0,0,0.6)')
                      : screenMode === 'S3'
                      ? (lowFuel ? 'rgba(192,53,74,0.1)' : 'rgba(220,228,240,0.6)')
                      : (lowFuel ? 'rgba(224,64,80,0.15)' : 'rgba(30,45,60,0.4)'),
                    border: screenMode === 'S3'
                      ? `1px solid ${lowFuel ? 'rgba(192,53,74,0.4)' : mediumFuel ? 'rgba(192,128,32,0.4)' : 'rgba(45,160,110,0.3)'}`
                      : `1px solid ${lowFuel ? 'rgba(224,64,80,0.5)' : mediumFuel ? 'rgba(232,160,48,0.5)' : 'rgba(61,200,140,0.3)'}`,
                    borderRadius: 12 * scale,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 10 * fontScale, color: screenMode === 'S2' ? '#ffffff' : screenMode === 'S3' ? '#3a4a5a' : T.textMuted, marginBottom: 4 * scale }}>ТОПЛИВО</div>
                  <div style={{ fontSize: 22 * fontScale, fontWeight: 600, color: fuelColor }}>{fuelLevel}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      );
      })()}
    </div>
  );
});
