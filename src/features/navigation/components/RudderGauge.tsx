import { memo, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { clamp, mapRange } from '@/utils/math';
import type { RudderGaugeProps } from '../types';

export const RudderGauge = memo(function RudderGauge({ angle, compact = false }: RudderGaugeProps) {
  const a = clamp(angle, -35, 35);
  const mv = useMotionValue(a);
  const spring = useSpring(mv, { stiffness: 140, damping: 20 });

  useEffect(() => {
    mv.set(a);
  }, [a, mv]);

  const leftPct = useTransform(spring, (v) => `${mapRange(v, -35, 35, 5, 95)}%`);

  if (compact) {
    return (
      <div className="w-full h-10 flex flex-col justify-center">
        <div className="flex justify-between items-center">
          <span className="text-xs text-yacht-secondary">Руль</span>
          <span className="text-sm font-semibold text-yacht-primary">
            {a > 0 ? `+${a.toFixed(0)}` : a.toFixed(0)}°
          </span>
        </div>
        <div className="mt-1 relative h-3">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] rounded bg-yacht-muted/50" />
          <div className="absolute left-1/2 top-0.5 bottom-0.5 w-px bg-yacht-muted" />
          <motion.div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-[3px] h-3 rounded bg-yacht-primary"
            style={{ left: leftPct, boxShadow: '0 0 6px rgba(200,230,255,0.5)' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-end">
        <span className="text-xs text-yacht-secondary">Угол руля</span>
        <span className="text-sm font-semibold text-yacht-primary">
          {a > 0 ? `+${a.toFixed(0)}` : a.toFixed(0)}°
        </span>
      </div>
      <div className="mt-2 relative h-6">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 rounded bg-yacht-muted/50" />
        <div className="absolute left-1/2 top-1 bottom-1 w-px bg-yacht-muted" />
        <motion.div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-[3px] h-5 rounded bg-yacht-primary"
          style={{ left: leftPct, boxShadow: '0 0 8px rgba(200,230,255,0.5)' }}
        />
      </div>
    </div>
  );
});
