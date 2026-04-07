/**
 * src/components/LoadingScreen.jsx
 * Cinematic initial loading animation — v2
 * Self-dismisses after `duration` ms; calls onComplete() when done.
 */

import React, { useEffect, useState, useRef } from 'react';

/* ---------- tiny hook: counts up a number ---------- */
const useCounter = (target, duration = 1400, start = false) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf;
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out-expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return value;
};

/* ---------- animated particle dot ---------- */
const Particle = ({ style }) => <div className="ls-particle" style={style} />;

/* ---------- main component ---------- */
const LoadingScreen = ({ onComplete, duration = 3200 }) => {
  const [phase, setPhase] = useState('enter');   // enter → scan → exit
  const [scanLine, setScanLine] = useState(0);
  const [checklist, setChecklist] = useState([
    { label: 'Initialising secure context', done: false },
    { label: 'Connecting to database', done: false },
    { label: 'Loading student records', done: false },
    { label: 'Calibrating risk models', done: false },
    { label: 'Ready', done: false },
  ]);
  const pct = useCounter(100, duration - 800, phase === 'scan');
  const timerRef = useRef(null);

  /* ---- phase transitions ---- */
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('scan'), 400);
    const t2 = setTimeout(() => setPhase('exit'), duration - 600);
    const t3 = setTimeout(() => onComplete?.(), duration);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [duration, onComplete]);

  /* ---- scan line animation ---- */
  useEffect(() => {
    if (phase !== 'scan') return;
    let frame;
    const tick = () => {
      setScanLine(prev => (prev >= 100 ? 0 : prev + 0.4));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  /* ---- checklist reveal ---- */
  useEffect(() => {
    if (phase !== 'scan') return;
    const delays = [300, 700, 1100, 1600, duration - 900];
    const timers = delays.map((d, i) =>
      setTimeout(() =>
        setChecklist(prev => prev.map((item, idx) => idx === i ? { ...item, done: true } : item)),
        d
      )
    );
    return () => timers.forEach(clearTimeout);
  }, [phase, duration]);

  /* ---- particles (generated once) ---- */
  const particles = useRef(
    Array.from({ length: 28 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${1 + Math.random() * 3}px`,
      height: `${1 + Math.random() * 3}px`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${3 + Math.random() * 4}s`,
      opacity: 0.2 + Math.random() * 0.5,
    }))
  ).current;

  return (
    <div className={`ls-root ${phase === 'exit' ? 'ls-exit' : ''}`}>
      {/* ---- ambient orbs ---- */}
      <div className="ls-orb ls-orb-1" />
      <div className="ls-orb ls-orb-2" />
      <div className="ls-orb ls-orb-3" />

      {/* ---- particles ---- */}
      {particles.map((p, i) => <Particle key={i} style={p} />)}

      {/* ---- scan line ---- */}
      {phase === 'scan' && (
        <div className="ls-scanline" style={{ top: `${scanLine}%` }} />
      )}

      {/* ---- center card ---- */}
      <div className={`ls-card ${phase !== 'enter' ? 'ls-card-visible' : ''}`}>
        {/* logo mark */}
        <div className="ls-logo">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="22" stroke="url(#lg1)" strokeWidth="2" />
            <path d="M16 24 C16 19 20 16 24 16 C28 16 32 19 32 24 C32 29 29 33 24 33 C19 33 16 29 16 24Z"
              stroke="url(#lg2)" strokeWidth="1.5" fill="none" />
            <circle cx="24" cy="24" r="4" fill="url(#lg2)" />
            <path d="M24 8 L24 12 M24 36 L24 40 M8 24 L12 24 M36 24 L40 24"
              stroke="rgba(139,120,255,0.4)" strokeWidth="1" strokeLinecap="round" />
            <defs>
              <linearGradient id="lg1" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8b78ff" />
                <stop offset="1" stopColor="#22d3ee" />
              </linearGradient>
              <linearGradient id="lg2" x1="16" y1="16" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#a78bfa" />
                <stop offset="1" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 className="ls-title">Well-being Portal</h1>
        <p className="ls-subtitle">Student Mental Health Monitoring System</p>

        {/* version tag */}
        <div className="ls-version">v2.0 · SECURE</div>

        {/* progress bar */}
        <div className="ls-progress-track">
          <div className="ls-progress-fill" style={{ width: `${pct}%` }} />
          <div className="ls-progress-glow" style={{ left: `${pct}%` }} />
        </div>
        <div className="ls-pct">{pct}%</div>

        {/* checklist */}
        <div className="ls-checklist">
          {checklist.map((item, i) => (
            <div key={i} className={`ls-check-item ${item.done ? 'ls-check-done' : ''}`}>
              <span className="ls-check-icon">
                {item.done ? (
                  <svg width="12" height="12" viewBox="0 0 12 12">
                    <path d="M2 6L5 9L10 3" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                ) : (
                  <span className="ls-check-dot" />
                )}
              </span>
              <span className="ls-check-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* bottom bar */}
      <div className="ls-bottom">
        <span className="ls-bottom-text">INITIALIZING SECURE SESSION</span>
        <span className="ls-bottom-blink">■</span>
      </div>
    </div>
  );
};

export default LoadingScreen;