import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function mapRange(v, inMin, inMax, outMin, outMax) { const t = (v - inMin) / (inMax - inMin); return outMin + clamp(t, 0, 1) * (outMax - outMin); }
function polarSvg(cx, cy, r, deg) { const rad = ((deg - 90) * Math.PI) / 180; return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }; }
function arcPath(cx, cy, r, startDeg, endDeg) { const s = polarSvg(cx, cy, r, startDeg); const e = polarSvg(cx, cy, r, endDeg); const delta = ((endDeg - startDeg) % 360 + 360) % 360; const largeArc = delta > 180 ? 1 : 0; return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`; }
function normDeg(d) { return ((d % 360) + 360) % 360; }
function headingToCardinal(deg) { const dirs = ["С","ССВ","СВ","ВСВ","В","ВЮВ","ЮВ","ЮЮВ","Ю","ЮЮЗ","ЮЗ","ЗЮЗ","З","ЗСЗ","СЗ","ССЗ"]; return dirs[Math.round(normDeg(deg) / 22.5) % 16]; }

const T = {
  pageBg: 'radial-gradient(ellipse at 50% 30%, #0f1a25 0%, #080d12 50%, #000 100%)',
  cardBg: 'linear-gradient(180deg, #162230 0%, #0c1218 100%)',
  cardBorder: 'rgba(80,110,140,0.25)',
  cardShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(150,180,210,0.08)',
  gaugeBg: 'rgba(60,85,110,0.5)',
  gaugeActive: '#3dc88c',
  gaugeRed: '#e04050',
  tickMajor: 'rgba(180,200,220,0.8)',
  tickMinor: 'rgba(100,120,140,0.5)',
  textPrimary: '#e8f4ff',
  textSecondary: '#7a95a8',
  textMuted: '#4a6070',
  textGreen: '#3dc88c',
  textAmber: '#e8a030',
  textRed: '#e04050',
  speedYellow: '#e8c820',
  pointerRed: '#d03040',
};

const Battery = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="16" height="10" x="2" y="7" rx="2"/><line x1="22" x2="22" y1="11" y2="13"/></svg>;
const Fuel = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" x2="15" y1="22" y2="22"/><line x1="4" x2="14" y1="9" y2="9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/></svg>;
const AlertTriangle = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>;
const Route = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>;
const CheckCircle2 = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>;
const Lightbulb = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>;
const Anchor = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="3"/><line x1="12" x2="12" y1="22" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>;
const Waves = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>;
const Navigation2 = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 19 21 12 17 5 21 12 2"/></svg>;
const Radar = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"/><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"/><path d="M12 18h.01"/><path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59 5.66-5.66"/></svg>;
const Power = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.77.04"/></svg>;
const Generator = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h.01"/><path d="M10 12h.01"/><path d="M14 12h4"/><path d="M6 10v4"/></svg>;
const BowThruster = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 6v12"/><path d="M8 9l4 3-4 3"/><path d="M16 9l-4 3 4 3"/></svg>;
const LightParking = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/></svg>;
const LightRunning = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 12l10 10 10-10L12 2z"/><circle cx="12" cy="12" r="3"/></svg>;

function Card({ children, className = "" }) {
  return (
    <div className={`${className}`} style={{ 
      position: 'relative',
      background: 'linear-gradient(145deg, rgba(15,22,35,0.95) 0%, rgba(8,12,22,0.98) 50%, rgba(5,8,15,0.99) 100%)',
      borderRadius: 24,
      border: '1px solid rgba(80,110,140,0.2)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(150,180,210,0.1)',
      overflow: 'hidden',
    }}>
      {/* Глянцевый блик сверху */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        height: 40,
        borderRadius: '0 0 50% 50%',
        background: 'linear-gradient(180deg, rgba(180,210,255,0.1) 0%, rgba(150,180,220,0.03) 50%, transparent 100%)',
        pointerEvents: 'none',
      }} />
      {/* Внутренняя тень для глубины */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 24,
        boxShadow: 'inset 0 6px 20px rgba(0,0,0,0.4), inset 0 -2px 10px rgba(0,0,0,0.2)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

const RudderGauge = memo(function RudderGauge({ angle, compact = false }) {
  const a = clamp(angle, -35, 35);
  const mv = useMotionValue(a);
  const spring = useSpring(mv, { stiffness: 140, damping: 20 });
  useEffect(() => { mv.set(a); }, [a, mv]);
  const leftPct = useTransform(spring, (v) => `${mapRange(v, -35, 35, 5, 95)}%`);
  
  if (compact) {
    return (
      <div style={{ width: '100%', height: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: T.textSecondary }}>Руль</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>{a > 0 ? `+${a.toFixed(0)}` : a.toFixed(0)}°</span>
        </div>
        <div style={{ marginTop: 4, position: 'relative', height: 12 }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', height: 3, borderRadius: 2, background: T.gaugeBg }} />
          <div style={{ position: 'absolute', left: '50%', top: 2, bottom: 2, width: 1, background: T.tickMinor }} />
          <motion.div style={{ position: 'absolute', top: '50%', left: leftPct, transform: 'translate(-50%, -50%)', width: 3, height: 12, borderRadius: 2, background: T.textPrimary, boxShadow: '0 0 6px rgba(200,230,255,0.5)' }} />
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <span style={{ fontSize: 12, color: T.textSecondary }}>Угол руля</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>{a > 0 ? `+${a.toFixed(0)}` : a.toFixed(0)}°</span>
      </div>
      <div style={{ marginTop: 8, position: 'relative', height: 24 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', height: 4, borderRadius: 2, background: T.gaugeBg }} />
        <div style={{ position: 'absolute', left: '50%', top: 4, bottom: 4, width: 1, background: T.tickMinor }} />
        <motion.div style={{ position: 'absolute', top: '50%', left: leftPct, transform: 'translate(-50%, -50%)', width: 3, height: 20, borderRadius: 2, background: T.textPrimary, boxShadow: '0 0 8px rgba(200,230,255,0.5)' }} />
      </div>
    </div>
  );
});

const TopMetric = memo(function TopMetric({ icon: Icon, value, label, tone = "muted" }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {/* Плоская иконка */}
      <div style={{ 
        width: 44, 
        height: 44, 
        borderRadius: '50%', 
        background: 'rgba(40,60,80,0.4)',
        border: '1px solid rgba(80,110,140,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon style={{ width: 22, height: 22, color: tone === "ok" ? T.textGreen : T.textSecondary }} />
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 600, color: T.textPrimary }}>{value}</div>
        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
});

const EngineCard = memo(function EngineCard({ side, tempText, rpm, throttle, gear, motorHours, fuelLevel, expanded, onToggleExpand }) {
  const faults = side === "Left" ? [] : ["E102 - Temp sensor intermittent"];
  const hasFaults = faults.length > 0;
  const lowFuel = fuelLevel < 25;

  const v = clamp(rpm, 0, 4000);
  const max = 4000;
  const ratio = v / max;

  const startAngle = 225;
  const sweep = 270;
  const endAngle = -45;

  const mv = useMotionValue(-startAngle);
  const spring = useSpring(mv, { stiffness: 80, damping: 15 });

  useEffect(() => {
    const targetAngle = -startAngle + ratio * sweep;
    mv.set(targetAngle);
  }, [ratio, mv]);

  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;

  const majorStep = 500;
  const minorStep = 100;
  const ticks = [];

  for (let val = 0; val <= max; val += minorStep) {
    const t = val / max;
    const angle = (startAngle - t * sweep) * Math.PI / 180;
    const isMajor = val % majorStep === 0;
    const innerR = isMajor ? r - 18 : r - 10;
    const outerR = r;

    ticks.push({
      x1: cx + innerR * Math.cos(angle),
      y1: cy - innerR * Math.sin(angle),
      x2: cx + outerR * Math.cos(angle),
      y2: cy - outerR * Math.sin(angle),
      isMajor,
      value: val,
      labelX: cx + (r - 34) * Math.cos(angle),
      labelY: cy - (r - 34) * Math.sin(angle),
      isRedZone: val >= max * 0.8,
    });
  }

  const redZoneStartAngle = startAngle - 0.8 * sweep;
  const arcR = r - 5;
  const needleLength = r - 40;

  // Fuel arc parameters (bottom arc - 0% left, 100% right)
  const fuelArcR = r - 5;
  const fuelStartAngle = -125; // degrees (left side, 0%)
  const fuelEndAngle = -55; // degrees (right side, 100%)
  const fuelSweep = 70; // total sweep for fuel arc
  const fuelRatio = clamp(fuelLevel, 0, 100) / 100;
  const fuelFilledAngle = fuelStartAngle + fuelRatio * fuelSweep;
  const fuelColor = lowFuel ? T.textAmber : T.gaugeActive;

  return (
    <div style={{ minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>
      <div style={{
        position: 'relative',
        width: size + 16,
        height: size + 16,
        borderRadius: '50%',
        background: 'linear-gradient(165deg, #e8e8e8 0%, #b8b8b8 15%, #909090 30%, #707070 50%, #909090 70%, #b8b8b8 85%, #a0a0a0 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.8)',
        padding: 8,
      }}>
        <button
          onClick={onToggleExpand}
          style={{
            position: 'absolute',
            top: 13,
            right: 13,
            width: 32,
            height: 32,
            background: hasFaults
              ? 'linear-gradient(145deg, rgba(224,64,80,0.5) 0%, rgba(180,40,60,0.4) 100%)'
              : 'linear-gradient(145deg, rgba(80,110,140,0.4) 0%, rgba(60,90,120,0.3) 100%)',
            border: hasFaults
              ? '1px solid rgba(224,64,80,0.5)'
              : '1px solid rgba(100,130,160,0.3)',
            borderRadius: '50%',
            cursor: 'pointer',
            padding: 0,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: hasFaults
              ? '0 2px 6px rgba(224,64,80,0.3)'
              : '0 2px 6px rgba(0,0,0,0.2)',
          }}
        >
          <span style={{
            color: hasFaults ? 'rgba(224,64,80,0.9)' : 'rgba(150,180,210,0.6)',
            fontSize: 18,
            fontWeight: 600,
            fontStyle: 'italic',
            fontFamily: 'Georgia, serif',
          }}>i</span>
        </button>

        <div style={{
          position: 'relative',
          width: size,
          height: size,
          borderRadius: '50%',
          background: T.cardBg,
          boxShadow: 'inset 0 4px 16px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.2)',
        }}>

        <svg viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          {/* Main RPM arc background */}
          <path
            d={`M ${cx + arcR * Math.cos(startAngle * Math.PI / 180)} ${cy - arcR * Math.sin(startAngle * Math.PI / 180)} A ${arcR} ${arcR} 0 1 1 ${cx + arcR * Math.cos(endAngle * Math.PI / 180)} ${cy - arcR * Math.sin(endAngle * Math.PI / 180)}`}
            fill="none"
            stroke={T.gaugeBg}
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Red zone on RPM arc */}
          <path
            d={`M ${cx + arcR * Math.cos(redZoneStartAngle * Math.PI / 180)} ${cy - arcR * Math.sin(redZoneStartAngle * Math.PI / 180)} A ${arcR} ${arcR} 0 0 1 ${cx + arcR * Math.cos(endAngle * Math.PI / 180)} ${cy - arcR * Math.sin(endAngle * Math.PI / 180)}`}
            fill="none"
            stroke="rgba(224,64,80,0.5)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Fuel arc background (bottom, closing the circle) */}
          <path
            d={`M ${cx + fuelArcR * Math.cos(fuelStartAngle * Math.PI / 180)} ${cy - fuelArcR * Math.sin(fuelStartAngle * Math.PI / 180)} A ${fuelArcR} ${fuelArcR} 0 0 0 ${cx + fuelArcR * Math.cos(fuelEndAngle * Math.PI / 180)} ${cy - fuelArcR * Math.sin(fuelEndAngle * Math.PI / 180)}`}
            fill="none"
            stroke={T.gaugeBg}
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Fuel arc filled (0% left, 100% right) */}
          {fuelRatio > 0 && (
            <path
              d={`M ${cx + fuelArcR * Math.cos(fuelStartAngle * Math.PI / 180)} ${cy - fuelArcR * Math.sin(fuelStartAngle * Math.PI / 180)} A ${fuelArcR} ${fuelArcR} 0 0 0 ${cx + fuelArcR * Math.cos(fuelFilledAngle * Math.PI / 180)} ${cy - fuelArcR * Math.sin(fuelFilledAngle * Math.PI / 180)}`}
              fill="none"
              stroke={fuelColor}
              strokeWidth="6"
              strokeLinecap="round"
            />
          )}

          {ticks.map((tick, i) => (
            <g key={i}>
              <line
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                stroke={tick.isRedZone ? T.gaugeRed : (tick.isMajor ? T.tickMajor : T.tickMinor)}
                strokeWidth={tick.isMajor ? 2.5 : 1}
                strokeLinecap="round"
              />
              {tick.value % 1000 === 0 && (
                <text
                  x={tick.labelX}
                  y={tick.labelY}
                  fill={tick.isRedZone ? T.gaugeRed : T.textPrimary}
                  fontSize="24"
                  fontWeight="600"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {tick.value / 1000}
                </text>
              )}
            </g>
          ))}

          <circle cx={cx} cy={cy} r="16" fill="#0a1015" stroke={T.cardBorder} strokeWidth="2" />
        </svg>

        <motion.div
          style={{
            position: 'absolute',
            left: cx,
            top: cy,
            transformOrigin: '0 0',
            rotate: spring,
            zIndex: 10,
          }}
        >
          <svg
            width={needleLength + 5}
            height="30"
            viewBox={`0 0 ${needleLength + 5} 30`}
            style={{
              position: 'absolute',
              left: 0,
              top: -15,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
            }}
          >
            <defs>
              <linearGradient id={`needleGrad${side}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ff5065"/>
                <stop offset="50%" stopColor="#d42040"/>
                <stop offset="100%" stopColor="#901030"/>
              </linearGradient>
            </defs>
            <path
              d={`M 4 13 L ${needleLength - 10} 14 L ${needleLength} 15 L ${needleLength - 10} 16 L 4 17 Z`}
              fill="rgba(0,0,0,0.3)"
            />
            <path
              d={`M 0 12 L ${needleLength - 10} 13 L ${needleLength} 15 L ${needleLength - 10} 17 L 0 18 Z`}
              fill={`url(#needleGrad${side})`}
            />
          </svg>
          <svg
            width="44"
            height="44"
            viewBox="0 0 44 44"
            style={{
              position: 'absolute',
              left: -22,
              top: -22,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
            }}
          >
            <defs>
              <linearGradient id={`frame${side}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d0d0d0"/>
                <stop offset="30%" stopColor="#909090"/>
                <stop offset="70%" stopColor="#606060"/>
                <stop offset="100%" stopColor="#a0a0a0"/>
              </linearGradient>
            </defs>
            <circle cx="22" cy="22" r="20" fill={`url(#frame${side})`} />
            <circle cx="22" cy="22" r="16" fill="#101010" />
            {Array.from({ length: 7 }).map((_, i) => {
              const rr = 3 + i * 2;
              return (
                <g key={i}>
                  <circle cx="22" cy="22" r={rr} fill="none" stroke="rgba(0,0,0,0.8)" strokeWidth="0.8"/>
                  <circle cx="22" cy="22" r={rr + 0.5} fill="none" stroke="rgba(50,50,50,0.3)" strokeWidth="0.4"/>
                </g>
              );
            })}
            <circle cx="22" cy="22" r="2" fill="#080808" />
          </svg>
        </motion.div>

        {/* Temperature and Oil status at top */}
        <div style={{ position: 'absolute', top: 90, left: 0, right: 0, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: T.textGreen }}>{tempText.split(' · ')[0]}</div>
          <div style={{ fontSize: 11, color: T.textGreen, marginTop: 2 }}>{tempText.split(' · ')[1]}</div>
        </div>

        {/* Motor hours in center (smaller than old RPM display) */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: cy + 46, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: T.textSecondary, textShadow: '0 0 15px rgba(200,230,255,0.1)', fontVariantNumeric: 'tabular-nums' }}>
            {motorHours.toLocaleString()}
          </div>
          <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 0.5, marginTop: 2 }}>МОТОЧАСЫ</div>
        </div>

        {/* Throttle on horizontal center line, 66px left of center */}
        <div style={{ position: 'absolute', top: cy, left: cx - 66, transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: T.textMuted }}>ГАЗ</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: T.textSecondary }}>{throttle}%</div>
        </div>

        {/* Error indicator - 66px right of center, 4px below horizontal center line */}
        {hasFaults && (
          <div style={{ position: 'absolute', top: cy + 4, left: cx + 66, transform: 'translate(-50%, -50%)', filter: 'drop-shadow(0 0 8px rgba(255,60,60,0.8))' }}>
            <svg style={{ width: 28, height: 28 }} viewBox="0 0 24 24" fill="none" stroke={T.textRed} strokeWidth="2">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <circle cx="12" cy="17" r="0.6" fill={T.textRed}/>
            </svg>
          </div>
        )}

        {/* Fuel pump icon at bottom */}
        <div style={{ position: 'absolute', bottom: 28, left: 0, right: 0, textAlign: 'center' }}>
          <svg style={{ width: 27, height: 27 }} viewBox="0 0 24 24" fill={lowFuel ? T.textAmber : T.textMuted} stroke="none">
            <path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5z"/>
          </svg>
        </div>
      </div>
      </div>
    </div>
  );
});

const controlItems = [
  { key: "power", label: "Питание", icon: Power },
  { key: "runLight", label: "Ходовые", icon: LightRunning },
  { key: "parkLight", label: "Стоян. огонь", icon: LightParking },
  { key: "thruster", label: "Подрулька", icon: BowThruster },
  { key: "anchor", label: "Якорь", icon: Anchor },
  { key: "generator", label: "Генератор", icon: Generator },
];

export default function YachtDashboard() {
  const [loadingPhase, setLoadingPhase] = useState('logo'); // 'logo' | 'transition' | 'done'
  const [expandedEngine, setExpandedEngine] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [expandedCamera, setExpandedCamera] = useState(null);
  const [speed, setSpeed] = useState(18.4);
  const [heading, setHeading] = useState(42);
  const [rpmLeft, setRpmLeft] = useState(2350);
  const [rpmRight, setRpmRight] = useState(2410);
  const [throttleLeft, setThrottleLeft] = useState(62);
  const [throttleRight, setThrottleRight] = useState(64);
  const [gearLeft] = useState("F");
  const [gearRight] = useState("F");
  const [fuelPct, setFuelPct] = useState(68);
  const [rangeNm, setRangeNm] = useState(124);
  const [batteryV, setBatteryV] = useState(24.7);
  const [rudderDeg, setRudderDeg] = useState(-6);
  const [statusOk] = useState(true);
  const [controls, setControls] = useState({ power: true, generator: false, thruster: false, parkLight: false, runLight: true, anchor: false });
  const [anchorModal, setAnchorModal] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState(0);
  const [anchorMoving, setAnchorMoving] = useState(null);

  // Анимация загрузки
  useEffect(() => {
    const timer1 = setTimeout(() => setLoadingPhase('transition'), 2800);
    const timer2 = setTimeout(() => setLoadingPhase('done'), 3400);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const anchorDepthMeters = (anchorPosition / 100) * 25; // максимум 25 метров

  // Данные разделов
  const sectionData = {
    fuel: {
      title: 'ТОПЛИВО',
      tanks: [
        { name: 'АИ-95', subname: 'Бак 1', level: 78, status: 'ok' },
        { name: 'АИ-95', subname: 'Бак 2', level: 65, status: 'ok' },
        { name: 'ДТ', subname: 'Бак 1', level: 45, status: 'warn' },
      ],
      metrics: [
        { label: 'Расход АИ-95', value: '12.4', unit: 'л/ч', status: 'normal' },
        { label: 'Расход ДТ', value: '8.2', unit: 'л/ч', status: 'normal' },
        { label: 'Израсходовано АИ-95', value: '234', unit: 'л', status: 'normal' },
        { label: 'Израсходовано ДТ', value: '156', unit: 'л', status: 'normal' },
      ]
    },
    weather: {
      title: 'ПОГОДА',
      metrics: [
        { label: 'Температура воды', value: '18', unit: '°C', status: 'normal' },
        { label: 'Скорость ветра', value: '5', unit: 'м/с', status: 'normal' },
        { label: 'Направление ветра', value: '245', unit: '°', status: 'normal' },
        { label: 'Атм. давление', value: '1013', unit: 'гПа', status: 'normal' },
      ]
    },
    electric: {
      title: 'ЭЛЕКТРИКА',
      metrics: [
        { label: 'Напряжение бортсети', value: '12.8', unit: 'В', status: 'ok' },
        { label: 'Напряжение АКБ', value: '12.6', unit: 'В', status: 'ok' },
        { label: 'Ток АКБ', value: '+15', unit: 'А', status: 'normal' },
        { label: 'Температура АКБ', value: '24', unit: '°C', status: 'normal' },
        { label: 'Мощность генератора', value: '0', unit: 'кВт', status: 'normal' },
        { label: 'Нагрузка генератора', value: '0', unit: '%', status: 'normal' },
        { label: 'Напряжение берега', value: '—', unit: '', status: 'off' },
        { label: 'Ток берега', value: '—', unit: '', status: 'off' },
        { label: 'Мощность солнца', value: '2.1', unit: 'кВт', status: 'ok' },
        { label: 'Ток заряда', value: '8.2', unit: 'А', status: 'normal' },
      ]
    },
    tanks: {
      title: 'ЁМКОСТИ',
      containers: [
        { name: 'Пресная', subname: 'вода', level: 65, status: 'ok' },
        { name: 'Серые', subname: 'воды', level: 42, status: 'normal' },
        { name: 'Чёрные', subname: 'воды', level: 28, status: 'normal' },
        { name: 'Септик', subname: '', level: 87, status: 'critical' },
      ],
      metrics: [
        { label: 'Давление воды', value: '2.4', unit: 'бар', status: 'normal' },
        { label: 'Температура бойлера', value: '58', unit: '°C', status: 'normal' },
      ]
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
      ]
    },
  };

  const sectionKeys = ['fuel', 'weather', 'electric', 'tanks', 'safety'];

  useEffect(() => {
    const id = setInterval(() => {
      setHeading((h) => normDeg(h + 0.4));
      setSpeed((s) => clamp(s + (Math.random() - 0.5) * 0.1, 0, 40));
      setRpmLeft((r) => clamp(r + (Math.random() - 0.5) * 8, 650, 3800));
      setRpmRight((r) => clamp(r + (Math.random() - 0.5) * 8, 650, 3800));
      setThrottleLeft((t) => clamp(t + (Math.random() - 0.5), 0, 100));
      setThrottleRight((t) => clamp(t + (Math.random() - 0.5), 0, 100));
      setBatteryV((v) => clamp(v + (Math.random() - 0.5) * 0.02, 23.8, 25.4));
      setRudderDeg((d) => clamp(d + (Math.random() - 0.5) * 0.4, -35, 35));
      setFuelPct((p) => clamp(p - 0.003, 0, 100));
      setRangeNm((nm) => clamp(nm - 0.01, 0, 999));
    }, 250);
    return () => clearInterval(id);
  }, []);

  // Движение якоря
  useEffect(() => {
    if (!anchorMoving) return;
    const id = setInterval(() => {
      setAnchorPosition(p => {
        const newP = anchorMoving === 'down' ? p + 2 : p - 2;
        return clamp(newP, 0, 100);
      });
    }, 100);
    return () => clearInterval(id);
  }, [anchorMoving]);

  const toggleControl = useCallback((k) => {
    if (k === 'anchor') {
      setAnchorModal(true);
      return;
    }
    setControls((p) => ({ ...p, [k]: !p[k] }));
  }, []);

  // Компонент камеры
  const CameraView = ({ cam, isExpanded, onClick }) => (
    <motion.div 
      layout
      onClick={onClick}
      style={{
        background: 'linear-gradient(180deg, rgba(12,18,28,0.95) 0%, rgba(6,10,18,0.98) 100%)',
        borderRadius: isExpanded ? 24 : 16,
        border: '1px solid rgba(60,80,100,0.2)',
        boxShadow: isExpanded 
          ? '0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(100,130,160,0.08)'
          : '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(100,130,160,0.08)',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        aspectRatio: isExpanded ? '16/9' : '16/10',
      }}
    >
      {/* Имитация видео */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(20,30,45,1) 0%, rgba(15,22,35,1) 100%)',
      }}>
        {/* Горизонт воды */}
        <div style={{
          position: 'absolute',
          top: '45%',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, rgba(25,40,60,0.8) 0%, rgba(15,25,40,0.9) 100%)',
        }} />
        
        {/* Волны на воде */}
        <motion.div
          animate={{ x: [0, -30, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: isExpanded ? 3 : 2,
            background: 'rgba(60,100,140,0.3)',
            filter: 'blur(1px)',
          }}
        />
        <motion.div
          animate={{ x: [0, 20, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{
            position: 'absolute',
            top: '60%',
            left: 0,
            right: 0,
            height: isExpanded ? 2 : 1,
            background: 'rgba(60,100,140,0.25)',
            filter: 'blur(1px)',
          }}
        />
        <motion.div
          animate={{ x: [0, -15, 0], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{
            position: 'absolute',
            top: '70%',
            left: 0,
            right: 0,
            height: isExpanded ? 2 : 1,
            background: 'rgba(60,100,140,0.2)',
            filter: 'blur(1px)',
          }}
        />
        
        {/* Блики на воде */}
        <motion.div
          animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: 'absolute',
            top: '55%',
            left: '30%',
            width: isExpanded ? 80 : 40,
            height: isExpanded ? 16 : 8,
            background: 'radial-gradient(ellipse, rgba(100,150,200,0.3) 0%, transparent 70%)',
            filter: 'blur(2px)',
          }}
        />
        <motion.div
          animate={{ opacity: [0.05, 0.2, 0.05], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          style={{
            position: 'absolute',
            top: '65%',
            left: '60%',
            width: isExpanded ? 60 : 30,
            height: isExpanded ? 12 : 6,
            background: 'radial-gradient(ellipse, rgba(100,150,200,0.25) 0%, transparent 70%)',
            filter: 'blur(2px)',
          }}
        />
        
        {/* Шум камеры */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }} />
      </div>
      
      {/* Метка камеры */}
      <div style={{
        position: 'absolute',
        top: isExpanded ? 16 : 8,
        left: isExpanded ? 20 : 10,
        display: 'flex',
        alignItems: 'center',
        gap: isExpanded ? 10 : 6,
      }}>
        <div style={{
          width: isExpanded ? 10 : 6,
          height: isExpanded ? 10 : 6,
          borderRadius: '50%',
          background: '#e53935',
          boxShadow: '0 0 8px rgba(229,57,53,0.8)',
        }}>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: '#e53935',
            }}
          />
        </div>
        <span style={{ 
          fontSize: isExpanded ? 14 : 9, 
          fontWeight: 600, 
          color: 'rgba(255,255,255,0.7)',
          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
          letterSpacing: '0.5px',
        }}>
          REC
        </span>
      </div>
      
      {/* Название камеры */}
      <div style={{
        position: 'absolute',
        bottom: isExpanded ? 16 : 8,
        left: isExpanded ? 20 : 10,
        fontSize: isExpanded ? 16 : 10,
        fontWeight: 600,
        color: 'rgba(255,255,255,0.6)',
        textShadow: '0 1px 3px rgba(0,0,0,0.9)',
        letterSpacing: '0.5px',
      }}>
        {cam.label}
      </div>
      
      {/* Временная метка */}
      <div style={{
        position: 'absolute',
        bottom: isExpanded ? 16 : 8,
        right: isExpanded ? 20 : 10,
        fontSize: isExpanded ? 14 : 9,
        fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.5)',
        textShadow: '0 1px 3px rgba(0,0,0,0.9)',
      }}>
        {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
      
      {/* Рамка фокуса */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: isExpanded ? 120 : 50,
        height: isExpanded ? 120 : 50,
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 2,
      }}>
        <div style={{ position: 'absolute', top: -1, left: -1, width: isExpanded ? 16 : 8, height: isExpanded ? 16 : 8, borderTop: '2px solid rgba(255,255,255,0.4)', borderLeft: '2px solid rgba(255,255,255,0.4)' }} />
        <div style={{ position: 'absolute', top: -1, right: -1, width: isExpanded ? 16 : 8, height: isExpanded ? 16 : 8, borderTop: '2px solid rgba(255,255,255,0.4)', borderRight: '2px solid rgba(255,255,255,0.4)' }} />
        <div style={{ position: 'absolute', bottom: -1, left: -1, width: isExpanded ? 16 : 8, height: isExpanded ? 16 : 8, borderBottom: '2px solid rgba(255,255,255,0.4)', borderLeft: '2px solid rgba(255,255,255,0.4)' }} />
        <div style={{ position: 'absolute', bottom: -1, right: -1, width: isExpanded ? 16 : 8, height: isExpanded ? 16 : 8, borderBottom: '2px solid rgba(255,255,255,0.4)', borderRight: '2px solid rgba(255,255,255,0.4)' }} />
      </div>
      
      {/* Кнопка закрытия для развёрнутого вида */}
      {isExpanded && (
        <div style={{
          position: 'absolute',
          top: 16,
          right: 20,
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </div>
      )}
    </motion.div>
  );

  const cameras = [
    { label: 'НОС', angle: 0 },
    { label: 'ПРАВЫЙ БОРТ', angle: 90 },
    { label: 'КОРМА', angle: 180 },
    { label: 'ЛЕВЫЙ БОРТ', angle: 270 },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: T.pageBg }}>
      
      {/* Экран загрузки */}
      <AnimatePresence>
        {loadingPhase !== 'done' && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: T.pageBg,
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={loadingPhase === 'transition' ? {
                opacity: 0,
                scale: 0.9,
              } : {
                opacity: 1,
                scale: 1,
              }}
              transition={{ duration: loadingPhase === 'transition' ? 0.6 : 0.8, ease: "easeOut" }}
              style={{ position: 'relative' }}
            >
              <svg width="280" height="180" viewBox="600 -100 1620 750" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="loadingLogoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#5a6a7a" />
                    <stop offset="50%" stopColor="#4a5a6a" />
                    <stop offset="100%" stopColor="#3a4a5a" />
                  </linearGradient>
                  <linearGradient id="topShineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                    <stop offset="20%" stopColor="rgba(255,255,255,0)" />
                    <stop offset="35%" stopColor="rgba(255,255,255,0.15)" />
                    <stop offset="45%" stopColor="rgba(255,255,255,0.35)" />
                    <stop offset="50%" stopColor="rgba(255,255,255,0.45)" />
                    <stop offset="55%" stopColor="rgba(255,255,255,0.35)" />
                    <stop offset="65%" stopColor="rgba(255,255,255,0.15)" />
                    <stop offset="80%" stopColor="rgba(255,255,255,0)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </linearGradient>
                  <linearGradient id="topFadeMask" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="white" />
                    <stop offset="30%" stopColor="white" />
                    <stop offset="60%" stopColor="black" />
                    <stop offset="100%" stopColor="black" />
                  </linearGradient>
                  <mask id="topOnlyMask">
                    <rect x="500" y="-200" width="1800" height="900" fill="url(#topFadeMask)" />
                  </mask>
                  <clipPath id="logoClipPath">
                    <path d="M1798.09 319.87c-4.35,-12.65 -31.56,-22.61 -26.42,-5.52 2.53,29.43 7.74,74.72 -23.19,131.9 -34.39,29.27 5.18,34.93 43.53,16.19 64.03,-24.99 12.21,-119.88 6.08,-142.57zm-498.41 -195.06l0 0 -0.42 0 0 54.51 47.15 0c-0.78,-30.15 -21.5,-54.51 -46.73,-54.51zm-17.11 0.05l0 0c-24.28,1.3 -43.89,25.15 -44.65,54.46l44.65 0 0 -54.46zm-44.67 74.57l0 0 0 51 44.67 0 0 -51 -44.67 0zm61.36 51l0 0 47.17 0 0 -51 -47.17 0 0 51zm488.43 -118.7l0 0c-75.64,39.65 -105.96,79.31 -167.43,107.06 -14.5,6.53 -30.65,12.67 -48.33,18.34l0 -102.15c0,-34.71 -28.38,-63.1 -63.09,-63.1 -34.71,0 -63.1,28.39 -63.1,63.1l0 130.53c-114.9,17.14 -260.31,19.42 -421.05,-2.18 209.11,99.93 576.41,33.58 705.24,-76.57 38.48,-32.89 101.67,-75.25 149.43,-91.4 151.13,-55.09 221.23,-5.03 260.55,84.96 -7.9,31.59 -71.1,31.12 -109.89,46.44 -109.8,30.41 -134.33,31.14 -244.26,11.66 -12.86,-0.26 -32.74,10.03 -27.17,24.4 10.58,216.03 -71.36,208.7 -255.45,232.26 -61.99,2.97 -1.08,-78.65 13.4,-87.72 46.13,-48.5 75.84,-52.86 86.21,-69.64 14.88,-26.72 3.03,-38.46 -31.76,-15.84 -142.22,60.11 -308.64,63.74 -496.17,18.12 -193.15,147.77 -382.49,16.88 -304.72,-13.59 67.62,-23.73 138.17,-42.34 211.83,-55.51l-26.05 -41.91c50.95,-25.54 95,-62.9 135.37,-106.56 212.3,-195.78 446.39,-180.44 696.44,-10.7z" />
                  </clipPath>
                </defs>
                {/* Основная заливка логотипа */}
                <path 
                  fill="url(#loadingLogoGradient)" 
                  d="M1798.09 319.87c-4.35,-12.65 -31.56,-22.61 -26.42,-5.52 2.53,29.43 7.74,74.72 -23.19,131.9 -34.39,29.27 5.18,34.93 43.53,16.19 64.03,-24.99 12.21,-119.88 6.08,-142.57zm-498.41 -195.06l0 0 -0.42 0 0 54.51 47.15 0c-0.78,-30.15 -21.5,-54.51 -46.73,-54.51zm-17.11 0.05l0 0c-24.28,1.3 -43.89,25.15 -44.65,54.46l44.65 0 0 -54.46zm-44.67 74.57l0 0 0 51 44.67 0 0 -51 -44.67 0zm61.36 51l0 0 47.17 0 0 -51 -47.17 0 0 51zm488.43 -118.7l0 0c-75.64,39.65 -105.96,79.31 -167.43,107.06 -14.5,6.53 -30.65,12.67 -48.33,18.34l0 -102.15c0,-34.71 -28.38,-63.1 -63.09,-63.1 -34.71,0 -63.1,28.39 -63.1,63.1l0 130.53c-114.9,17.14 -260.31,19.42 -421.05,-2.18 209.11,99.93 576.41,33.58 705.24,-76.57 38.48,-32.89 101.67,-75.25 149.43,-91.4 151.13,-55.09 221.23,-5.03 260.55,84.96 -7.9,31.59 -71.1,31.12 -109.89,46.44 -109.8,30.41 -134.33,31.14 -244.26,11.66 -12.86,-0.26 -32.74,10.03 -27.17,24.4 10.58,216.03 -71.36,208.7 -255.45,232.26 -61.99,2.97 -1.08,-78.65 13.4,-87.72 46.13,-48.5 75.84,-52.86 86.21,-69.64 14.88,-26.72 3.03,-38.46 -31.76,-15.84 -142.22,60.11 -308.64,63.74 -496.17,18.12 -193.15,147.77 -382.49,16.88 -304.72,-13.59 67.62,-23.73 138.17,-42.34 211.83,-55.51l-26.05 -41.91c50.95,-25.54 95,-62.9 135.37,-106.56 212.3,-195.78 446.39,-180.44 696.44,-10.7z"
                />
                {/* Блик по верхней части */}
                <g clipPath="url(#logoClipPath)" mask="url(#topOnlyMask)">
                  <motion.rect
                    x="0"
                    y="-200"
                    width="800"
                    height="1000"
                    fill="url(#topShineGradient)"
                    initial={{ x: -400 }}
                    animate={{ x: 2400 }}
                    transition={{ duration: 1.8, delay: 0.8, ease: "easeInOut" }}
                    style={{ transform: 'skewX(-15deg)' }}
                  />
                </g>
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Полноэкранная камера */}
      <AnimatePresence>
        {expandedCamera !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.9)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 40,
            }}
            onClick={() => setExpandedCamera(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ width: '100%', maxWidth: 1400 }}
              onClick={(e) => e.stopPropagation()}
            >
              <CameraView 
                cam={cameras[expandedCamera]} 
                isExpanded={true} 
                onClick={() => setExpandedCamera(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Камеры видеонаблюдения */}
      <div style={{ 
        width: '100%', 
        maxWidth: 1152, 
        marginBottom: 20, 
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
      }}>
        {cameras.map((cam, idx) => (
          <CameraView 
            key={idx}
            cam={cam} 
            isExpanded={false} 
            onClick={() => setExpandedCamera(idx)}
          />
        ))}
      </div>

      {/* Виджет карты */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: loadingPhase === 'done' ? 1 : 0, y: loadingPhase === 'done' ? 0 : 30 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{ width: '100%', maxWidth: 1152, marginBottom: -60, position: 'relative', zIndex: 0 }}
      >
        <div style={{
          overflow: 'visible',
          height: 500,
          position: 'relative',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 70%)',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 70%)',
        }}>
          {/* Анимированная карта */}
          <motion.div
            animate={{ y: [0, 200] }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
            style={{
              position: 'absolute',
              top: -300,
              left: -200,
              width: 'calc(100% + 400px)',
              height: 'calc(100% + 700px)',
            }}
          >
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
              <defs>
                {/* Сетка мелкая */}
                <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(40,70,100,0.05)" strokeWidth="0.5"/>
                </pattern>
                {/* Сетка крупная */}
                <pattern id="gridPatternLarge" width="150" height="150" patternUnits="userSpaceOnUse">
                  <path d="M 150 0 L 0 0 0 150" fill="none" stroke="rgba(40,70,100,0.08)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              
              {/* Сетка координат */}
              <rect width="100%" height="100%" fill="url(#gridPattern)" />
              <rect width="100%" height="100%" fill="url(#gridPatternLarge)" />
              
              {/* Главная река - вертикально, плавные кривые */}
              <path 
                d="M 810 -100 C 780 50 770 150 790 300 C 810 450 760 550 770 700 C 780 850 800 1000 790 1150 C 780 1300 810 1400 800 1550" 
                fill="none" 
                stroke="rgba(25,45,70,0.35)" 
                strokeWidth="80"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path 
                d="M 810 -100 C 780 50 770 150 790 300 C 810 450 760 550 770 700 C 780 850 800 1000 790 1150 C 780 1300 810 1400 800 1550" 
                fill="none" 
                stroke="rgba(20,38,60,0.5)" 
                strokeWidth="50"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path 
                d="M 810 -100 C 780 50 770 150 790 300 C 810 450 760 550 770 700 C 780 850 800 1000 790 1150 C 780 1300 810 1400 800 1550" 
                fill="none" 
                stroke="rgba(15,30,50,0.6)" 
                strokeWidth="25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Приток слева - плавный */}
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
              
              {/* Приток справа сверху - плавный */}
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
              
              {/* Озеро слева */}
              <ellipse cx="300" cy="650" rx="120" ry="80" fill="rgba(20,38,60,0.4)" />
              <ellipse cx="300" cy="650" rx="90" ry="55" fill="rgba(15,30,50,0.5)" />
              
              {/* Малое озеро */}
              <ellipse cx="1100" cy="500" rx="70" ry="50" fill="rgba(20,38,60,0.35)" />
              <ellipse cx="1100" cy="500" rx="50" ry="32" fill="rgba(15,30,50,0.45)" />
              
              {/* Приток к озеру - плавный */}
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
              
              {/* Ещё один приток справа снизу - плавный */}
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
              
              {/* Маленький пруд */}
              <ellipse cx="500" cy="900" rx="45" ry="35" fill="rgba(20,38,60,0.35)" />
              
              {/* Маршрут - пунктир, плавный - по центру */}
              <path 
                d="M 780 -50 C 760 100 770 250 775 400 C 780 550 765 700 770 850 C 775 1000 780 1150 772 1300 C 765 1450 778 1500 775 1600" 
                fill="none" 
                stroke="rgba(100,160,220,0.3)" 
                strokeWidth="2"
                strokeDasharray="12 8"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>
          
          {/* Хаусбот - стеклянный синий треугольник */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* Расходящиеся круги - от центра треугольника */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  scale: [0.5, 4], 
                  opacity: [0, 0.5, 0.3, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: i * 1,
                  times: [0, 0.1, 0.5, 1]
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
            
            {/* Треугольник - направлен вверх */}
            <div style={{ filter: 'drop-shadow(0 0 20px rgba(80,160,255,0.5))' }}>
              <svg width="32" height="40" viewBox="0 0 32 40">
                <defs>
                  <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(120,180,255,0.85)" />
                    <stop offset="50%" stopColor="rgba(80,140,220,0.65)" />
                    <stop offset="100%" stopColor="rgba(60,120,200,0.75)" />
                  </linearGradient>
                </defs>
                <path 
                  d="M 16 2 L 30 36 L 16 30 L 2 36 Z" 
                  fill="url(#glassGrad)"
                  stroke="rgba(150,200,255,0.7)"
                  strokeWidth="1"
                />
                {/* Блик */}
                <path 
                  d="M 16 6 L 12 28 L 16 26 Z" 
                  fill="rgba(200,230,255,0.25)"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Масштаб - слева внизу */}
        <div style={{
          position: 'absolute',
          bottom: 80,
          left: 20,
          zIndex: 10,
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}>
            <div style={{
              width: 80,
              height: 4,
              background: 'rgba(150,180,210,0.6)',
              borderRadius: 2,
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: -2,
                width: 2,
                height: 8,
                background: 'rgba(150,180,210,0.6)',
              }} />
              <div style={{
                position: 'absolute',
                right: 0,
                top: -2,
                width: 2,
                height: 8,
                background: 'rgba(150,180,210,0.6)',
              }} />
            </div>
            <span style={{
              fontSize: 9,
              color: 'rgba(150,180,210,0.7)',
              fontWeight: 500,
            }}>500 м</span>
          </div>
        </div>
        
        {/* Координаты - справа внизу */}
        <div style={{
          position: 'absolute',
          bottom: 80,
          right: 20,
          zIndex: 10,
          textAlign: 'right',
        }}>
          <div style={{
            fontSize: 10,
            fontFamily: 'monospace',
            color: 'rgba(150,180,210,0.7)',
            fontWeight: 500,
            lineHeight: 1.4,
          }}>
            <div>52°22'14.3"N</div>
            <div>4°53'28.7"E</div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: loadingPhase === 'done' ? 1 : 0, y: loadingPhase === 'done' ? 0 : 30 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ width: '100%', maxWidth: 1152, marginBottom: 20, position: 'relative', height: 102 }}
      >
        {/* Верхняя панель - 5 разделов */}
        <motion.div 
          animate={{
            height: expandedSection ? 380 : 102,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
          {/* Тонкий блик сверху */}
          <div style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent 10%, rgba(120,150,180,0.15) 50%, transparent 90%)',
          }} />
          
          {expandedSection ? (
            /* Раскрытый вид */
            <div style={{ display: 'flex', height: 'calc(100% - 1px)' }}>
              {/* Левая часть - детали раздела (75%) */}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 14, color: T.textSecondary, letterSpacing: 0.5, fontWeight: 500 }}>
                    {sectionData[expandedSection]?.title}
                  </div>
                  <button
                    onClick={() => setExpandedSection(null)}
                    style={{
                      padding: '6px 16px',
                      background: 'rgba(80,110,140,0.2)',
                      border: '1px solid rgba(100,130,160,0.3)',
                      borderRadius: 12,
                      color: 'rgba(150,180,210,0.7)',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    Закрыть
                  </button>
                </div>
                
                {/* Кастомное отображение для топлива */}
                {expandedSection === 'fuel' ? (
                  <div style={{ display: 'flex', gap: 32, flex: 1, alignItems: 'stretch' }}>
                    {/* Баки слева - flex: 1.5 */}
                    <div style={{ flex: 1.5, display: 'flex', gap: 24, alignItems: 'flex-start', justifyContent: 'center', paddingTop: 8 }}>
                      {sectionData.fuel.tanks.map((tank, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 * idx }}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
                        >
                          {/* Название над баком */}
                          <div style={{ textAlign: 'center', marginBottom: 2 }}>
                            <div style={{ fontSize: 11, fontWeight: 500, color: T.textSecondary }}>{tank.name}</div>
                            <div style={{ fontSize: 9, color: T.textMuted }}>{tank.subname}</div>
                          </div>
                          {/* Бак */}
                          <div style={{
                            width: 64,
                            height: 160,
                            borderRadius: 12,
                            background: 'rgba(20,30,45,0.8)',
                            border: `1px solid ${
                              tank.status === 'warn' ? 'rgba(220,160,60,0.4)' :
                              tank.status === 'critical' ? 'rgba(224,64,80,0.4)' :
                              'rgba(80,100,120,0.3)'
                            }`,
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)',
                          }}>
                            {/* Уровень топлива */}
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${tank.level}%` }}
                              transition={{ delay: 0.1 + idx * 0.1, duration: 0.8, ease: "easeOut" }}
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: tank.status === 'warn' 
                                  ? 'linear-gradient(180deg, rgba(220,160,60,0.7) 0%, rgba(180,120,40,0.5) 100%)'
                                  : tank.status === 'critical'
                                  ? 'linear-gradient(180deg, rgba(224,64,80,0.7) 0%, rgba(180,40,60,0.5) 100%)'
                                  : 'linear-gradient(180deg, rgba(61,200,140,0.6) 0%, rgba(40,160,110,0.4) 100%)',
                                borderRadius: '0 0 11px 11px',
                              }}
                            />
                            {/* Блик */}
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: '60%',
                              bottom: 0,
                              background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
                              borderRadius: '12px 0 0 12px',
                            }} />
                          </div>
                          {/* Процент под шкалой */}
                          <div style={{ 
                            fontSize: 18, 
                            fontWeight: 600, 
                            color: tank.status === 'warn' ? 'rgba(220,160,60,0.9)' :
                                   tank.status === 'critical' ? T.textRed :
                                   T.textPrimary,
                          }}>
                            {tank.level}%
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Вертикальный разделитель */}
                    <div style={{ width: 1, background: 'linear-gradient(180deg, transparent 5%, rgba(80,100,120,0.3) 50%, transparent 95%)' }} />
                    
                    {/* Метрики справа - выровнены по шкалам */}
                    <div style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                      paddingTop: 8, /* такой же как у контейнера баков */
                    }}>
                      {/* Пустое место под названия баков */}
                      <div style={{ height: 34 }} />
                      
                      {/* Контейнер метрик - высота как у шкал */}
                      <div style={{ 
                        height: 160, 
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}>
                        {/* Верхний ряд - Расход */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                          {sectionData.fuel.metrics.slice(0, 2).map((metric, idx) => (
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
                        {/* Нижний ряд - Израсходовано */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                          {sectionData.fuel.metrics.slice(2, 4).map((metric, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.25 + 0.05 * idx }}
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
                  </div>
                ) : expandedSection === 'tanks' ? (
                  /* Кастомное отображение для ёмкостей */
                  <div style={{ display: 'flex', gap: 32, flex: 1, alignItems: 'stretch' }}>
                    {/* Баки слева - flex: 1.5 */}
                    <div style={{ flex: 1.5, display: 'flex', gap: 20, alignItems: 'flex-start', justifyContent: 'center', paddingTop: 8 }}>
                      {sectionData.tanks.containers.map((container, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 * idx }}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
                        >
                          {/* Название над баком */}
                          <div style={{ textAlign: 'center', marginBottom: 2, height: 28 }}>
                            <div style={{ fontSize: 11, fontWeight: 500, color: T.textSecondary }}>{container.name}</div>
                            {container.subname && <div style={{ fontSize: 9, color: T.textMuted }}>{container.subname}</div>}
                          </div>
                          {/* Бак */}
                          <div style={{
                            width: 56,
                            height: 160,
                            borderRadius: 12,
                            background: 'rgba(20,30,45,0.8)',
                            border: `1px solid ${
                              container.status === 'critical' ? 'rgba(224,64,80,0.4)' :
                              container.status === 'warn' ? 'rgba(220,160,60,0.4)' :
                              'rgba(80,100,120,0.3)'
                            }`,
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)',
                          }}>
                            {/* Уровень */}
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${container.level}%` }}
                              transition={{ delay: 0.1 + idx * 0.1, duration: 0.8, ease: "easeOut" }}
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: container.status === 'critical'
                                  ? 'linear-gradient(180deg, rgba(224,64,80,0.7) 0%, rgba(180,40,60,0.5) 100%)'
                                  : container.status === 'warn' 
                                  ? 'linear-gradient(180deg, rgba(220,160,60,0.7) 0%, rgba(180,120,40,0.5) 100%)'
                                  : 'linear-gradient(180deg, rgba(100,160,220,0.6) 0%, rgba(60,120,180,0.4) 100%)',
                                borderRadius: '0 0 11px 11px',
                              }}
                            />
                            {/* Блик */}
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: '60%',
                              bottom: 0,
                              background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
                              borderRadius: '12px 0 0 12px',
                            }} />
                          </div>
                          {/* Процент под шкалой */}
                          <div style={{ 
                            fontSize: 18, 
                            fontWeight: 600, 
                            color: container.status === 'critical' ? T.textRed :
                                   container.status === 'warn' ? 'rgba(220,160,60,0.9)' :
                                   T.textPrimary,
                          }}>
                            {container.level}%
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Вертикальный разделитель */}
                    <div style={{ width: 1, background: 'linear-gradient(180deg, transparent 5%, rgba(80,100,120,0.3) 50%, transparent 95%)' }} />
                    
                    {/* Метрики справа - выровнены по шкалам */}
                    <div style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                      paddingTop: 8,
                    }}>
                      {/* Пустое место под названия */}
                      <div style={{ height: 34 }} />
                      
                      {/* Контейнер метрик - высота как у шкал */}
                      <div style={{ 
                        height: 160, 
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}>
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
                  /* Стандартная плитка показателей для остальных разделов */
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                    gap: 12,
                    flex: 1,
                    alignContent: 'start',
                  }}>
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
                            metric.status === 'critical' ? 'rgba(224,64,80,0.4)' :
                            metric.status === 'warn' ? 'rgba(220,160,60,0.4)' :
                            metric.status === 'ok' ? 'rgba(61,200,140,0.3)' :
                            'rgba(80,100,120,0.3)'
                          }`,
                          borderRadius: 12,
                        }}
                      >
                        <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 6 }}>{metric.label}</div>
                        <div style={{ 
                          fontSize: 22, 
                          fontWeight: 600, 
                          color: metric.status === 'critical' ? T.textRed :
                                 metric.status === 'warn' ? 'rgba(220,160,60,0.9)' :
                                 metric.status === 'ok' ? T.textGreen :
                                 metric.status === 'off' ? T.textMuted :
                                 T.textPrimary,
                        }}>
                          {metric.value}
                          {metric.unit && <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 4, color: T.textMuted }}>{metric.unit}</span>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
              
              {/* Правая часть - остальные разделы (25%) */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {sectionKeys.filter(key => key !== expandedSection).map((key, idx, arr) => {
                  return (
                    <React.Fragment key={key}>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        onClick={() => setExpandedSection(key)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: '8px 12px',
                        }}
                      >
                        {key === 'fuel' && (
                          <>
                            <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 0.5, fontWeight: 500, marginBottom: 6 }}>ТОПЛИВО</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '75%' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ fontSize: 8, color: T.textMuted, width: 24 }}>АИ-95</div>
                                <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(30,45,60,0.6)', border: '1px solid rgba(80,100,120,0.3)', overflow: 'hidden' }}>
                                  <div style={{ width: '78%', height: '100%', background: 'linear-gradient(90deg, rgba(61,200,140,0.7) 0%, rgba(61,200,140,0.5) 100%)', borderRadius: 2 }} />
                                </div>
                                <div style={{ fontSize: 9, color: T.textSecondary, width: 24, textAlign: 'right' }}>78%</div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ fontSize: 8, color: T.textMuted, width: 24 }}>ДТ</div>
                                <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(30,45,60,0.6)', border: '1px solid rgba(80,100,120,0.3)', overflow: 'hidden' }}>
                                  <div style={{ width: '45%', height: '100%', background: 'linear-gradient(90deg, rgba(220,160,60,0.7) 0%, rgba(220,160,60,0.5) 100%)', borderRadius: 2 }} />
                                </div>
                                <div style={{ fontSize: 9, color: T.textSecondary, width: 24, textAlign: 'right' }}>45%</div>
                              </div>
                            </div>
                          </>
                        )}
                        {key === 'weather' && (
                          <>
                            <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 0.5, fontWeight: 500, marginBottom: 6 }}>ПОГОДА</div>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: T.textSecondary }}>18°</div>
                                <div style={{ fontSize: 8, color: T.textMuted }}>вода</div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: T.textSecondary }}>5м/с</div>
                                <div style={{ fontSize: 8, color: T.textMuted }}>ветер</div>
                              </div>
                            </div>
                          </>
                        )}
                        {key === 'electric' && (
                          <>
                            <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 0.5, fontWeight: 500, marginBottom: 6 }}>ЭЛЕКТРИКА</div>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: T.textSecondary }}>12.8В</div>
                                <div style={{ fontSize: 8, color: T.textMuted }}>АКБ</div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: T.textSecondary }}>2.1кВт</div>
                                <div style={{ fontSize: 8, color: T.textMuted }}>солнце</div>
                              </div>
                            </div>
                          </>
                        )}
                        {key === 'tanks' && (
                          <>
                            <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 0.5, fontWeight: 500, marginBottom: 6 }}>ЁМКОСТИ</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '75%' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ fontSize: 8, color: T.textMuted, width: 28 }}>вода</div>
                                <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(30,45,60,0.6)', border: '1px solid rgba(80,100,120,0.3)', overflow: 'hidden' }}>
                                  <div style={{ width: '65%', height: '100%', background: 'linear-gradient(90deg, rgba(61,200,140,0.7) 0%, rgba(61,200,140,0.5) 100%)', borderRadius: 2 }} />
                                </div>
                                <div style={{ fontSize: 9, color: T.textSecondary, width: 24, textAlign: 'right' }}>65%</div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ fontSize: 8, color: T.textMuted, width: 28 }}>септик</div>
                                <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(30,45,60,0.6)', border: '1px solid rgba(224,64,80,0.4)', overflow: 'hidden' }}>
                                  <div style={{ width: '87%', height: '100%', background: 'linear-gradient(90deg, rgba(224,64,80,0.8) 0%, rgba(224,64,80,0.6) 100%)', borderRadius: 2 }} />
                                </div>
                                <div style={{ fontSize: 9, color: T.textRed, width: 24, textAlign: 'right' }}>87%</div>
                              </div>
                            </div>
                          </>
                        )}
                        {key === 'safety' && (
                          <>
                            <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 0.5, fontWeight: 500, marginBottom: 8 }}>БЕЗОПАСНОСТЬ</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ 
                                width: 6, 
                                height: 6, 
                                borderRadius: '50%', 
                                background: 'rgba(61,200,140,0.7)',
                                boxShadow: '0 0 4px rgba(61,200,140,0.5)',
                              }} />
                              <div style={{ fontSize: 13, fontWeight: 500, color: T.textSecondary }}>ОК</div>
                            </div>
                          </>
                        )}
                      </motion.div>
                      {idx < arr.length - 1 && (
                        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent 10%, rgba(80,100,120,0.3) 50%, transparent 90%)' }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Свёрнутый вид */
            <div style={{ display: 'flex', alignItems: 'stretch' }}>
              {/* ТОПЛИВО */}
              <div 
                onClick={() => setExpandedSection('fuel')}
                style={{ flex: 1, height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 12, cursor: 'pointer' }}
              >
                <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: 0.5, fontWeight: 500, marginBottom: 8 }}>ТОПЛИВО</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: '80%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 8, color: T.textMuted, width: 32 }}>ЛЕВ.</div>
                    <div style={{ flex: 1, height: 7, borderRadius: 4, background: 'rgba(30,45,60,0.6)', border: '1px solid rgba(80,100,120,0.3)', overflow: 'hidden' }}>
                      <div style={{ width: '78%', height: '100%', background: 'linear-gradient(90deg, rgba(61,200,140,0.7) 0%, rgba(61,200,140,0.5) 100%)', borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 10, color: T.textSecondary, width: 28, textAlign: 'right' }}>78%</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 8, color: T.textMuted, width: 32 }}>ПРАВ.</div>
                    <div style={{ flex: 1, height: 7, borderRadius: 4, background: 'rgba(30,45,60,0.6)', border: '1px solid rgba(80,100,120,0.3)', overflow: 'hidden' }}>
                      <div style={{ width: '72%', height: '100%', background: 'linear-gradient(90deg, rgba(61,200,140,0.7) 0%, rgba(61,200,140,0.5) 100%)', borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 10, color: T.textSecondary, width: 28, textAlign: 'right' }}>72%</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 8, color: T.textMuted, width: 32 }}>ГЕН.</div>
                    <div style={{ flex: 1, height: 7, borderRadius: 4, background: 'rgba(30,45,60,0.6)', border: '1px solid rgba(80,100,120,0.3)', overflow: 'hidden' }}>
                      <div style={{ width: '45%', height: '100%', background: 'linear-gradient(90deg, rgba(220,160,60,0.7) 0%, rgba(220,160,60,0.5) 100%)', borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 10, color: T.textSecondary, width: 28, textAlign: 'right' }}>45%</div>
                  </div>
                </div>
              </div>
              
              <div style={{ width: 1, background: 'linear-gradient(180deg, transparent 10%, rgba(80,100,120,0.3) 50%, transparent 90%)' }} />
              
              {/* ПОГОДА */}
              <div 
                onClick={() => setExpandedSection('weather')}
                style={{ flex: 1, height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 12, cursor: 'pointer' }}
              >
                <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: 0.5, fontWeight: 500, marginBottom: 16 }}>ПОГОДА</div>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 500, color: T.textSecondary }}>18°</div>
                    <div style={{ fontSize: 9, color: T.textMuted }}>вода</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 500, color: T.textSecondary }}>5 м/с</div>
                    <div style={{ fontSize: 9, color: T.textMuted }}>ветер</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 500, color: T.textSecondary }}>1013</div>
                    <div style={{ fontSize: 9, color: T.textMuted }}>гПа</div>
                  </div>
                </div>
              </div>
              
              <div style={{ width: 1, background: 'linear-gradient(180deg, transparent 10%, rgba(80,100,120,0.3) 50%, transparent 90%)' }} />
              
              {/* ЭЛЕКТРИКА */}
              <div 
                onClick={() => setExpandedSection('electric')}
                style={{ flex: 1, height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 12, cursor: 'pointer' }}
              >
                <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: 0.5, fontWeight: 500, marginBottom: 16 }}>ЭЛЕКТРИКА</div>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 500, color: T.textSecondary }}>12.8 В</div>
                    <div style={{ fontSize: 9, color: T.textMuted }}>АКБ</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 500, color: T.textSecondary }}>2.1 кВт</div>
                    <div style={{ fontSize: 9, color: T.textMuted }}>солнце</div>
                  </div>
                </div>
              </div>
              
              <div style={{ width: 1, background: 'linear-gradient(180deg, transparent 10%, rgba(80,100,120,0.3) 50%, transparent 90%)' }} />
              
              {/* ЁМКОСТИ */}
              <div 
                onClick={() => setExpandedSection('tanks')}
                style={{ flex: 1, height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 12, cursor: 'pointer' }}
              >
                <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: 0.5, fontWeight: 500, marginBottom: 16 }}>ЁМКОСТИ</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '70%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 9, color: T.textMuted, width: 36 }}>вода</div>
                    <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(30,45,60,0.6)', border: '1px solid rgba(80,100,120,0.3)', overflow: 'hidden' }}>
                      <div style={{ width: '65%', height: '100%', background: 'linear-gradient(90deg, rgba(61,200,140,0.7) 0%, rgba(61,200,140,0.5) 100%)', borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 11, color: T.textSecondary, width: 28, textAlign: 'right' }}>65%</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 9, color: T.textMuted, width: 36 }}>септик</div>
                    <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(30,45,60,0.6)', border: '1px solid rgba(224,64,80,0.4)', overflow: 'hidden' }}>
                      <div style={{ width: '87%', height: '100%', background: 'linear-gradient(90deg, rgba(224,64,80,0.8) 0%, rgba(224,64,80,0.6) 100%)', borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 11, color: T.textRed, width: 28, textAlign: 'right' }}>87%</div>
                  </div>
                </div>
              </div>
              
              <div style={{ width: 1, background: 'linear-gradient(180deg, transparent 10%, rgba(80,100,120,0.3) 50%, transparent 90%)' }} />
              
              {/* БЕЗОПАСНОСТЬ */}
              <div 
                onClick={() => setExpandedSection('safety')}
                style={{ flex: 1, height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 12, cursor: 'pointer' }}
              >
                <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: 0.5, fontWeight: 500, marginBottom: 24 }}>БЕЗОПАСНОСТЬ</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    background: 'rgba(61,200,140,0.7)',
                    boxShadow: '0 0 6px rgba(61,200,140,0.5)',
                  }} />
                  <div style={{ fontSize: 16, fontWeight: 500, color: T.textSecondary }}>ОК</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: loadingPhase === 'done' ? 1 : 0, y: loadingPhase === 'done' ? 0 : 30 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{ width: '100%', maxWidth: 1200, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, overflow: 'visible' }}
      >
        <div style={{ marginRight: -92, paddingTop: 20 }}>
          <EngineCard side="Left" tempText="Темп 82°C · Масло ОК" rpm={Math.round(rpmLeft)} throttle={Math.round(throttleLeft)} gear={gearLeft} motorHours={1247} fuelLevel={75} expanded={false} onToggleExpand={() => setExpandedEngine("Left")} />
        </div>

        <div style={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 20 }}>
          {/* Компас и Киль над стекляшкой */}
          <div style={{ display: 'flex', gap: 30, marginBottom: 16 }}>
            {/* Компас */}
            <div style={{
              width: 135,
              height: 135,
              borderRadius: '50%',
              background: 'linear-gradient(165deg, #e8e8e8 0%, #b8b8b8 15%, #909090 30%, #707070 50%, #909090 70%, #b8b8b8 85%, #a0a0a0 100%)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              padding: 5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'linear-gradient(145deg, rgba(10,15,25,0.98) 0%, rgba(5,8,15,1) 100%)',
                position: 'relative',
              }}>
                <motion.div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  animate={{ rotate: -heading }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                >
                  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                    {Array.from({ length: 36 }).map((_, i) => {
                      const angle = (i * 10) * Math.PI / 180;
                      const isMajor = i % 9 === 0;
                      const r1 = isMajor ? 38 : 42;
                      const r2 = 48;
                      return (
                        <line
                          key={i}
                          x1={50 + r1 * Math.sin(angle)}
                          y1={50 - r1 * Math.cos(angle)}
                          x2={50 + r2 * Math.sin(angle)}
                          y2={50 - r2 * Math.cos(angle)}
                          stroke={isMajor ? 'rgba(200,210,230,0.8)' : 'rgba(150,160,180,0.4)'}
                          strokeWidth={isMajor ? 2 : 1}
                        />
                      );
                    })}
                    <text x="50" y="20" fill="rgba(200,210,230,0.6)" fontSize="9" fontWeight="500" textAnchor="middle" dominantBaseline="middle">С</text>
                    <text x="50" y="80" fill="rgba(200,210,230,0.6)" fontSize="9" fontWeight="500" textAnchor="middle" dominantBaseline="middle" transform="rotate(180 50 80)">Ю</text>
                    <text x="80" y="50" fill="rgba(200,210,230,0.6)" fontSize="9" fontWeight="500" textAnchor="middle" dominantBaseline="middle" transform="rotate(90 80 50)">В</text>
                    <text x="20" y="50" fill="rgba(200,210,230,0.6)" fontSize="9" fontWeight="500" textAnchor="middle" dominantBaseline="middle" transform="rotate(-90 20 50)">З</text>
                  </svg>
                </motion.div>
                <div style={{
                  position: 'absolute',
                  top: -18,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '7px solid transparent',
                  borderRight: '7px solid transparent',
                  borderTop: '11px solid #d44050',
                  filter: 'drop-shadow(0 0 4px rgba(212,64,80,0.6))',
                }} />
              </div>
            </div>

            {/* Киль */}
            <div style={{
              width: 135,
              height: 135,
              borderRadius: '50%',
              background: 'linear-gradient(165deg, #e8e8e8 0%, #b8b8b8 15%, #909090 30%, #707070 50%, #909090 70%, #b8b8b8 85%, #a0a0a0 100%)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              padding: 5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'linear-gradient(145deg, rgba(10,15,25,0.98) 0%, rgba(5,8,15,1) 100%)',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <svg viewBox="0 0 100 100" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                  {Array.from({ length: 19 }).map((_, i) => {
                    const deg = -45 + i * 5;
                    const angle = (deg + 90) * Math.PI / 180;
                    const isMajor = deg % 15 === 0;
                    const r1 = isMajor ? 38 : 40;
                    const r2 = 46;
                    return (
                      <line
                        key={i}
                        x1={50 + r1 * Math.cos(angle)}
                        y1={50 + r1 * Math.sin(angle)}
                        x2={50 + r2 * Math.cos(angle)}
                        y2={50 + r2 * Math.sin(angle)}
                        stroke={isMajor ? 'rgba(200,210,230,0.8)' : 'rgba(150,160,180,0.4)'}
                        strokeWidth={isMajor ? 2 : 1}
                        strokeLinecap="round"
                      />
                    );
                  })}
                </svg>
                <svg
                  viewBox="0 0 24 32"
                  style={{
                    position: 'absolute',
                    top: 22,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 33,
                    height: 45,
                    opacity: 0.35,
                  }}
                >
                  <path
                    d="M12 1 L18 8 L19 22 Q12 30 5 22 L6 8 Z"
                    fill="rgba(150,180,210,0.6)"
                    stroke="rgba(150,180,210,0.8)"
                    strokeWidth="0.5"
                  />
                  <ellipse
                    cx="12"
                    cy="14"
                    rx="4"
                    ry="6"
                    fill="rgba(100,130,160,0.5)"
                  />
                </svg>
                <motion.div
                  style={{
                    position: 'absolute',
                    top: 57,
                    left: '50%',
                    width: 4,
                    height: 48,
                    marginLeft: -2,
                    background: 'linear-gradient(90deg, #a03040 0%, #d04050 25%, #e85060 50%, #d04050 75%, #a03040 100%)',
                    borderRadius: 2,
                    transformOrigin: 'center top',
                    boxShadow: '0 0 8px rgba(224,80,96,0.5)',
                  }}
                  animate={{ rotate: rudderDeg }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                />
                {/* Центральная пипка */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #d0d0d0 30%, #909090 70%, #606060 100%)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                }} />
              </div>
            </div>
          </div>

          <div style={{ position: 'relative', width: 230, height: 127, marginTop: 4 }}>

            {/* Стекляшка - расширяется от центра */}
            {(() => {
              const expandedFaults = expandedEngine === "Left" ? [] : ["E102 - Датчик температуры", "E045 - Низкое давление масла"];
              const hasExpandedFaults = expandedFaults.length > 0;
              const expandedWidth = hasExpandedFaults ? 580 : 380;
              const expandedHeight = 380;
              const collapsedWidth = 230;
              const collapsedHeight = 127;
              
              return (
            <motion.div 
              animate={{
                width: expandedEngine ? expandedWidth : collapsedWidth,
                height: expandedEngine ? expandedHeight : collapsedHeight,
                x: expandedEngine ? -expandedWidth / 2 : -collapsedWidth / 2,
                y: expandedEngine ? -expandedHeight / 2 : -collapsedHeight / 2,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ 
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: collapsedWidth, 
                height: collapsedHeight,
                borderRadius: 28,
                background: 'linear-gradient(145deg, rgba(15,22,35,0.97) 0%, rgba(8,12,22,0.98) 50%, rgba(5,8,15,1) 100%)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4), inset 0 1px 1px rgba(100,140,200,0.1), inset 0 -2px 10px rgba(0,0,0,0.5)',
                border: '1px solid rgba(80,100,130,0.2)',
                overflow: 'hidden',
                zIndex: expandedEngine ? 30 : 2,
              }}
            >
              <div style={{
                position: 'absolute',
                inset: 4,
                borderRadius: 24,
                boxShadow: 'inset 0 6px 20px rgba(0,0,0,0.8), inset 0 2px 8px rgba(0,5,15,0.5)',
                pointerEvents: 'none',
              }} />

              <div style={{
                position: 'absolute',
                top: 0,
                left: 12,
                right: 12,
                height: 40,
                borderRadius: '0 0 50% 50%',
                background: 'linear-gradient(180deg, rgba(180,210,255,0.12) 0%, rgba(150,180,220,0.05) 40%, transparent 100%)',
                pointerEvents: 'none',
              }} />
              
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: expandedEngine ? 'flex-start' : 'center',
                padding: expandedEngine ? '28px 32px 24px' : 0,
              }}>
                {expandedEngine ? (
                  <>
                    <div style={{ fontSize: 16, fontWeight: 600, color: hasExpandedFaults ? T.textRed : T.textSecondary, marginBottom: 20 }}>
                      {expandedEngine === "Left" ? "Левый" : "Правый"} двигатель
                    </div>
                    
                    <div style={{ display: 'flex', width: '100%', flex: 1, position: 'relative', alignItems: 'flex-start' }}>
                      {/* Левая часть - показания (всегда 50% или 100% без ошибок) */}
                      <div style={{ 
                        flex: 1, 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '16px 24px', 
                        alignContent: 'start',
                        paddingRight: hasExpandedFaults ? 24 : 0,
                      }}>
                        <div style={{ textAlign: 'center', minWidth: 80 }}>
                          <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>ОБ/МИН</div>
                          <div style={{ fontSize: 26, fontWeight: 600, color: '#d4af65', textShadow: '0 0 20px rgba(212,175,101,0.3)', fontVariantNumeric: 'tabular-nums', minWidth: 70 }}>
                            {expandedEngine === "Left" ? Math.round(rpmLeft).toLocaleString() : Math.round(rpmRight).toLocaleString()}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', minWidth: 80 }}>
                          <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>ГАЗ</div>
                          <div style={{ fontSize: 26, fontWeight: 600, color: T.textPrimary, fontVariantNumeric: 'tabular-nums', minWidth: 50 }}>
                            {(expandedEngine === "Left" ? Math.round(throttleLeft) : Math.round(throttleRight)).toString().padStart(2, '\u2007')}%
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', minWidth: 80 }}>
                          <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>ТЕМП.</div>
                          <div style={{ fontSize: 26, fontWeight: 600, color: T.textGreen }}>
                            {expandedEngine === "Left" ? "82°C" : "81°C"}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', minWidth: 80 }}>
                          <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>МАСЛО</div>
                          <div style={{ fontSize: 26, fontWeight: 600, color: T.textGreen }}>ОК</div>
                        </div>
                        <div style={{ textAlign: 'center', minWidth: 80 }}>
                          <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>ПЕР.</div>
                          <div style={{ fontSize: 26, fontWeight: 600, color: T.textPrimary }}>
                            {expandedEngine === "Left" ? gearLeft : gearRight}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', minWidth: 80 }}>
                          <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>ДАВЛ.</div>
                          <div style={{ fontSize: 26, fontWeight: 600, color: T.textGreen }}>4.2</div>
                        </div>
                      </div>
                      
                      {/* Правая часть - ошибки */}
                      {hasExpandedFaults && (
                        <div style={{ 
                          flex: 1,
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: 8,
                          paddingLeft: 24,
                          justifyContent: 'flex-start',
                        }}>
                          <div style={{ fontSize: 11, color: T.textRed, fontWeight: 600, marginBottom: 4 }}>
                            ОШИБКИ ({expandedFaults.length})
                          </div>
                          {expandedFaults.map((fault, idx) => (
                            <div 
                              key={idx}
                              style={{
                                padding: '10px 14px',
                                background: 'rgba(224,64,80,0.12)',
                                border: '1px solid rgba(224,64,80,0.25)',
                                borderRadius: 10,
                                fontSize: 12,
                                color: T.textRed,
                                lineHeight: 1.4,
                              }}
                            >
                              {fault}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => setExpandedEngine(null)}
                      style={{
                        marginTop: 16,
                        padding: '10px 28px',
                        background: 'rgba(80,110,140,0.2)',
                        border: '1px solid rgba(100,130,160,0.3)',
                        borderRadius: 20,
                        color: 'rgba(150,180,210,0.7)',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      Закрыть
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ 
                      fontSize: 56, 
                      fontWeight: 400, 
                      color: '#d4af65',
                      textShadow: '0 0 30px rgba(212,175,101,0.4), 0 0 60px rgba(212,175,101,0.2)',
                      letterSpacing: -2,
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {speed.toFixed(1)}
                    </div>
                    
                    <div style={{ 
                      fontSize: 12, 
                      color: 'rgba(212,175,101,0.5)',
                      letterSpacing: 3,
                      marginTop: 2,
                    }}>
                      км/ч
                    </div>
                  </>
                )}
              </div>
              
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 28,
                border: '1px solid rgba(150,180,220,0.08)',
                pointerEvents: 'none',
              }} />
            </motion.div>
              );
            })()}
            
            {/* Лого houseboat - плоское темное */}
            <div style={{
              position: 'absolute',
              bottom: -58,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 5,
            }}>
              <svg width="75" height="48" viewBox="600 -100 1620 750" style={{ opacity: 0.6 }}>
                <path 
                  fill="#2a3a4a" 
                  d="M1798.09 319.87c-4.35,-12.65 -31.56,-22.61 -26.42,-5.52 2.53,29.43 7.74,74.72 -23.19,131.9 -34.39,29.27 5.18,34.93 43.53,16.19 64.03,-24.99 12.21,-119.88 6.08,-142.57zm-498.41 -195.06l0 0 -0.42 0 0 54.51 47.15 0c-0.78,-30.15 -21.5,-54.51 -46.73,-54.51zm-17.11 0.05l0 0c-24.28,1.3 -43.89,25.15 -44.65,54.46l44.65 0 0 -54.46zm-44.67 74.57l0 0 0 51 44.67 0 0 -51 -44.67 0zm61.36 51l0 0 47.17 0 0 -51 -47.17 0 0 51zm488.43 -118.7l0 0c-75.64,39.65 -105.96,79.31 -167.43,107.06 -14.5,6.53 -30.65,12.67 -48.33,18.34l0 -102.15c0,-34.71 -28.38,-63.1 -63.09,-63.1 -34.71,0 -63.1,28.39 -63.1,63.1l0 130.53c-114.9,17.14 -260.31,19.42 -421.05,-2.18 209.11,99.93 576.41,33.58 705.24,-76.57 38.48,-32.89 101.67,-75.25 149.43,-91.4 151.13,-55.09 221.23,-5.03 260.55,84.96 -7.9,31.59 -71.1,31.12 -109.89,46.44 -109.8,30.41 -134.33,31.14 -244.26,11.66 -12.86,-0.26 -32.74,10.03 -27.17,24.4 10.58,216.03 -71.36,208.7 -255.45,232.26 -61.99,2.97 -1.08,-78.65 13.4,-87.72 46.13,-48.5 75.84,-52.86 86.21,-69.64 14.88,-26.72 3.03,-38.46 -31.76,-15.84 -142.22,60.11 -308.64,63.74 -496.17,18.12 -193.15,147.77 -382.49,16.88 -304.72,-13.59 67.62,-23.73 138.17,-42.34 211.83,-55.51l-26.05 -41.91c50.95,-25.54 95,-62.9 135.37,-106.56 212.3,-195.78 446.39,-180.44 696.44,-10.7z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div style={{ marginLeft: -92, paddingTop: 20 }}>
          <EngineCard side="Right" tempText="Темп 81°C · Масло ОК" rpm={Math.round(rpmRight)} throttle={Math.round(throttleRight)} gear={gearRight} motorHours={1198} fuelLevel={18} expanded={false} onToggleExpand={() => setExpandedEngine("Right")} />
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: loadingPhase === 'done' ? 1 : 0, y: loadingPhase === 'done' ? 0 : 30 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        style={{ width: '100%', maxWidth: 1152, marginTop: 20 }}
      >
        {/* Глубокая стеклянная панель в стиле Mercedes */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(12,18,28,0.95) 0%, rgba(6,10,18,0.98) 100%)',
          borderRadius: 20,
          border: '1px solid rgba(60,80,100,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(100,130,160,0.08)',
          overflow: 'hidden',
        }}>
          {/* Тонкий блик сверху */}
          <div style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent 10%, rgba(120,150,180,0.15) 50%, transparent 90%)',
          }} />
          
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            {controlItems.map((it, idx) => {
              const Icon = it.icon;
              const on = controls[it.key];
              const isAnchor = it.key === 'anchor';
              const anchorDeployed = isAnchor && anchorPosition > 0;
              const buttonOn = isAnchor ? anchorDeployed : on;
              const buttonColor = isAnchor && anchorDeployed ? T.textRed : T.textGreen;
              return (
                <React.Fragment key={it.key}>
                  <button
                    onClick={() => toggleControl(it.key)}
                    style={{
                      flex: 1,
                      height: 72,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      border: 'none',
                      background: buttonOn 
                        ? isAnchor && anchorDeployed
                          ? 'linear-gradient(180deg, rgba(100,40,50,0.3) 0%, rgba(60,20,30,0.2) 100%)'
                          : 'linear-gradient(180deg, rgba(40,100,80,0.3) 0%, rgba(20,60,50,0.2) 100%)'
                        : 'transparent',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    {buttonOn && (
                      <div style={{
                        position: 'absolute',
                        bottom: 6,
                        left: '20%',
                        right: '20%',
                        height: 2,
                        background: buttonColor,
                        boxShadow: `0 0 12px ${isAnchor && anchorDeployed ? 'rgba(224,64,80,0.8)' : 'rgba(61,200,140,0.8)'}`,
                        borderRadius: 1,
                      }} />
                    )}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon style={{ width: 24, height: 24, color: buttonOn ? buttonColor : T.textSecondary }} />
                      {isAnchor && anchorDeployed && (
                        <span style={{ 
                          position: 'absolute',
                          left: '100%',
                          marginLeft: 4,
                          fontSize: 12, 
                          color: 'rgba(224,64,80,0.5)', 
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                        }}>
                          {Math.round(anchorPosition)}%
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: buttonOn ? buttonColor : T.textMuted, fontWeight: 500, marginTop: -2 }}>{it.label}</span>
                  </button>
                  {/* Вертикальный разделитель */}
                  {idx < controlItems.length - 1 && (
                    <div style={{
                      width: 1,
                      background: 'linear-gradient(180deg, transparent 10%, rgba(80,100,120,0.3) 50%, transparent 90%)',
                    }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Модальное окно управления якорем */}
      {anchorModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setAnchorModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(180deg, rgba(12,18,28,0.95) 0%, rgba(6,10,18,0.98) 100%)',
              borderRadius: 20,
              border: '1px solid rgba(60,80,100,0.2)',
              boxShadow: '0 16px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(100,130,160,0.08)',
              overflow: 'hidden',
              width: 360,
            }}
          >
            {/* Тонкий блик сверху */}
            <div style={{
              height: 1,
              background: 'linear-gradient(90deg, transparent 10%, rgba(120,150,180,0.15) 50%, transparent 90%)',
            }} />
            
            <div style={{ padding: 24 }}>
              {/* Заголовок */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 14, color: T.textSecondary, letterSpacing: 0.5, fontWeight: 500 }}>ЯКОРЬ</div>
                <button
                  onClick={() => setAnchorModal(false)}
                  style={{
                    padding: '6px 16px',
                    background: 'rgba(80,110,140,0.2)',
                    border: '1px solid rgba(100,130,160,0.3)',
                    borderRadius: 12,
                    color: 'rgba(150,180,210,0.7)',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  Закрыть
                </button>
              </div>

              {/* Контент */}
              <div style={{ display: 'flex', gap: 32, alignItems: 'stretch' }}>
                {/* Лодка и якорь */}
                <div style={{ 
                  width: 140, 
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}>
                  {/* Днище лодки */}
                  <svg width="140" height="28" viewBox="0 0 140 28" style={{ marginTop: 0, flexShrink: 0 }}>
                    {/* Корпус */}
                    <path 
                      d="M10 0 L130 0 L122 24 Q70 30 18 24 L10 0 Z" 
                      fill="rgba(40,55,75,0.6)"
                      stroke="rgba(80,100,120,0.4)"
                      strokeWidth="1"
                    />
                    {/* Блик */}
                    <path 
                      d="M15 3 L125 3 L119 18 Q70 22 21 18 L15 3 Z" 
                      fill="rgba(60,80,100,0.2)"
                    />
                    {/* Точка крепления якоря */}
                    <circle cx="70" cy="22" r="4" fill="rgba(80,100,120,0.5)" stroke="rgba(100,130,160,0.4)" strokeWidth="1" />
                  </svg>

                  {/* Цепь */}
                  <div style={{
                    position: 'absolute',
                    top: 26,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 4,
                    overflow: 'hidden',
                  }}>
                    <motion.div
                      animate={{ height: anchorPosition * 1.2 }}
                      transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      style={{
                        width: '100%',
                        background: 'repeating-linear-gradient(180deg, rgba(200,170,100,0.9) 0px, rgba(200,170,100,0.9) 4px, rgba(160,130,60,0.5) 4px, rgba(160,130,60,0.5) 8px)',
                      }}
                    />
                  </div>

                  {/* Якорь */}
                  <motion.div
                    animate={{ y: anchorPosition * 1.2 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    style={{
                      position: 'absolute',
                      top: 22,
                      left: '50%',
                      marginLeft: -18,
                    }}
                  >
                    <Anchor style={{ width: 36, height: 36, color: 'rgba(220,190,120,0.95)' }} />
                  </motion.div>

                  {/* Вода / дно */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 24,
                    background: 'linear-gradient(180deg, rgba(40,70,100,0.15) 0%, rgba(30,50,70,0.3) 100%)',
                    borderRadius: '0 0 8px 8px',
                  }} />
                </div>

                {/* Показатели */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                      padding: '14px 16px',
                      background: 'rgba(30,45,60,0.4)',
                      border: '1px solid rgba(80,100,120,0.3)',
                      borderRadius: 12,
                    }}
                  >
                    <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 6 }}>ВЫПУЩЕНО</div>
                    <div style={{ fontSize: 28, fontWeight: 600, color: T.textPrimary }}>
                      {Math.round(anchorPosition)}
                      <span style={{ fontSize: 14, fontWeight: 400, marginLeft: 4, color: T.textMuted }}>%</span>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    style={{
                      padding: '14px 16px',
                      background: 'rgba(30,45,60,0.4)',
                      border: '1px solid rgba(80,100,120,0.3)',
                      borderRadius: 12,
                    }}
                  >
                    <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 6 }}>ГЛУБИНА</div>
                    <div style={{ fontSize: 28, fontWeight: 600, color: T.textPrimary }}>
                      {anchorDepthMeters.toFixed(1)}
                      <span style={{ fontSize: 14, fontWeight: 400, marginLeft: 4, color: T.textMuted }}>м</span>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Кнопки управления */}
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button
                  onMouseDown={() => setAnchorMoving('up')}
                  onMouseUp={() => setAnchorMoving(null)}
                  onMouseLeave={() => setAnchorMoving(null)}
                  onTouchStart={() => setAnchorMoving('up')}
                  onTouchEnd={() => setAnchorMoving(null)}
                  style={{
                    flex: 1,
                    height: 52,
                    borderRadius: 12,
                    border: `1px solid ${anchorMoving === 'up' ? 'rgba(61,200,140,0.4)' : 'rgba(80,100,120,0.3)'}`,
                    background: anchorMoving === 'up' 
                      ? 'linear-gradient(180deg, rgba(61,200,140,0.25) 0%, rgba(40,140,100,0.15) 100%)'
                      : 'rgba(30,45,60,0.4)',
                    color: anchorMoving === 'up' ? T.textGreen : T.textSecondary,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 18 }}>▲</span>
                  ВВЕРХ
                </button>
                <button
                  onMouseDown={() => setAnchorMoving('down')}
                  onMouseUp={() => setAnchorMoving(null)}
                  onMouseLeave={() => setAnchorMoving(null)}
                  onTouchStart={() => setAnchorMoving('down')}
                  onTouchEnd={() => setAnchorMoving(null)}
                  style={{
                    flex: 1,
                    height: 52,
                    borderRadius: 12,
                    border: `1px solid ${anchorMoving === 'down' ? 'rgba(100,160,220,0.4)' : 'rgba(80,100,120,0.3)'}`,
                    background: anchorMoving === 'down' 
                      ? 'linear-gradient(180deg, rgba(100,160,220,0.25) 0%, rgba(60,120,180,0.15) 100%)'
                      : 'rgba(30,45,60,0.4)',
                    color: anchorMoving === 'down' ? 'rgba(100,180,240,0.9)' : T.textSecondary,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 18 }}>▼</span>
                  ВНИЗ
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
