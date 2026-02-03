import { memo } from 'react';
import { useStore } from '@/stores';
import { Power, LightRunning, LightParking, Generator, BowThruster, Navigation, Anchor } from '@/components/icons';

const T = {
  textSecondary: '#7a95a8',
  textMuted: '#4a6070',
  textGreen: '#3dc88c',
  textRed: '#e04050',
  navBlue: '#50a0ff',
};

const controlItems = [
  { key: 'power', label: 'Питание', Icon: Power },
  { key: 'runLight', label: 'Ходовые', Icon: LightRunning },
  { key: 'parkLight', label: 'Стоян. огонь', Icon: LightParking },
  { key: 'navigation', label: 'Навигация', Icon: Navigation },
  { key: 'thruster', label: 'Подрулька', Icon: BowThruster },
  { key: 'anchor', label: 'Якорь', Icon: Anchor },
  { key: 'generator', label: 'Генератор', Icon: Generator },
] as const;

export const ControlsPanel = memo(function ControlsPanel() {
  const controls = useStore((s) => s.controls);
  const togglePower = useStore((s) => s.togglePower);
  const toggleLight = useStore((s) => s.toggleLight);
  const toggleBowThruster = useStore((s) => s.toggleBowThruster);
  const toggleGenerator = useStore((s) => s.toggleGenerator);
  const toggleNavigation = useStore((s) => s.toggleNavigation);

  const handleClick = (key: string) => {
    switch (key) {
      case 'power':
        togglePower();
        break;
      case 'runLight':
        toggleLight('running');
        break;
      case 'parkLight':
        toggleLight('parking');
        break;
      case 'navigation':
        toggleNavigation();
        break;
      case 'thruster':
        toggleBowThruster();
        break;
      case 'generator':
        toggleGenerator();
        break;
      case 'anchor':
        // TODO: open anchor modal
        break;
    }
  };

  const getButtonState = (key: string): boolean => {
    switch (key) {
      case 'power':
        return controls.power;
      case 'runLight':
        return controls.lights.running;
      case 'parkLight':
        return controls.lights.parking;
      case 'navigation':
        return controls.navigation;
      case 'thruster':
        return controls.bowThruster;
      case 'generator':
        return controls.generator;
      case 'anchor':
        return false;
      default:
        return false;
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, rgba(12,18,28,0.95) 0%, rgba(6,10,18,0.98) 100%)',
        borderRadius: 20,
        border: '1px solid rgba(60,80,100,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(100,130,160,0.08)',
        overflow: 'hidden',
      }}
    >
      {/* Top shine */}
      <div
        style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent 10%, rgba(120,150,180,0.15) 50%, transparent 90%)',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        {controlItems.map((item, idx) => {
          const { key, label, Icon } = item;
          const isOn = getButtonState(key);
          const isNavigation = key === 'navigation';
          const buttonColor = isNavigation ? T.navBlue : T.textGreen;

          return (
            <div key={key} style={{ display: 'flex', flex: 1 }}>
              <button
                onClick={() => handleClick(key)}
                style={{
                  flex: 1,
                  height: 72,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  border: 'none',
                  background: isOn
                    ? isNavigation
                      ? 'linear-gradient(180deg, rgba(40,80,140,0.3) 0%, rgba(20,50,100,0.2) 100%)'
                      : 'linear-gradient(180deg, rgba(40,100,80,0.3) 0%, rgba(20,60,50,0.2) 100%)'
                    : 'transparent',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {/* Active indicator line */}
                {isOn && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 6,
                      left: '20%',
                      right: '20%',
                      height: 2,
                      background: buttonColor,
                      boxShadow: `0 0 12px ${isNavigation ? 'rgba(80,160,255,0.8)' : 'rgba(61,200,140,0.8)'}`,
                      borderRadius: 1,
                    }}
                  />
                )}

                <Icon
                  style={{
                    width: 24,
                    height: 24,
                    color: isOn ? buttonColor : T.textSecondary,
                  }}
                />

                <span
                  style={{
                    fontSize: 11,
                    color: isOn ? buttonColor : T.textMuted,
                    fontWeight: 500,
                    marginTop: -2,
                  }}
                >
                  {label}
                </span>
              </button>

              {/* Divider */}
              {idx < controlItems.length - 1 && (
                <div
                  style={{
                    width: 1,
                    background: 'linear-gradient(180deg, transparent 10%, rgba(80,100,120,0.3) 50%, transparent 90%)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
