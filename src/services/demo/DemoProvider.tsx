import { useEffect } from 'react';
import { useStore } from '@/stores';
import { ENGINE_CONFIG } from '@/config/constants';

// Engines that are OFF and should not be updated by demo
const OFF_ENGINES: Set<number> = (() => {
  const count = ENGINE_CONFIG.count;
  if (count === 2) return new Set([1]);
  if (count === 4) return new Set([3]);
  return new Set();
})();

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const updateNavigation = useStore((s) => s.updateNavigation);
  const updateEngine = useStore((s) => s.updateEngine);
  const updateFuel = useStore((s) => s.updateFuel);
  const setConnectionStatus = useStore((s) => s.setConnectionStatus);

  useEffect(() => {
    // Set demo mode as "connected"
    setConnectionStatus('connected');

    // Simulate heading changes
    const headingInterval = setInterval(() => {
      updateNavigation({
        heading: 42 + Math.sin(Date.now() / 5000) * 5,
      });
    }, 100);

    // Simulate speed variations
    const speedInterval = setInterval(() => {
      updateNavigation({
        speed: 18.4 + Math.sin(Date.now() / 3000) * 0.5,
      });
    }, 500);

    // Simulate rudder angle changes with pause at center
    let lastCenterTime = 0;
    let isPaused = false;
    const rudderInterval = setInterval(() => {
      const now = Date.now();
      const sinValue = Math.sin(now / 4000);
      const angle = sinValue * 45;

      // Check if passing through center (sin value close to 0)
      if (Math.abs(sinValue) < 0.05 && !isPaused) {
        // Start pause at center
        isPaused = true;
        lastCenterTime = now;
        updateNavigation({ rudderAngle: 0 });
      } else if (isPaused) {
        // Check if 2 seconds have passed
        if (now - lastCenterTime >= 2000) {
          isPaused = false;
        } else {
          // Keep at center
          updateNavigation({ rudderAngle: 0 });
        }
      } else {
        // Normal movement
        updateNavigation({ rudderAngle: angle });
      }
    }, 100);

    // Simulate engine RPM fluctuations (2000-2500)
    // Skip engines that are OFF
    const engineInterval = setInterval(() => {
      const time = Date.now();
      const count = ENGINE_CONFIG.count;
      for (let i = 0; i < count; i++) {
        if (OFF_ENGINES.has(i)) continue;
        updateEngine(i, {
          rpm: 2250 + Math.sin(time / (2000 + i * 300)) * 250,
        });
      }
    }, 200);

    // Cycle left engine fuel: 90% → 40% → 20% → 0% → 90% ...
    const fuelLevels = [360, 160, 80, 0]; // capacity = 400
    let fuelIndex = 0;
    const fuelInterval = setInterval(() => {
      updateFuel({ engine0: { level: fuelLevels[fuelIndex], capacity: 400 } });
      fuelIndex = (fuelIndex + 1) % fuelLevels.length;
    }, 2000);

    // Right engine (index 1) startup animation cycle
    // Cycle: sweep up (1s) → sweep down to idle (1s) → running (5s) → off (3s) = 10s total
    const cycleStart = Date.now();
    const CYCLE_DURATION = 10000; // 10s total
    const SWEEP_UP = 1000;       // 0-1s: needle sweeps 0→3500
    const SWEEP_DOWN = 2000;     // 1-2s: needle drops 3500→800
    const RUNNING_END = 7000;    // 2-7s: running at ~800 RPM
    // 7-10s: off

    const rightEngineInterval = setInterval(() => {
      const elapsed = (Date.now() - cycleStart) % CYCLE_DURATION;

      if (elapsed < SWEEP_UP) {
        // Phase 1: Sweep up 0 → 3500
        const t = elapsed / SWEEP_UP;
        const sweepRpm = t * 3500;
        updateEngine(1, {
          rpm: sweepRpm,
          throttle: 0,
          temperature: Math.round(25 + t * 50),
          oilPressure: Math.round(t * 4),
          gear: 'N',
        });
      } else if (elapsed < SWEEP_DOWN) {
        // Phase 2: Sweep down 3500 → 800
        const t = (elapsed - SWEEP_UP) / (SWEEP_DOWN - SWEEP_UP);
        const sweepRpm = 3500 - t * 2700;
        updateEngine(1, {
          rpm: sweepRpm,
          throttle: 0,
          temperature: 75,
          oilPressure: 4.2,
          gear: 'N',
        });
      } else if (elapsed < RUNNING_END) {
        // Phase 3: Running at idle ~800 RPM with slight fluctuations
        const time = Date.now();
        updateEngine(1, {
          rpm: 800 + Math.sin(time / 1500) * 50,
          throttle: 12,
          temperature: Math.round(75 + Math.sin(time / 4000) * 3),
          oilPressure: 4.2,
          gear: 'N',
        });
      } else {
        // Phase 4: Off
        updateEngine(1, {
          rpm: 0,
          throttle: 0,
          temperature: 75,
          oilPressure: 4.2,
          gear: 'N',
        });
      }
    }, 50);

    return () => {
      clearInterval(headingInterval);
      clearInterval(speedInterval);
      clearInterval(rudderInterval);
      clearInterval(engineInterval);
      clearInterval(fuelInterval);
      clearInterval(rightEngineInterval);
    };
  }, [updateNavigation, updateEngine, updateFuel, setConnectionStatus]);

  return <>{children}</>;
}
