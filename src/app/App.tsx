import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Dashboard } from './layouts/Dashboard';
import { DemoProvider } from '@/services/demo';

type Phase = 'logo' | 'transition' | 'systemCheck' | 'done';

const systemCheckItems = [
  { label: 'Двигатели', delay: 0 },
  { label: 'Топливная система', delay: 0.3 },
  { label: 'Электрика', delay: 0.6 },
  { label: 'Навигация', delay: 0.9 },
  { label: 'Камеры', delay: 1.2 },
  { label: 'Связь', delay: 1.5 },
];

export function App() {
  const [phase, setPhase] = useState<Phase>('logo');
  const [checkedItems, setCheckedItems] = useState<number[]>([]);

  useEffect(() => {
    // Phase transitions
    const t1 = setTimeout(() => setPhase('transition'), 1800);
    const t2 = setTimeout(() => setPhase('systemCheck'), 2400);
    const t3 = setTimeout(() => setPhase('done'), 5000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  useEffect(() => {
    if (phase === 'systemCheck') {
      systemCheckItems.forEach((item, idx) => {
        setTimeout(() => {
          setCheckedItems((prev) => [...prev, idx]);
        }, item.delay * 1000 + 200);
      });
    }
  }, [phase]);

  return (
    <DemoProvider>
      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(ellipse at 50% 30%, #0f1a25 0%, #080d12 50%, #000 100%)',
        }}
      >
        <AnimatePresence mode="wait">
          {phase !== 'done' ? (
            <motion.div
              key="splash"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(ellipse at 50% 30%, #0f1a25 0%, #080d12 50%, #000 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
              }}
            >
              {/* System check panel */}
              {phase === 'systemCheck' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    position: 'absolute',
                    width: 320,
                    padding: 24,
                    background: 'linear-gradient(180deg, rgba(12,18,28,0.95) 0%, rgba(6,10,18,0.98) 100%)',
                    borderRadius: 20,
                    border: '1px solid rgba(60,80,100,0.3)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                  }}
                >
                  <div style={{ marginBottom: 20, textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#7a95a8', letterSpacing: 2, fontWeight: 500 }}>
                      ПРОВЕРКА СИСТЕМ
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {systemCheckItems.map((item, idx) => {
                      const isChecked = checkedItems.includes(idx);
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: item.delay, duration: 0.3 }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            background: 'rgba(30,45,60,0.4)',
                            border: `1px solid ${isChecked ? 'rgba(61,200,140,0.4)' : 'rgba(80,100,120,0.3)'}`,
                            borderRadius: 10,
                          }}
                        >
                          <span style={{ fontSize: 13, color: '#e8f4ff' }}>{item.label}</span>
                          {isChecked ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3dc88c" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="m9 12 2 2 4-4" />
                              </svg>
                            </motion.div>
                          ) : (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              style={{ width: 16, height: 16 }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7a95a8" strokeWidth="2">
                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                              </svg>
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={
                  phase === 'transition' || phase === 'systemCheck'
                    ? { opacity: 0, scale: 0.9 }
                    : { opacity: 1, scale: 1 }
                }
                transition={{ duration: phase === 'transition' ? 0.6 : 0.8, ease: 'easeOut' }}
                style={{
                  position: phase === 'systemCheck' ? 'absolute' : 'relative',
                  marginTop: -20,
                }}
              >
                <svg width="280" height="180" viewBox="600 -100 1620 750" style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="loadingLogoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#5a6a7a" />
                      <stop offset="50%" stopColor="#3a4a5a" />
                      <stop offset="100%" stopColor="#2a3a4a" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                    fill="url(#loadingLogoGradient)"
                    stroke="rgba(100,130,160,0.3)"
                    strokeWidth="2"
                    d="M1798.09 319.87c-4.35,-12.65 -31.56,-22.61 -26.42,-5.52 2.53,29.43 7.74,74.72 -23.19,131.9 -34.39,29.27 5.18,34.93 43.53,16.19 64.03,-24.99 12.21,-119.88 6.08,-142.57zm-498.41 -195.06l0 0 -0.42 0 0 54.51 47.15 0c-0.78,-30.15 -21.5,-54.51 -46.73,-54.51zm-17.11 0.05l0 0c-24.28,1.3 -43.89,25.15 -44.65,54.46l44.65 0 0 -54.46zm-44.67 74.57l0 0 0 51 44.67 0 0 -51 -44.67 0zm61.36 51l0 0 47.17 0 0 -51 -47.17 0 0 51zm488.43 -118.7l0 0c-75.64,39.65 -105.96,79.31 -167.43,107.06 -14.5,6.53 -30.65,12.67 -48.33,18.34l0 -102.15c0,-34.71 -28.38,-63.1 -63.09,-63.1 -34.71,0 -63.1,28.39 -63.1,63.1l0 130.53c-114.9,17.14 -260.31,19.42 -421.05,-2.18 209.11,99.93 576.41,33.58 705.24,-76.57 38.48,-32.89 101.67,-75.25 149.43,-91.4 151.13,-55.09 221.23,-5.03 260.55,84.96 -7.9,31.59 -71.1,31.12 -109.89,46.44 -109.8,30.41 -134.33,31.14 -244.26,11.66 -12.86,-0.26 -32.74,10.03 -27.17,24.4 10.58,216.03 -71.36,208.7 -255.45,232.26 -61.99,2.97 -1.08,-78.65 13.4,-87.72 46.13,-48.5 75.84,-52.86 86.21,-69.64 14.88,-26.72 3.03,-38.46 -31.76,-15.84 -142.22,60.11 -308.64,63.74 -496.17,18.12 -193.15,147.77 -382.49,16.88 -304.72,-13.59 67.62,-23.73 138.17,-42.34 211.83,-55.51l-26.05 -41.91c50.95,-25.54 95,-62.9 135.37,-106.56 212.3,-195.78 446.39,-180.44 696.44,-10.7z"
                  />
                </svg>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  style={{ textAlign: 'center', marginTop: 16 }}
                >
                  <div style={{ fontSize: 28, fontWeight: 300, color: '#7a95a8', letterSpacing: 8 }}>HOUSEBOAT</div>
                  <div style={{ fontSize: 11, color: '#4a6070', letterSpacing: 3, marginTop: 8 }}>DASHBOARD v2.0</div>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <Dashboard key="dashboard" />
          )}
        </AnimatePresence>
      </div>
    </DemoProvider>
  );
}
