import { useEffect } from 'react';
import { useStore } from '@/stores';

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const updateNavigation = useStore((s) => s.updateNavigation);
  const updateEngine = useStore((s) => s.updateEngine);
  const setConnectionStatus = useStore((s) => s.setConnectionStatus);

  useEffect(() => {
    // Set demo mode as "connected"
    setConnectionStatus('connected');

    // Turn off Engine 3 (Правый двигатель 2)
    updateEngine(3, {
      rpm: 0,
      throttle: 0,
    });

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
      const angle = sinValue * 30;

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
    // Engine 3 (Правый двигатель 2) is OFF
    const engineInterval = setInterval(() => {
      const time = Date.now();
      updateEngine(0, {
        rpm: 2250 + Math.sin(time / 2000) * 250,
      });
      updateEngine(1, {
        rpm: 2250 + Math.sin(time / 2300) * 250,
      });
      updateEngine(2, {
        rpm: 2250 + Math.sin(time / 2600) * 250,
      });
      // Engine 3 stays at initial state (OFF)
    }, 200);

    return () => {
      clearInterval(headingInterval);
      clearInterval(speedInterval);
      clearInterval(rudderInterval);
      clearInterval(engineInterval);
    };
  }, [updateNavigation, updateEngine, setConnectionStatus]);

  return <>{children}</>;
}
