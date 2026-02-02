import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SPLASH_LOGO_DURATION, SPLASH_TRANSITION_DURATION } from '@/config/constants';
import { Dashboard } from './layouts/Dashboard';

type Phase = 'logo' | 'transition' | 'ready';

export function App() {
  const [phase, setPhase] = useState<Phase>('logo');

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('transition'), SPLASH_LOGO_DURATION);
    const timer2 = setTimeout(
      () => setPhase('ready'),
      SPLASH_LOGO_DURATION + SPLASH_TRANSITION_DURATION
    );

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="min-h-screen bg-yacht-gradient">
      <AnimatePresence mode="wait">
        {phase !== 'ready' ? (
          <SplashScreen key="splash" phase={phase} />
        ) : (
          <Dashboard key="dashboard" />
        )}
      </AnimatePresence>
    </div>
  );
}

function SplashScreen({ phase }: { phase: Phase }) {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-yacht-gradient"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="text-center"
        animate={{ opacity: phase === 'transition' ? 0 : 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-5xl font-bold text-yacht-primary mb-4">
          HouseBoat
        </h1>
        <p className="text-yacht-secondary">Dashboard v2.0</p>
      </motion.div>
    </motion.div>
  );
}
