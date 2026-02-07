import { memo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/stores';

export const RudderWidget = memo(function RudderWidget() {
  const setRudderAngle = useStore((s) => s.setRudderAngle);
  const [rudderAngle, setLocalRudderAngle] = useState(-45);

  // Animate rudder from left (-45) to right (45) and back
  useEffect(() => {
    let angle = -45;
    let direction = 1;

    const interval = setInterval(() => {
      angle += direction * 1.5;

      if (angle >= 45) {
        angle = 45;
        direction = -1;
      } else if (angle <= -45) {
        angle = -45;
        direction = 1;
      }

      setLocalRudderAngle(angle);
      setRudderAngle(angle);
    }, 50);

    return () => clearInterval(interval);
  }, [setRudderAngle]);

  return (
    <div
      style={{
        width: 135,
        height: 135,
        borderRadius: '50%',
        background: 'linear-gradient(165deg, #e8e8e8 0%, #b8b8b8 15%, #909090 30%, #707070 50%, #909090 70%, #b8b8b8 85%, #a0a0a0 100%)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
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
        {/* Tick marks */}
        <svg viewBox="0 0 100 100" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          {Array.from({ length: 19 }).map((_, i) => {
            const deg = -45 + i * 5;
            const angle = ((deg + 90) * Math.PI) / 180;
            const isCenter = deg === 0;
            const isMajor = deg % 15 === 0;
            const r1 = isCenter ? 34 : isMajor ? 38 : 40;
            const r2 = 46;
            return (
              <line
                key={i}
                x1={50 + r1 * Math.cos(angle)}
                y1={50 + r1 * Math.sin(angle)}
                x2={50 + r2 * Math.cos(angle)}
                y2={50 + r2 * Math.sin(angle)}
                stroke={isCenter ? '#e04050' : isMajor ? 'rgba(200,210,230,0.8)' : 'rgba(150,160,180,0.4)'}
                strokeWidth={isCenter ? 2.5 : isMajor ? 2 : 1}
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* Boat silhouette */}
        <svg
          viewBox="0 0 24 32"
          style={{
            position: 'absolute',
            top: 22,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 33,
            height: 45,
            opacity: 0.35,
          }}
        >
          <path d="M12 1 L18 8 L19 22 Q12 30 5 22 L6 8 Z" fill="rgba(150,180,210,0.6)" stroke="rgba(150,180,210,0.8)" strokeWidth="0.5" />
          <ellipse cx="12" cy="14" rx="4" ry="6" fill="rgba(100,130,160,0.5)" />
        </svg>

        {/* Rudder needle - rotates from center */}
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 4,
            height: 42,
            marginLeft: -2,
            marginTop: 2,
            background: 'linear-gradient(90deg, #a03040 0%, #d04050 25%, #e85060 50%, #d04050 75%, #a03040 100%)',
            borderRadius: 2,
            transformOrigin: 'center top',
            boxShadow: '0 0 8px rgba(224,80,96,0.5)',
          }}
          animate={{ rotate: rudderAngle }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        />

        {/* Center hub - on top of needle */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #d0d0d0 30%, #909090 70%, #606060 100%)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
            zIndex: 2,
          }}
        />
      </div>
    </div>
  );
});
