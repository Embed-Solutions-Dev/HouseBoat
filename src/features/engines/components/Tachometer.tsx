import { memo, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { clamp } from '@/utils/math';
import { GEAR_LABELS } from '@/config/constants';
import type { TachometerProps } from '../types';

export const Tachometer = memo(function Tachometer({
  rpm,
  maxRpm,
  throttle,
  gear,
  label,
  size = 200,
}: TachometerProps) {
  const v = clamp(rpm, 0, maxRpm);
  const ratio = v / maxRpm;
  const isRedZone = ratio >= 0.8;

  const startAngle = 225;
  const sweep = 270;

  const mv = useMotionValue(-startAngle);
  const spring = useSpring(mv, { stiffness: 80, damping: 15 });

  useEffect(() => {
    const targetAngle = -startAngle + ratio * sweep;
    mv.set(targetAngle);
  }, [ratio, mv, startAngle, sweep]);

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;

  // Generate tick marks
  const ticks = [];
  const majorStep = 500;
  const minorStep = 100;

  for (let val = 0; val <= maxRpm; val += minorStep) {
    const t = val / maxRpm;
    const angle = ((startAngle - t * sweep) * Math.PI) / 180;
    const isMajor = val % majorStep === 0;
    const innerR = isMajor ? r - 18 : r - 10;
    const outerR = r;

    ticks.push({
      x1: cx + innerR * Math.cos(angle),
      y1: cy - innerR * Math.sin(angle),
      x2: cx + outerR * Math.cos(angle),
      y2: cy - outerR * Math.sin(angle),
      isMajor,
      value: val,
      labelX: cx + (r - 35) * Math.cos(angle),
      labelY: cy - (r - 35) * Math.sin(angle),
      isRedZone: val >= maxRpm * 0.8,
    });
  }

  return (
    <div
      className="relative"
      style={{
        width: size + 16,
        height: size + 16,
        borderRadius: '50%',
        background: 'linear-gradient(165deg, #e8e8e8 0%, #b8b8b8 15%, #909090 30%, #707070 50%, #909090 70%, #b8b8b8 85%, #a0a0a0 100%)',
        boxShadow: isRedZone
          ? '0 8px 32px rgba(0,0,0,0.5), 0 0 30px rgba(224,64,80,0.6)'
          : '0 8px 32px rgba(0,0,0,0.5)',
        padding: 8,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'linear-gradient(145deg, rgba(10,15,25,0.98) 0%, rgba(5,8,15,1) 100%)',
          position: 'relative',
        }}
      >
        <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0">
          {/* Tick marks */}
          {ticks.map((tick, i) => (
            <line
              key={i}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              stroke={tick.isRedZone ? '#e04050' : tick.isMajor ? 'rgba(200,210,230,0.8)' : 'rgba(150,160,180,0.4)'}
              strokeWidth={tick.isMajor ? 2 : 1}
            />
          ))}

          {/* Major labels */}
          {ticks
            .filter((t) => t.isMajor && t.value % 1000 === 0)
            .map((tick, i) => (
              <text
                key={i}
                x={tick.labelX}
                y={tick.labelY}
                fill={tick.isRedZone ? '#e04050' : 'rgba(200,210,230,0.6)'}
                fontSize="11"
                fontWeight="500"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {tick.value / 1000}
              </text>
            ))}
        </svg>

        {/* Animated needle */}
        <motion.div
          className="absolute"
          style={{
            width: 4,
            height: r - 20,
            background: 'linear-gradient(180deg, #d03040 0%, #e04050 50%, #d03040 100%)',
            borderRadius: 2,
            left: '50%',
            top: '50%',
            marginLeft: -2,
            marginTop: -(r - 20),
            transformOrigin: 'center bottom',
            boxShadow: '0 0 10px rgba(208,48,64,0.5)',
          }}
          animate={{ rotate: spring }}
        />

        {/* Center hub */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #d0d0d0 30%, #909090 70%, #606060 100%)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
        />

        {/* RPM display */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
          <div className="text-2xl font-bold text-yacht-primary">{Math.round(rpm)}</div>
          <div className="text-[10px] text-yacht-secondary">RPM</div>
        </div>

        {/* Gear display */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center">
          <div className="text-sm font-semibold text-yacht-green">{GEAR_LABELS[gear]}</div>
        </div>

        {/* Throttle */}
        <div className="absolute bottom-8 right-8 text-right">
          <div className="text-xs text-yacht-secondary">Газ</div>
          <div className="text-sm font-semibold text-yacht-primary">{throttle}%</div>
        </div>
      </div>

      {/* Label */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-sm text-yacht-secondary">
        {label}
      </div>
    </div>
  );
});
