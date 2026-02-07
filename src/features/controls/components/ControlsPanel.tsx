import { memo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/stores';
import { Power, LightRunning, LightParking, Generator, BowThruster, Navigation, Anchor, ChevronUp, ChevronDown } from '@/components/icons';

const T = {
  textPrimary: '#e8f4ff',
  textSecondary: '#7a95a8',
  textMuted: '#4a6070',
  textGreen: '#3dc88c',
  textRed: '#e04050',
  navBlue: '#50a0ff',
  amber: '#e8a030',
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
  const [anchorPopupOpen, setAnchorPopupOpen] = useState(false);
  const anchorButtonRef = useRef<HTMLButtonElement>(null);

  const controls = useStore((s) => s.controls);
  const togglePower = useStore((s) => s.togglePower);
  const toggleLight = useStore((s) => s.toggleLight);
  const toggleBowThruster = useStore((s) => s.toggleBowThruster);
  const toggleGenerator = useStore((s) => s.toggleGenerator);
  const toggleNavigation = useStore((s) => s.toggleNavigation);
  const anchor = useStore((s) => s.systems.anchor);
  const setAnchorPosition = useStore((s) => s.setAnchorPosition);

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
        setAnchorPopupOpen(!anchorPopupOpen);
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
        return anchor.deployed;
      default:
        return false;
    }
  };

  const handleAnchorUp = () => {
    const newPos = Math.max(0, anchor.position - 10);
    setAnchorPosition(newPos);
  };

  const handleAnchorDown = () => {
    const newPos = Math.min(100, anchor.position + 10);
    setAnchorPosition(newPos);
  };

  // Close popup when clicking outside
  useEffect(() => {
    if (!anchorPopupOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.anchor-popup') && !target.closest('.anchor-button')) {
        setAnchorPopupOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [anchorPopupOpen]);

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, rgba(12,18,28,0.95) 0%, rgba(6,10,18,0.98) 100%)',
        borderRadius: 20,
        border: '1px solid rgba(60,80,100,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(100,130,160,0.08)',
        overflow: 'visible',
        position: 'relative',
      }}
    >
      <div
        style={{
          borderRadius: 20,
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
          const isAnchor = key === 'anchor';
          const buttonColor = isNavigation ? T.navBlue : isAnchor && isOn ? T.amber : T.textGreen;

          return (
            <div key={key} style={{ display: 'flex', flex: 1, position: 'relative' }}>
              <button
                ref={isAnchor ? anchorButtonRef : undefined}
                className={isAnchor ? 'anchor-button' : undefined}
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
                      : isAnchor
                        ? 'linear-gradient(180deg, rgba(140,100,40,0.3) 0%, rgba(100,70,20,0.2) 100%)'
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
                      boxShadow: `0 0 12px ${isNavigation ? 'rgba(80,160,255,0.8)' : isAnchor ? 'rgba(232,160,48,0.8)' : 'rgba(61,200,140,0.8)'}`,
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

      {/* Anchor Popup - outside overflow:hidden */}
      <AnimatePresence>
        {anchorPopupOpen && (
          <motion.div
            className="anchor-popup"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              bottom: '100%',
              right: 'calc((100% / 7) / 2)',
              transform: 'translateX(50%)',
              marginBottom: 8,
              background: 'linear-gradient(180deg, rgba(12,18,28,0.98) 0%, rgba(6,10,18,0.99) 100%)',
              borderRadius: 16,
              border: '1px solid rgba(80,100,120,0.3)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              padding: 24,
              width: 280,
              zIndex: 100,
            }}
          >
            {/* Arrow */}
            <div
              style={{
                position: 'absolute',
                bottom: -6,
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                width: 12,
                height: 12,
                background: 'rgba(6,10,18,0.99)',
                border: '1px solid rgba(80,100,120,0.3)',
                borderTop: 'none',
                borderLeft: 'none',
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: T.textPrimary }}>Якорь</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                {/* Up button */}
                <button
                  onClick={handleAnchorUp}
                  disabled={anchor.position <= 0}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    border: '1px solid rgba(80,100,120,0.3)',
                    background: 'rgba(30,45,60,0.5)',
                    cursor: anchor.position <= 0 ? 'not-allowed' : 'pointer',
                    opacity: anchor.position <= 0 ? 0.4 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChevronUp style={{ width: 28, height: 28, color: T.textPrimary }} />
                </button>

                {/* Visual anchor shaft */}
                <div
                  style={{
                    width: 80,
                    height: 200,
                    background: 'rgba(20,30,45,0.8)',
                    borderRadius: 12,
                    border: '1px solid rgba(80,100,120,0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Water level indicator */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '15%',
                      background: 'linear-gradient(180deg, rgba(40,80,120,0.3) 0%, transparent 100%)',
                      borderBottom: '1px dashed rgba(80,140,200,0.3)',
                    }}
                  />

                  {/* Chain */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 16,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 6,
                      height: `${Math.max(0, anchor.position * 0.65)}%`,
                      background: `repeating-linear-gradient(
                        180deg,
                        ${T.textMuted} 0px,
                        ${T.textMuted} 5px,
                        transparent 5px,
                        transparent 10px
                      )`,
                      transition: 'height 0.3s ease',
                    }}
                  />

                  {/* Anchor icon */}
                  <motion.div
                    animate={{
                      top: `${8 + anchor.position * 0.65}%`,
                    }}
                    transition={{ type: 'spring', stiffness: 150, damping: 20 }}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <Anchor
                      style={{
                        width: 36,
                        height: 36,
                        color: anchor.deployed ? T.amber : T.textSecondary,
                        filter: anchor.deployed ? 'drop-shadow(0 0 6px rgba(232,160,48,0.6))' : 'none',
                      }}
                    />
                  </motion.div>

                  {/* Bottom (sea floor) */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '12%',
                      background: 'linear-gradient(180deg, transparent 0%, rgba(80,70,50,0.4) 100%)',
                    }}
                  />
                </div>

                {/* Down button */}
                <button
                  onClick={handleAnchorDown}
                  disabled={anchor.position >= 100}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    border: '1px solid rgba(80,100,120,0.3)',
                    background: 'rgba(30,45,60,0.5)',
                    cursor: anchor.position >= 100 ? 'not-allowed' : 'pointer',
                    opacity: anchor.position >= 100 ? 0.4 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChevronDown style={{ width: 28, height: 28, color: T.textPrimary }} />
                </button>
              </div>

              {/* Status */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 600, color: anchor.deployed ? T.amber : T.textPrimary }}>
                  {anchor.position}%
                </div>
                <div style={{ fontSize: 14, color: T.textSecondary }}>
                  {anchor.deployed ? 'Опущен' : 'Поднят'} • {anchor.depth} м
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
