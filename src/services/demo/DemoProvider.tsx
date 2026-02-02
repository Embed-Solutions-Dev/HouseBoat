import { useEffect } from 'react';
import { useStore } from '@/stores';

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const updateNavigation = useStore((s) => s.updateNavigation);
  const updateEngine = useStore((s) => s.updateEngine);
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

    // Simulate engine RPM fluctuations
    const engineInterval = setInterval(() => {
      updateEngine('left', {
        rpm: 2350 + Math.sin(Date.now() / 2000) * 50,
      });
      updateEngine('right', {
        rpm: 2410 + Math.sin(Date.now() / 2500) * 50,
      });
    }, 200);

    return () => {
      clearInterval(headingInterval);
      clearInterval(speedInterval);
      clearInterval(engineInterval);
    };
  }, [updateNavigation, updateEngine, setConnectionStatus]);

  return <>{children}</>;
}
