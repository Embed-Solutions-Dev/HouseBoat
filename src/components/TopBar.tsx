import { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/stores';

// Weather icons
const WeatherIcons = {
  sunny: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="5" fill="#f4c542" />
      <g stroke="#f4c542" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="1" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="23" />
        <line x1="1" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
        <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
        <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
        <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
      </g>
    </svg>
  ),
  partlyCloudy: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <circle cx="8" cy="8" r="4" fill="#f4c542" />
      <g stroke="#f4c542" strokeWidth="1.5" strokeLinecap="round">
        <line x1="8" y1="1" x2="8" y2="3" />
        <line x1="1" y1="8" x2="3" y2="8" />
        <line x1="2.5" y1="2.5" x2="4" y2="4" />
        <line x1="13" y1="3" x2="12" y2="4" />
        <line x1="2.5" y1="13" x2="4" y2="12" />
      </g>
      <path d="M10 18H18C19.66 18 21 16.66 21 15C21 13.34 19.66 12 18 12H17.5C17.5 9.24 15.26 7 12.5 7C10.24 7 8.36 8.54 7.73 10.62C6.18 10.93 5 12.3 5 14C5 15.93 6.57 17.5 8.5 17.5" fill="rgba(180,200,220,0.9)" stroke="rgba(140,160,180,0.8)" strokeWidth="1"/>
    </svg>
  ),
  cloudy: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M6 19H17C19.21 19 21 17.21 21 15C21 12.79 19.21 11 17 11H16.5C16.5 7.69 13.81 5 10.5 5C7.69 5 5.36 7.01 4.77 9.69C3.16 10.11 2 11.53 2 13.25C2 15.32 3.68 17 5.75 17" fill="rgba(180,200,220,0.9)" stroke="rgba(140,160,180,0.8)" strokeWidth="1.5"/>
    </svg>
  ),
  rain: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M6 14H17C19.21 14 21 12.21 21 10C21 7.79 19.21 6 17 6H16.5C16.5 3.69 13.81 1 10.5 1C7.69 1 5.36 3.01 4.77 5.69C3.16 6.11 2 7.53 2 9.25C2 11.32 3.68 13 5.75 13" fill="rgba(160,180,200,0.9)" stroke="rgba(120,140,160,0.8)" strokeWidth="1.5"/>
      <g stroke="rgba(100,160,220,0.9)" strokeWidth="1.5" strokeLinecap="round">
        <line x1="8" y1="17" x2="8" y2="21" />
        <line x1="12" y1="16" x2="12" y2="22" />
        <line x1="16" y1="17" x2="16" y2="20" />
      </g>
    </svg>
  ),
  thunderstorm: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M6 12H17C19.21 12 21 10.21 21 8C21 5.79 19.21 4 17 4H16.5C16.5 1.69 13.81 -1 10.5 -1C7.69 -1 5.36 1.01 4.77 3.69C3.16 4.11 2 5.53 2 7.25C2 9.32 3.68 11 5.75 11" fill="rgba(140,160,180,0.9)" stroke="rgba(100,120,140,0.8)" strokeWidth="1.5"/>
      <path d="M13 14L10 19H14L11 24" stroke="#f4c542" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <g stroke="rgba(100,160,220,0.9)" strokeWidth="1.5" strokeLinecap="round">
        <line x1="7" y1="15" x2="7" y2="18" />
        <line x1="17" y1="15" x2="17" y2="19" />
      </g>
    </svg>
  ),
};

const weatherTypes = ['sunny', 'partlyCloudy', 'cloudy', 'rain', 'thunderstorm'] as const;
const windDirections = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'] as const;

const T = {
  textPrimary: '#e8f4ff',
  textSecondary: '#7a95a8',
  textMuted: '#4a6070',
  textGreen: '#3dc88c',
  textRed: '#e04050',
  speedGold: '#d4af65',
  amber: '#e8a030',
};

type SectionKey = 'weather' | 'electric' | 'speed' | 'depth' | 'tanks' | 'safety';

const sectionData: Record<Exclude<SectionKey, 'speed' | 'depth'>, { title: string; metrics: Array<{ label: string; value: string; unit: string; status: string }> }> = {
  weather: {
    title: 'ПОГОДА',
    metrics: [
      { label: 'Темп. воздуха', value: '22', unit: '°C', status: 'normal' },
      { label: 'Темп. воды', value: '18', unit: '°C', status: 'normal' },
      { label: 'Скорость ветра', value: '5', unit: 'м/с', status: 'normal' },
      { label: 'Направление ветра', value: '245', unit: '°', status: 'normal' },
      { label: 'Атм. давление', value: '1013', unit: 'гПа', status: 'normal' },
    ],
  },
  electric: {
    title: 'ЭЛЕКТРИКА',
    metrics: [
      { label: 'Напр. бортсети', value: '12.8', unit: 'В', status: 'ok' },
      { label: 'Напряжение АКБ', value: '12.6', unit: 'В', status: 'ok' },
      { label: 'Ток АКБ', value: '+15', unit: 'А', status: 'normal' },
      { label: 'Температура АКБ', value: '24', unit: '°C', status: 'normal' },
      { label: 'Мощность солнца', value: '2.1', unit: 'кВт', status: 'ok' },
      { label: 'Ток заряда', value: '8.2', unit: 'А', status: 'normal' },
    ],
  },
  tanks: {
    title: 'БАКИ',
    metrics: [
      { label: 'Давление воды', value: '2.4', unit: 'бар', status: 'normal' },
      { label: 'Температура бойлера', value: '58', unit: '°C', status: 'normal' },
    ],
  },
  safety: {
    title: 'БЕЗОПАСНОСТЬ',
    metrics: [
      { label: 'Темп. Отсек 1', value: '24', unit: '°C', status: 'ok' },
      { label: 'Темп. Отсек 2', value: '26', unit: '°C', status: 'ok' },
      { label: 'Темп. Отсек 3', value: '38', unit: '°C', status: 'normal' },
      { label: 'Темп. Отсек 4', value: '22', unit: '°C', status: 'ok' },
      { label: 'Затопл. Отсек 1', value: 'Нет', unit: '', status: 'ok' },
      { label: 'Затопл. Отсек 2', value: 'Нет', unit: '', status: 'ok' },
      { label: 'Затопл. Отсек 3', value: 'Нет', unit: '', status: 'ok' },
      { label: 'Затопл. Отсек 4', value: 'Нет', unit: '', status: 'ok' },
      { label: 'Дым Отсек 1', value: 'Норма', unit: '', status: 'ok' },
      { label: 'Дым Отсек 2', value: 'Норма', unit: '', status: 'ok' },
      { label: 'Дым Отсек 3', value: 'Норма', unit: '', status: 'ok' },
      { label: 'Дым Отсек 4', value: 'Норма', unit: '', status: 'ok' },
    ],
  },
};

const getTankColor = (level: number) => {
  if (level >= 50) return T.textGreen;
  if (level >= 25) return T.amber;
  return T.textRed;
};

const getTankContainers = (fuel: { gasolineLeft: { level: number; capacity: number }; gasolineRight: { level: number; capacity: number }; diesel: { level: number; capacity: number }; water: { level: number; capacity: number } }) => [
  { name: 'Бензин', subname: 'левый', level: Math.round((fuel.gasolineLeft.level / fuel.gasolineLeft.capacity) * 100) },
  { name: 'Бензин', subname: 'правый', level: Math.round((fuel.gasolineRight.level / fuel.gasolineRight.capacity) * 100) },
  { name: 'Дизель', subname: '', level: Math.round((fuel.diesel.level / fuel.diesel.capacity) * 100) },
  { name: 'Вода', subname: '', level: Math.round((fuel.water.level / fuel.water.capacity) * 100) },
];

const sectionKeys: SectionKey[] = ['weather', 'electric', 'speed', 'depth', 'tanks', 'safety'];

// Default safety metrics (normal state)
const defaultSafetyMetrics = [
  { label: 'Темп. Отсек 1', value: '24', unit: '°C', status: 'ok' },
  { label: 'Темп. Отсек 2', value: '26', unit: '°C', status: 'ok' },
  { label: 'Темп. Отсек 3', value: '38', unit: '°C', status: 'ok' },
  { label: 'Темп. Отсек 4', value: '22', unit: '°C', status: 'ok' },
  { label: 'Затопл. Отсек 1', value: 'Нет', unit: '', status: 'ok' },
  { label: 'Затопл. Отсек 2', value: 'Нет', unit: '', status: 'ok' },
  { label: 'Затопл. Отсек 3', value: 'Нет', unit: '', status: 'ok' },
  { label: 'Затопл. Отсек 4', value: 'Нет', unit: '', status: 'ok' },
  { label: 'Дым Отсек 1', value: 'Норма', unit: '', status: 'ok' },
  { label: 'Дым Отсек 2', value: 'Норма', unit: '', status: 'ok' },
  { label: 'Дым Отсек 3', value: 'Норма', unit: '', status: 'ok' },
  { label: 'Дым Отсек 4', value: 'Норма', unit: '', status: 'ok' },
];

export const TopBar = memo(function TopBar() {
  const [expandedSection, setExpandedSection] = useState<SectionKey | null>(null);
  const [weatherIndex, setWeatherIndex] = useState(0);
  const [windIndex, setWindIndex] = useState(0);
  const [electricIndex, setElectricIndex] = useState(0);
  const [safetyIndex, setSafetyIndex] = useState(0);
  const [safetyMetrics, setSafetyMetrics] = useState(defaultSafetyMetrics);
  const speed = useStore((s) => s.navigation.speed);
  const updateNavigation = useStore((s) => s.updateNavigation);
  const storeDepth = useStore((s) => s.navigation.depth);
  const [depth, setDepth] = useState(storeDepth);
  const fuel = useStore((s) => s.systems.fuel);

  const isDepthAlert = depth < 2;
  const depthColor = depth < 2 ? T.textRed : depth <= 4 ? T.amber : T.textGreen;
  const tankContainers = getTankContainers(fuel);

  // Electric metrics pairs (6 metrics = 3 pairs)
  const electricPairs = [
    [sectionData.electric.metrics[0], sectionData.electric.metrics[1]],
    [sectionData.electric.metrics[2], sectionData.electric.metrics[3]],
    [sectionData.electric.metrics[4], sectionData.electric.metrics[5]],
  ];

  // Safety metrics pairs (12 metrics = 6 pairs) - use dynamic safetyMetrics
  const safetyPairs = [
    [safetyMetrics[0], safetyMetrics[1]],
    [safetyMetrics[2], safetyMetrics[3]],
    [safetyMetrics[4], safetyMetrics[5]],
    [safetyMetrics[6], safetyMetrics[7]],
    [safetyMetrics[8], safetyMetrics[9]],
    [safetyMetrics[10], safetyMetrics[11]],
  ];

  // Check if current displayed pair has an alert
  const currentPairHasAlert = safetyPairs[safetyIndex]?.some(m => m?.status === 'alert') || false;

  // Cycle through weather icons, wind directions, electric and safety metrics every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setWeatherIndex((prev) => (prev + 1) % weatherTypes.length);
      setWindIndex((prev) => (prev + 1) % windDirections.length);
      setElectricIndex((prev) => (prev + 1) % electricPairs.length);
      setSafetyIndex((prev) => (prev + 1) % safetyPairs.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Random sensor alert every 15 seconds
  useEffect(() => {
    const alertInterval = setInterval(() => {
      // Pick a random sensor index (0-11)
      const randomIndex = Math.floor(Math.random() * 12);

      // Create new metrics array with alert value
      const newMetrics = [...defaultSafetyMetrics];

      if (randomIndex < 4) {
        // Temperature sensor (0-3): random value 100-120°C
        const alertTemp = Math.floor(Math.random() * 21) + 100;
        newMetrics[randomIndex] = {
          ...newMetrics[randomIndex],
          value: String(alertTemp),
          status: 'alert',
        };
      } else if (randomIndex < 8) {
        // Flood sensor (4-7): "Да"
        newMetrics[randomIndex] = {
          ...newMetrics[randomIndex],
          value: 'Да',
          status: 'alert',
        };
      } else {
        // Smoke sensor (8-11): "Опасность"
        newMetrics[randomIndex] = {
          ...newMetrics[randomIndex],
          value: 'Опасность',
          status: 'alert',
        };
      }

      setSafetyMetrics(newMetrics);
    }, 15000);

    return () => clearInterval(alertInterval);
  }, []);

  // Cycle depth from 0.5 to 10 meters
  useEffect(() => {
    let currentDepth = 0.5;
    let direction = 1; // 1 = increasing, -1 = decreasing

    const depthInterval = setInterval(() => {
      currentDepth += direction * 0.5;

      if (currentDepth >= 10) {
        currentDepth = 10;
        direction = -1;
      } else if (currentDepth <= 0.5) {
        currentDepth = 0.5;
        direction = 1;
      }

      setDepth(currentDepth);
      updateNavigation({ depth: currentDepth });
    }, 1000);

    return () => clearInterval(depthInterval);
  }, [updateNavigation]);

  const getSectionTitle = (key: SectionKey) => {
    if (key === 'speed') return 'СКОРОСТЬ';
    if (key === 'depth') return 'ГЛУБИНА';
    return sectionData[key].title;
  };

  return (
    <div style={{ position: 'relative', height: 88 }}>
      {/* Backdrop */}
      {expandedSection && (
        <div
          onClick={() => setExpandedSection(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }}
        />
      )}

      <motion.div
        animate={{ height: expandedSection ? 380 : 88 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          background: 'linear-gradient(180deg, rgba(12,18,28,0.95) 0%, rgba(6,10,18,0.98) 100%)',
          borderRadius: 20,
          border: '1px solid rgba(60,80,100,0.2)',
          boxShadow: expandedSection
            ? '0 16px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(100,130,160,0.08)'
            : '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(100,130,160,0.08)',
          overflow: 'hidden',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: expandedSection ? 100 : 1,
        }}
      >
        {/* Top shine */}
        <div
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent 10%, rgba(120,150,180,0.15) 50%, transparent 90%)',
          }}
        />

        {expandedSection && expandedSection !== 'speed' && expandedSection !== 'depth' ? (
          /* Expanded view */
          <div style={{ display: 'flex', height: 'calc(100% - 1px)' }}>
            {/* Left - section details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                flex: 3,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid rgba(80,100,120,0.2)',
              }}
            >
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, color: T.textSecondary, letterSpacing: 0.5, fontWeight: 500 }}>
                  {sectionData[expandedSection]?.title}
                </div>
              </div>

              {expandedSection === 'tanks' ? (
                /* Tanks custom view */
                <div style={{ display: 'flex', gap: 32, flex: 1, alignItems: 'stretch' }}>
                  <div style={{ flex: 1.5, display: 'flex', gap: 20, alignItems: 'flex-start', justifyContent: 'center', paddingTop: 8 }}>
                    {tankContainers.map((container, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * idx }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
                      >
                        <div style={{ textAlign: 'center', marginBottom: 2, height: 28 }}>
                          <div style={{ fontSize: 11, fontWeight: 500, color: T.textSecondary }}>{container.name}</div>
                          <div style={{ fontSize: 9, color: T.textMuted }}>{container.subname}</div>
                        </div>
                        <div
                          style={{
                            width: 56,
                            height: 160,
                            borderRadius: 12,
                            background: 'rgba(20,30,45,0.8)',
                            border: '1px solid rgba(80,100,120,0.3)',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)',
                          }}
                        >
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${container.level}%` }}
                            transition={{ delay: 0.1 + idx * 0.1, duration: 0.8, ease: 'easeOut' }}
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: container.level >= 50
                                ? 'linear-gradient(180deg, rgba(61,200,140,0.7) 0%, rgba(61,200,140,0.5) 100%)'
                                : container.level >= 25
                                  ? 'linear-gradient(180deg, rgba(232,160,48,0.7) 0%, rgba(232,160,48,0.5) 100%)'
                                  : 'linear-gradient(180deg, rgba(224,64,80,0.7) 0%, rgba(224,64,80,0.5) 100%)',
                              borderRadius: '0 0 11px 11px',
                            }}
                          />
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: getTankColor(container.level) }}>{container.level}%</div>
                      </motion.div>
                    ))}
                  </div>
                  <div style={{ width: 1, background: 'linear-gradient(180deg, transparent 5%, rgba(80,100,120,0.3) 50%, transparent 95%)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingTop: 8 }}>
                    <div style={{ height: 34 }} />
                    <div style={{ height: 160, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      {sectionData.tanks.metrics.map((metric, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 + 0.05 * idx }}
                          style={{
                            padding: '12px 14px',
                            background: 'rgba(30,45,60,0.4)',
                            border: '1px solid rgba(80,100,120,0.3)',
                            borderRadius: 12,
                          }}
                        >
                          <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 4 }}>{metric.label}</div>
                          <div style={{ fontSize: 18, fontWeight: 600, color: T.textPrimary }}>
                            {metric.value}
                            <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 4, color: T.textMuted }}>{metric.unit}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Standard metrics grid */
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: 12,
                    flex: 1,
                    alignContent: 'start',
                  }}
                >
                  {(expandedSection === 'safety' ? safetyMetrics : sectionData[expandedSection]?.metrics)?.map((metric, idx) => {
                    // Dynamic wind direction for weather section
                    const displayValue = expandedSection === 'weather' && metric.label === 'Направление ветра'
                      ? windDirections[windIndex]
                      : metric.value;
                    const displayUnit = expandedSection === 'weather' && metric.label === 'Направление ветра'
                      ? ''
                      : metric.unit;
                    const isAlert = metric.status === 'alert';

                    return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * idx }}
                      style={{
                        padding: '14px 16px',
                        background: isAlert ? 'rgba(224,64,80,0.15)' : 'rgba(30,45,60,0.4)',
                        border: `1px solid ${
                          isAlert ? 'rgba(224,64,80,0.5)' : metric.status === 'ok' ? 'rgba(61,200,140,0.3)' : 'rgba(80,100,120,0.3)'
                        }`,
                        borderRadius: 12,
                        textAlign: (expandedSection === 'weather' || expandedSection === 'electric' || expandedSection === 'safety') ? 'center' : 'left',
                      }}
                    >
                      <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 6 }}>{metric.label}</div>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 600,
                          color: isAlert ? T.textRed : T.textGreen,
                        }}
                      >
                        {displayValue}
                        {displayUnit && (
                          <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 4, color: T.textMuted }}>
                            {displayUnit}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                  })}
                </div>
              )}
            </motion.div>

            {/* Right - other sections */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {sectionKeys
                .filter((key) => key !== expandedSection && key !== 'speed' && key !== 'depth')
                .map((key, idx, arr) => {
                  const isSafetyAlert = key === 'safety' && currentPairHasAlert;
                  return (
                  <div
                    key={key}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                    }}
                  >
                    {/* Alert glow overlay */}
                    {isSafetyAlert && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 4,
                          left: 4,
                          right: 4,
                          bottom: 4,
                          borderRadius: 10,
                          border: '1px solid rgba(224,64,80,0.6)',
                          boxShadow: '0 0 12px rgba(224,64,80,0.4), inset 0 0 8px rgba(224,64,80,0.1)',
                          background: 'rgba(224,64,80,0.08)',
                          pointerEvents: 'none',
                        }}
                      />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedSection(key);
                      }}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: '8px 12px',
                        background: 'transparent',
                        border: 'none',
                      }}
                    >
                      <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 0.5, fontWeight: 500, marginBottom: 6 }}>
                        {getSectionTitle(key)}
                      </div>
                      {key === 'tanks' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: '80%' }}>
                          {tankContainers.filter(tank => tank.name !== 'Бензин').map((tank, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <div style={{ fontSize: 7, color: T.textMuted, width: 22, textAlign: 'right' }}>
                                {tank.name === 'Дизель' ? 'ДТ' : 'H₂O'}
                              </div>
                              <div style={{ flex: 1, height: 5, borderRadius: 2, background: 'rgba(30,45,60,0.6)', overflow: 'hidden' }}>
                                <div style={{
                                  width: `${tank.level}%`,
                                  height: '100%',
                                  background: tank.level >= 50
                                    ? 'linear-gradient(90deg, rgba(61,200,140,0.7) 0%, rgba(61,200,140,0.5) 100%)'
                                    : tank.level >= 25
                                      ? 'linear-gradient(90deg, rgba(232,160,48,0.8) 0%, rgba(232,160,48,0.6) 100%)'
                                      : 'linear-gradient(90deg, rgba(224,64,80,0.8) 0%, rgba(224,64,80,0.6) 100%)',
                                  borderRadius: 2,
                                }} />
                              </div>
                              <div style={{ fontSize: 8, color: getTankColor(tank.level), width: 22, textAlign: 'right' }}>{tank.level}%</div>
                            </div>
                          ))}
                        </div>
                      ) : key === 'weather' ? (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <div style={{ width: 24, height: 24, position: 'relative' }}>
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={weatherIndex}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.3 }}
                                style={{ position: 'absolute', top: 0, left: 0, transform: 'scale(0.75)' }}
                              >
                                {WeatherIcons[weatherTypes[weatherIndex]]}
                              </motion.div>
                            </AnimatePresence>
                          </div>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: 11, fontWeight: 500, color: T.textSecondary }}>22°</div>
                              <div style={{ fontSize: 7, color: T.textMuted }}>воздух</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: 11, fontWeight: 500, color: T.textSecondary }}>18°</div>
                              <div style={{ fontSize: 7, color: T.textMuted }}>вода</div>
                            </div>
                          </div>
                        </div>
                      ) : key === 'electric' ? (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', position: 'relative', height: 28 }}>
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={electricIndex}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.3 }}
                              style={{ display: 'flex', gap: 8, alignItems: 'center' }}
                            >
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 11, fontWeight: 500, color: T.textSecondary }}>
                                  {electricPairs[electricIndex][0]?.value}{electricPairs[electricIndex][0]?.unit}
                                </div>
                                <div style={{ fontSize: 7, color: T.textMuted }}>
                                  {electricPairs[electricIndex][0]?.label.split(' ')[0]}
                                </div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 11, fontWeight: 500, color: T.textSecondary }}>
                                  {electricPairs[electricIndex][1]?.value}{electricPairs[electricIndex][1]?.unit}
                                </div>
                                <div style={{ fontSize: 7, color: T.textMuted }}>
                                  {electricPairs[electricIndex][1]?.label.split(' ')[0]}
                                </div>
                              </div>
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', position: 'relative', height: 28 }}>
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={safetyIndex}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.3 }}
                              style={{ display: 'flex', gap: 8, alignItems: 'center' }}
                            >
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 11, fontWeight: 500, color: safetyPairs[safetyIndex][0]?.status === 'alert' ? T.textRed : T.textGreen }}>
                                  {safetyPairs[safetyIndex][0]?.value}
                                  {safetyPairs[safetyIndex][0]?.unit}
                                </div>
                                <div style={{ fontSize: 7, color: T.textMuted }}>
                                  {safetyPairs[safetyIndex][0]?.label.replace('Темп. ', '').replace('Затопл. ', '').replace('Дым ', '')}
                                </div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 11, fontWeight: 500, color: safetyPairs[safetyIndex][1]?.status === 'alert' ? T.textRed : T.textGreen }}>
                                  {safetyPairs[safetyIndex][1]?.value}
                                  {safetyPairs[safetyIndex][1]?.unit}
                                </div>
                                <div style={{ fontSize: 7, color: T.textMuted }}>
                                  {safetyPairs[safetyIndex][1]?.label.replace('Темп. ', '').replace('Затопл. ', '').replace('Дым ', '')}
                                </div>
                              </div>
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      )}
                    </button>
                    {idx < arr.length - 1 && (
                      <div
                        style={{
                          height: 1,
                          background: 'linear-gradient(90deg, transparent 15%, rgba(80,100,120,0.3) 50%, transparent 85%)',
                        }}
                      />
                    )}
                  </div>
                );
                })}
            </div>
          </div>
        ) : (
          /* Collapsed view - 6 sections without fuel */
          <div style={{ display: 'flex', alignItems: 'stretch', height: 85 }}>
            {sectionKeys.map((key, idx) => {
              const isSafetyAlert = key === 'safety' && currentPairHasAlert;
              const isDepthAlertSection = key === 'depth' && isDepthAlert;
              const showAlert = isSafetyAlert || isDepthAlertSection;
              return (
              <div
                key={key}
                style={{
                  display: 'flex',
                  flex: 1,
                  position: 'relative',
                }}
              >
                {/* Alert glow overlay */}
                {showAlert && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 6,
                      left: 4,
                      right: 4,
                      bottom: 6,
                      borderRadius: 12,
                      border: '1px solid rgba(224,64,80,0.6)',
                      boxShadow: '0 0 15px rgba(224,64,80,0.4), inset 0 0 10px rgba(224,64,80,0.1)',
                      background: 'rgba(224,64,80,0.08)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
                <button
                  onClick={() => key !== 'speed' && key !== 'depth' && setExpandedSection(key)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: key === 'speed' || key === 'depth' ? 'default' : 'pointer',
                    padding: '8px 12px',
                    background: 'transparent',
                    border: 'none',
                  }}
                >
                  <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 0.5, fontWeight: 500, marginBottom: 6 }}>
                    {getSectionTitle(key)}
                  </div>
                  {key === 'speed' ? (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 600, color: T.speedGold }}>
                        {speed.toFixed(1)}
                      </div>
                      <div style={{ fontSize: 8, color: T.textMuted }}>км/ч</div>
                    </div>
                  ) : key === 'depth' ? (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 600, color: depthColor }}>
                        {depth.toFixed(1)}
                      </div>
                      <div style={{ fontSize: 8, color: T.textMuted }}>м</div>
                    </div>
                  ) : key === 'tanks' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '85%' }}>
                      {tankContainers.filter(tank => tank.name !== 'Бензин').map((tank, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div style={{ fontSize: 8, color: T.textMuted, width: 28, textAlign: 'right' }}>
                            {tank.name === 'Дизель' ? 'ДТ' : 'H₂O'}
                          </div>
                          <div
                            style={{
                              flex: 1,
                              height: 6,
                              borderRadius: 3,
                              background: 'rgba(30,45,60,0.6)',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${tank.level}%`,
                                height: '100%',
                                background: tank.level >= 50
                                  ? 'linear-gradient(90deg, rgba(61,200,140,0.7) 0%, rgba(61,200,140,0.5) 100%)'
                                  : tank.level >= 25
                                    ? 'linear-gradient(90deg, rgba(232,160,48,0.8) 0%, rgba(232,160,48,0.6) 100%)'
                                    : 'linear-gradient(90deg, rgba(224,64,80,0.8) 0%, rgba(224,64,80,0.6) 100%)',
                                borderRadius: 3,
                              }}
                            />
                          </div>
                          <div style={{ fontSize: 9, color: getTankColor(tank.level), width: 26, textAlign: 'right' }}>{tank.level}%</div>
                        </div>
                      ))}
                    </div>
                  ) : key === 'weather' ? (
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      {/* Cycling weather icon */}
                      <div style={{ marginLeft: -4, width: 32, height: 32, position: 'relative' }}>
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={weatherIndex}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                            style={{ position: 'absolute', top: 0, left: 0 }}
                          >
                            {WeatherIcons[weatherTypes[weatherIndex]]}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: T.textSecondary }}>22°</div>
                          <div style={{ fontSize: 8, color: T.textMuted }}>воздух</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: T.textSecondary }}>18°</div>
                          <div style={{ fontSize: 8, color: T.textMuted }}>вода</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: T.textSecondary }}>5</div>
                          <div style={{ fontSize: 8, color: T.textMuted }}>м/с</div>
                        </div>
                      </div>
                    </div>
                  ) : key === 'electric' ? (
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', position: 'relative', height: 36 }}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={electricIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          style={{ display: 'flex', gap: 12, alignItems: 'center' }}
                        >
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: T.textSecondary }}>
                              {electricPairs[electricIndex][0]?.value}
                              {electricPairs[electricIndex][0]?.unit}
                            </div>
                            <div style={{ fontSize: 8, color: T.textMuted }}>
                              {electricPairs[electricIndex][0]?.label.split(' ')[0]}
                            </div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: T.textSecondary }}>
                              {electricPairs[electricIndex][1]?.value}
                              {electricPairs[electricIndex][1]?.unit}
                            </div>
                            <div style={{ fontSize: 8, color: T.textMuted }}>
                              {electricPairs[electricIndex][1]?.label.split(' ')[0]}
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', position: 'relative', height: 36 }}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={safetyIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          style={{ display: 'flex', gap: 12, alignItems: 'center' }}
                        >
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: safetyPairs[safetyIndex][0]?.status === 'alert' ? T.textRed : T.textGreen }}>
                              {safetyPairs[safetyIndex][0]?.value}
                              {safetyPairs[safetyIndex][0]?.unit}
                            </div>
                            <div style={{ fontSize: 8, color: T.textMuted }}>
                              {safetyPairs[safetyIndex][0]?.label.replace('Темп. ', '').replace('Затопл. ', '').replace('Дым ', '')}
                            </div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: safetyPairs[safetyIndex][1]?.status === 'alert' ? T.textRed : T.textGreen }}>
                              {safetyPairs[safetyIndex][1]?.value}
                              {safetyPairs[safetyIndex][1]?.unit}
                            </div>
                            <div style={{ fontSize: 8, color: T.textMuted }}>
                              {safetyPairs[safetyIndex][1]?.label.replace('Темп. ', '').replace('Затопл. ', '').replace('Дым ', '')}
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  )}
                </button>
                {idx < sectionKeys.length - 1 && (
                  <div style={{ width: 1, background: 'linear-gradient(180deg, transparent 10%, rgba(80,100,120,0.3) 50%, transparent 90%)' }} />
                )}
              </div>
            );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
});
