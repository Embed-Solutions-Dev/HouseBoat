import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/stores';

const T = {
  textPrimary: '#e8f4ff',
  textSecondary: '#7a95a8',
  textMuted: '#4a6070',
  textGreen: '#3dc88c',
  textRed: '#e04050',
  speedGold: '#d4af65',
};

export const SpeedWidget = memo(function SpeedWidget() {
  const speed = useStore((s) => s.navigation.speed);
  const navMode = useStore((s) => s.controls.navigation);
  const expandedEngine = useStore((s) => s.expandedEngine);
  const setExpandedEngine = useStore((s) => s.setExpandedEngine);

  const leftEngine = useStore((s) => s.engines.left);
  const rightEngine = useStore((s) => s.engines.right);

  const collapsedWidth = 230;
  const collapsedHeight = 127;
  const expandedWidth = 580;
  const expandedHeight = 300;

  const currentEngine = expandedEngine === 'Left' ? leftEngine : rightEngine;
  const hasExpandedFaults = expandedEngine ? currentEngine.errors.length > 0 : false;
  const actualExpandedWidth = hasExpandedFaults ? expandedWidth : 380;

  return (
    <div style={{ position: 'relative', width: collapsedWidth, height: collapsedHeight }}>
      {/* Backdrop for closing */}
      {expandedEngine && (
        <div
          onClick={() => setExpandedEngine(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 29,
          }}
        />
      )}

      <motion.div
        animate={{
          width: expandedEngine ? actualExpandedWidth : collapsedWidth,
          height: expandedEngine ? expandedHeight : collapsedHeight,
          x: expandedEngine ? -actualExpandedWidth / 2 : -collapsedWidth / 2,
          y: expandedEngine ? -expandedHeight / 2 - 60 : navMode ? 22 : -collapsedHeight / 2,
          scale: navMode && !expandedEngine ? 0.6 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: collapsedWidth,
          height: collapsedHeight,
          borderRadius: 28,
          background: 'linear-gradient(145deg, rgba(15,22,35,0.97) 0%, rgba(8,12,22,0.98) 50%, rgba(5,8,15,1) 100%)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4), inset 0 1px 1px rgba(100,140,200,0.1), inset 0 -2px 10px rgba(0,0,0,0.5)',
          border: '1px solid rgba(80,100,130,0.2)',
          overflow: 'hidden',
          zIndex: expandedEngine ? 30 : 2,
          cursor: 'pointer',
        }}
        onClick={() => !expandedEngine && setExpandedEngine('Left')}
      >
        {/* Inner shadow */}
        <div
          style={{
            position: 'absolute',
            inset: 4,
            borderRadius: 24,
            boxShadow: 'inset 0 6px 20px rgba(0,0,0,0.8), inset 0 2px 8px rgba(0,5,15,0.5)',
            pointerEvents: 'none',
          }}
        />

        {/* Top gloss */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 12,
            right: 12,
            height: 40,
            borderRadius: '0 0 50% 50%',
            background: 'linear-gradient(180deg, rgba(180,210,255,0.12) 0%, rgba(150,180,220,0.05) 40%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: expandedEngine ? 'flex-start' : 'center',
            padding: expandedEngine ? '28px 32px 24px' : 0,
          }}
        >
          <AnimatePresence mode="wait">
            {expandedEngine ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ width: '100%', height: '100%' }}
              >
                {/* Engine title */}
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: hasExpandedFaults ? T.textRed : T.textSecondary,
                    marginBottom: 36,
                    textAlign: 'center',
                  }}
                >
                  {expandedEngine === 'Left' ? 'Левый' : 'Правый'} двигатель
                </div>

                {/* Engine selector tabs */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
                  {(['Left', 'Right'] as const).map((side) => (
                    <button
                      key={side}
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedEngine(side);
                      }}
                      style={{
                        padding: '8px 20px',
                        borderRadius: 12,
                        border: expandedEngine === side ? '1px solid rgba(212,175,101,0.5)' : '1px solid rgba(80,100,130,0.3)',
                        background: expandedEngine === side ? 'rgba(212,175,101,0.15)' : 'rgba(40,50,60,0.3)',
                        color: expandedEngine === side ? T.speedGold : T.textSecondary,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      {side === 'Left' ? 'Левый' : 'Правый'}
                    </button>
                  ))}
                </div>

                {/* Engine metrics */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px 24px',
                    alignContent: 'start',
                  }}
                >
                  <MetricItem label="ОБ/МИН" value={currentEngine.rpm.toLocaleString()} gold />
                  <MetricItem label="ГАЗ" value={`${currentEngine.throttle}%`} />
                  <MetricItem label="ТЕМП." value={`${currentEngine.temperature}°C`} ok />
                  <MetricItem label="МАСЛО" value="ОК" ok />
                  <MetricItem label="ПЕР." value={currentEngine.gear} />
                  <MetricItem label="ДАВЛ." value={`${currentEngine.oilPressure}`} ok />
                </div>

                {/* Errors if any */}
                {currentEngine.errors.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <div style={{ fontSize: 11, color: T.textRed, fontWeight: 600, marginBottom: 8 }}>
                      ОШИБКИ ({currentEngine.errors.length})
                    </div>
                    {currentEngine.errors.map((error, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '10px 14px',
                          background: 'rgba(224,64,80,0.12)',
                          border: '1px solid rgba(224,64,80,0.25)',
                          borderRadius: 10,
                          fontSize: 12,
                          color: T.textRed,
                          marginBottom: 8,
                        }}
                      >
                        {error.code} - {error.message}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ textAlign: 'center' }}
              >
                <div
                  style={{
                    fontSize: 56,
                    fontWeight: 400,
                    color: T.speedGold,
                    textShadow: '0 0 30px rgba(212,175,101,0.4), 0 0 60px rgba(212,175,101,0.2)',
                    letterSpacing: -2,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {speed.toFixed(1)}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'rgba(212,175,101,0.5)',
                    letterSpacing: 3,
                    marginTop: 2,
                  }}
                >
                  км/ч
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Border overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 28,
            border: '1px solid rgba(150,180,220,0.08)',
            pointerEvents: 'none',
          }}
        />
      </motion.div>

      {/* Houseboat logo - fades out in nav mode */}
      <motion.div
        animate={{ opacity: navMode ? 0 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'absolute',
          bottom: -66,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 5,
        }}
      >
        <svg width="75" height="48" viewBox="600 -100 1620 750" style={{ opacity: 0.6 }}>
          <path
            fill="#2a3a4a"
            d="M1798.09 319.87c-4.35,-12.65 -31.56,-22.61 -26.42,-5.52 2.53,29.43 7.74,74.72 -23.19,131.9 -34.39,29.27 5.18,34.93 43.53,16.19 64.03,-24.99 12.21,-119.88 6.08,-142.57zm-498.41 -195.06l0 0 -0.42 0 0 54.51 47.15 0c-0.78,-30.15 -21.5,-54.51 -46.73,-54.51zm-17.11 0.05l0 0c-24.28,1.3 -43.89,25.15 -44.65,54.46l44.65 0 0 -54.46zm-44.67 74.57l0 0 0 51 44.67 0 0 -51 -44.67 0zm61.36 51l0 0 47.17 0 0 -51 -47.17 0 0 51zm488.43 -118.7l0 0c-75.64,39.65 -105.96,79.31 -167.43,107.06 -14.5,6.53 -30.65,12.67 -48.33,18.34l0 -102.15c0,-34.71 -28.38,-63.1 -63.09,-63.1 -34.71,0 -63.1,28.39 -63.1,63.1l0 130.53c-114.9,17.14 -260.31,19.42 -421.05,-2.18 209.11,99.93 576.41,33.58 705.24,-76.57 38.48,-32.89 101.67,-75.25 149.43,-91.4 151.13,-55.09 221.23,-5.03 260.55,84.96 -7.9,31.59 -71.1,31.12 -109.89,46.44 -109.8,30.41 -134.33,31.14 -244.26,11.66 -12.86,-0.26 -32.74,10.03 -27.17,24.4 10.58,216.03 -71.36,208.7 -255.45,232.26 -61.99,2.97 -1.08,-78.65 13.4,-87.72 46.13,-48.5 75.84,-52.86 86.21,-69.64 14.88,-26.72 3.03,-38.46 -31.76,-15.84 -142.22,60.11 -308.64,63.74 -496.17,18.12 -193.15,147.77 -382.49,16.88 -304.72,-13.59 67.62,-23.73 138.17,-42.34 211.83,-55.51l-26.05 -41.91c50.95,-25.54 95,-62.9 135.37,-106.56 212.3,-195.78 446.39,-180.44 696.44,-10.7z"
          />
        </svg>
      </motion.div>
    </div>
  );
});

interface MetricItemProps {
  label: string;
  value: string;
  gold?: boolean;
  ok?: boolean;
}

const MetricItem = memo(function MetricItem({ label, value, gold, ok }: MetricItemProps) {
  return (
    <div style={{ textAlign: 'center', minWidth: 80 }}>
      <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>{label}</div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 600,
          color: gold ? T.speedGold : ok ? T.textGreen : T.textPrimary,
          textShadow: gold ? '0 0 20px rgba(212,175,101,0.3)' : undefined,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
    </div>
  );
});
