import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/stores';

const T = {
  textPrimary: '#e8f4ff',
  textSecondary: '#7a95a8',
  textMuted: '#4a6070',
  textGreen: '#3dc88c',
  textRed: '#e04050',
};

type SectionKey = 'weather' | 'electric' | 'tanks' | 'safety';

const sectionData: Record<SectionKey, { title: string; metrics: Array<{ label: string; value: string; unit: string; status: string }> }> = {
  weather: {
    title: 'ПОГОДА',
    metrics: [
      { label: 'Температура воды', value: '18', unit: '°C', status: 'normal' },
      { label: 'Скорость ветра', value: '5', unit: 'м/с', status: 'normal' },
      { label: 'Направление ветра', value: '245', unit: '°', status: 'normal' },
      { label: 'Атм. давление', value: '1013', unit: 'гПа', status: 'normal' },
    ],
  },
  electric: {
    title: 'ЭЛЕКТРИКА',
    metrics: [
      { label: 'Напряжение бортсети', value: '12.8', unit: 'В', status: 'ok' },
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
      { label: 'Трюм', value: '0', unit: 'см', status: 'ok' },
      { label: 'Затопление', value: 'Нет', unit: '', status: 'ok' },
      { label: 'Темп. отсека', value: '32', unit: '°C', status: 'normal' },
      { label: 'Датчик дыма', value: 'Норма', unit: '', status: 'ok' },
      { label: 'Тепловой датчик', value: 'Норма', unit: '', status: 'ok' },
      { label: 'Датчик газа', value: 'Норма', unit: '', status: 'ok' },
    ],
  },
};

const tankContainers = [
  { name: 'Пресная', subname: 'вода', level: 65, status: 'ok' },
  { name: 'Серые', subname: 'воды', level: 42, status: 'normal' },
  { name: 'Чёрные', subname: 'воды', level: 28, status: 'normal' },
  { name: 'Топливо', subname: 'ген.', level: 45, status: 'normal' },
];

const sectionKeys: SectionKey[] = ['weather', 'electric', 'tanks', 'safety'];

export const TopBar = memo(function TopBar() {
  const [expandedSection, setExpandedSection] = useState<SectionKey | null>(null);
  const fuel = useStore((s) => s.systems.fuel);

  const fuelAI95 = Math.round(((fuel.tank1.level + fuel.tank2.level) / 2 / fuel.tank1.capacity) * 100);
  const fuelDT = Math.round((fuel.tank3.level / fuel.tank3.capacity) * 100);

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

        {expandedSection ? (
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
                              background: 'linear-gradient(180deg, rgba(100,160,220,0.6) 0%, rgba(60,120,180,0.4) 100%)',
                              borderRadius: '0 0 11px 11px',
                            }}
                          />
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: T.textPrimary }}>{container.level}%</div>
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
                  {sectionData[expandedSection]?.metrics.map((metric, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * idx }}
                      style={{
                        padding: '14px 16px',
                        background: 'rgba(30,45,60,0.4)',
                        border: `1px solid ${
                          metric.status === 'ok' ? 'rgba(61,200,140,0.3)' : 'rgba(80,100,120,0.3)'
                        }`,
                        borderRadius: 12,
                      }}
                    >
                      <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 6 }}>{metric.label}</div>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 600,
                          color: metric.status === 'ok' ? T.textGreen : T.textPrimary,
                        }}
                      >
                        {metric.value}
                        {metric.unit && (
                          <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 4, color: T.textMuted }}>
                            {metric.unit}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Right - other sections */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {sectionKeys
                .filter((key) => key !== expandedSection)
                .map((key, idx, arr) => (
                  <div key={key} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                        {sectionData[key].title}
                      </div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: T.textSecondary }}>
                            {sectionData[key].metrics[0]?.value}
                            {sectionData[key].metrics[0]?.unit}
                          </div>
                        </div>
                      </div>
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
                ))}
            </div>
          </div>
        ) : (
          /* Collapsed view - 4 sections + fuel */
          <div style={{ display: 'flex', alignItems: 'stretch', height: 87 }}>
            {/* Fuel section */}
            <button
              onClick={() => setExpandedSection('tanks')}
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
              <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 0.5, fontWeight: 500, marginBottom: 6 }}>ТОПЛИВО</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '75%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 8, color: T.textMuted, width: 24 }}>АИ-95</div>
                  <div
                    style={{
                      flex: 1,
                      height: 6,
                      borderRadius: 3,
                      background: 'rgba(30,45,60,0.6)',
                      border: '1px solid rgba(80,100,120,0.3)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${fuelAI95}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, rgba(61,200,140,0.7) 0%, rgba(61,200,140,0.5) 100%)',
                        borderRadius: 2,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 9, color: T.textSecondary, width: 24, textAlign: 'right' }}>{fuelAI95}%</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 8, color: T.textMuted, width: 24 }}>ДТ</div>
                  <div
                    style={{
                      flex: 1,
                      height: 6,
                      borderRadius: 3,
                      background: 'rgba(30,45,60,0.6)',
                      border: '1px solid rgba(80,100,120,0.3)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${fuelDT}%`,
                        height: '100%',
                        background:
                          fuelDT < 25
                            ? 'linear-gradient(90deg, rgba(220,160,60,0.7) 0%, rgba(220,160,60,0.5) 100%)'
                            : 'linear-gradient(90deg, rgba(61,200,140,0.7) 0%, rgba(61,200,140,0.5) 100%)',
                        borderRadius: 2,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 9, color: T.textSecondary, width: 24, textAlign: 'right' }}>{fuelDT}%</div>
                </div>
              </div>
            </button>

            <div style={{ width: 1, background: 'linear-gradient(180deg, transparent 15%, rgba(80,100,120,0.3) 50%, transparent 85%)' }} />

            {/* Other sections */}
            {sectionKeys.map((key, idx) => (
              <div key={key} style={{ display: 'flex', flex: 1 }}>
                <button
                  onClick={() => setExpandedSection(key)}
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
                    {sectionData[key].title}
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: T.textSecondary }}>
                        {sectionData[key].metrics[0]?.value}
                        {sectionData[key].metrics[0]?.unit}
                      </div>
                      <div style={{ fontSize: 8, color: T.textMuted }}>
                        {key === 'weather' && 'вода'}
                        {key === 'electric' && 'АКБ'}
                        {key === 'tanks' && 'вода'}
                        {key === 'safety' && 'трюм'}
                      </div>
                    </div>
                    {sectionData[key].metrics[1] && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: T.textSecondary }}>
                          {sectionData[key].metrics[1]?.value}
                          {sectionData[key].metrics[1]?.unit}
                        </div>
                        <div style={{ fontSize: 8, color: T.textMuted }}>
                          {key === 'weather' && 'ветер'}
                          {key === 'electric' && 'солнце'}
                          {key === 'tanks' && 'давл.'}
                          {key === 'safety' && 'дым'}
                        </div>
                      </div>
                    )}
                  </div>
                </button>
                {idx < sectionKeys.length - 1 && (
                  <div style={{ width: 1, background: 'linear-gradient(180deg, transparent 15%, rgba(80,100,120,0.3) 50%, transparent 85%)' }} />
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
});
