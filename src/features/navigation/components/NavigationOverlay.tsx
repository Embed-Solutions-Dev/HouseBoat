import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/stores';

export const NavigationOverlay = memo(function NavigationOverlay() {
  const navigation = useStore((s) => s.controls.navigation);

  return (
    <AnimatePresence>
      {navigation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            maxWidth: 1048,
            height: 650,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          <div style={{ width: '100%', position: 'relative', overflow: 'hidden' }}>
            <div
              style={{
                overflow: 'hidden',
                height: 650,
                position: 'relative',
                WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 70%)',
                maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 70%)',
              }}
            >
              {/* Animated map */}
              <motion.div
                animate={{ y: [0, 200] }}
                transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'absolute',
                  top: -300,
                  left: -200,
                  width: 'calc(100% + 400px)',
                  height: 'calc(100% + 650px)',
                }}
              >
                <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                  <defs>
                    <pattern id="gridPatternNav" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(40,70,100,0.05)" strokeWidth="0.5" />
                    </pattern>
                    <pattern id="gridPatternLargeNav" width="150" height="150" patternUnits="userSpaceOnUse">
                      <path d="M 150 0 L 0 0 0 150" fill="none" stroke="rgba(40,70,100,0.08)" strokeWidth="0.5" />
                    </pattern>
                  </defs>

                  {/* Grid */}
                  <rect width="100%" height="100%" fill="url(#gridPatternNav)" />
                  <rect width="100%" height="100%" fill="url(#gridPatternLargeNav)" />

                  {/* Main river */}
                  <path
                    d="M 760 -100 C 730 50 720 150 740 300 C 760 450 710 550 720 700 C 730 850 750 1000 740 1150 C 730 1300 760 1400 750 1550"
                    fill="none"
                    stroke="rgba(25,45,70,0.35)"
                    strokeWidth="80"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 760 -100 C 730 50 720 150 740 300 C 760 450 710 550 720 700 C 730 850 750 1000 740 1150 C 730 1300 760 1400 750 1550"
                    fill="none"
                    stroke="rgba(20,38,60,0.5)"
                    strokeWidth="50"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 760 -100 C 730 50 720 150 740 300 C 760 450 710 550 720 700 C 730 850 750 1000 740 1150 C 730 1300 760 1400 750 1550"
                    fill="none"
                    stroke="rgba(15,30,50,0.6)"
                    strokeWidth="25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Left tributary */}
                  <path
                    d="M 150 280 C 250 290 350 320 450 330 C 550 340 650 370 730 410"
                    fill="none"
                    stroke="rgba(25,45,70,0.3)"
                    strokeWidth="45"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 150 280 C 250 290 350 320 450 330 C 550 340 650 370 730 410"
                    fill="none"
                    stroke="rgba(20,38,60,0.45)"
                    strokeWidth="28"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Right tributary top */}
                  <path
                    d="M 1250 80 C 1150 120 1050 160 950 200 C 850 240 820 300 780 360"
                    fill="none"
                    stroke="rgba(25,45,70,0.3)"
                    strokeWidth="40"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 1250 80 C 1150 120 1050 160 950 200 C 850 240 820 300 780 360"
                    fill="none"
                    stroke="rgba(20,38,60,0.45)"
                    strokeWidth="24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Left lake */}
                  <ellipse cx="300" cy="650" rx="120" ry="80" fill="rgba(20,38,60,0.4)" />
                  <ellipse cx="300" cy="650" rx="90" ry="55" fill="rgba(15,30,50,0.5)" />

                  {/* Small lake */}
                  <ellipse cx="1100" cy="500" rx="70" ry="50" fill="rgba(20,38,60,0.35)" />
                  <ellipse cx="1100" cy="500" rx="50" ry="32" fill="rgba(15,30,50,0.45)" />

                  {/* Lake tributary */}
                  <path
                    d="M 380 640 C 450 620 530 610 600 630 C 670 650 720 710 760 780"
                    fill="none"
                    stroke="rgba(25,45,70,0.25)"
                    strokeWidth="30"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 380 640 C 450 620 530 610 600 630 C 670 650 720 710 760 780"
                    fill="none"
                    stroke="rgba(20,38,60,0.4)"
                    strokeWidth="18"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Right tributary bottom */}
                  <path
                    d="M 1200 780 C 1100 790 1000 800 900 830 C 800 860 790 920 780 990"
                    fill="none"
                    stroke="rgba(25,45,70,0.28)"
                    strokeWidth="35"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 1200 780 C 1100 790 1000 800 900 830 C 800 860 790 920 780 990"
                    fill="none"
                    stroke="rgba(20,38,60,0.42)"
                    strokeWidth="20"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Small pond */}
                  <ellipse cx="500" cy="900" rx="45" ry="35" fill="rgba(20,38,60,0.35)" />

                  {/* Route - dashed */}
                  <path
                    d="M 720 -50 C 700 100 710 250 715 400 C 720 550 705 700 710 850 C 715 1000 720 1150 712 1300 C 705 1450 718 1500 715 1600"
                    fill="none"
                    stroke="rgba(100,160,220,0.3)"
                    strokeWidth="2"
                    strokeDasharray="12 8"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.div>

              {/* Boat icon with radar circles */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Expanding radar circles */}
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [0.5, 4],
                      opacity: [0, 0.5, 0.3, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'linear',
                      delay: i * 1,
                      times: [0, 0.1, 0.5, 1],
                    }}
                    style={{
                      position: 'absolute',
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      border: '1px solid rgba(80,160,255,0.6)',
                      pointerEvents: 'none',
                    }}
                  />
                ))}

                {/* Boat triangle */}
                <div style={{ filter: 'drop-shadow(0 0 20px rgba(80,160,255,0.5))' }}>
                  <svg width="32" height="40" viewBox="0 0 32 40">
                    <defs>
                      <linearGradient id="glassGradNav" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(120,180,255,0.85)" />
                        <stop offset="50%" stopColor="rgba(80,140,220,0.65)" />
                        <stop offset="100%" stopColor="rgba(60,120,200,0.75)" />
                      </linearGradient>
                    </defs>
                    <path d="M 16 2 L 30 36 L 16 30 L 2 36 Z" fill="url(#glassGradNav)" stroke="rgba(150,200,255,0.7)" strokeWidth="1" />
                    {/* Highlight */}
                    <path d="M 16 6 L 12 28 L 16 26 Z" fill="rgba(200,230,255,0.25)" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Scale - bottom left */}
            <div
              style={{
                position: 'absolute',
                bottom: 60,
                left: 40,
                zIndex: 10,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div
                  style={{
                    width: 80,
                    height: 4,
                    background: 'rgba(150,180,210,0.6)',
                    borderRadius: 2,
                    position: 'relative',
                  }}
                >
                  <div style={{ position: 'absolute', left: 0, top: -2, width: 2, height: 8, background: 'rgba(150,180,210,0.6)' }} />
                  <div style={{ position: 'absolute', right: 0, top: -2, width: 2, height: 8, background: 'rgba(150,180,210,0.6)' }} />
                </div>
                <span style={{ fontSize: 9, color: 'rgba(150,180,210,0.7)', fontWeight: 500 }}>500 м</span>
              </div>
            </div>

            {/* Coordinates - bottom right */}
            <div
              style={{
                position: 'absolute',
                bottom: 60,
                right: 40,
                zIndex: 10,
                textAlign: 'right',
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontFamily: 'monospace',
                  color: 'rgba(150,180,210,0.7)',
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              >
                <div>52°22&apos;14.3&quot;N</div>
                <div>4°53&apos;28.7&quot;E</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
