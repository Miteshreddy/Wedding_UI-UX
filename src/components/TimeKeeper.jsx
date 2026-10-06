import { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { sound } from '../utils/audioSystem';
import SectionHeader from './SectionHeader';
import { canvasDpr, scaled, visibilityGate, IS_LOW_POWER } from '../utils/perf';
import './TimeKeeper.css';

// 4 Signature Event Times & Atmospheric Themes
const SCHEDULE_EVENTS = [
  {
    hour: 16,
    angle: 120, // 4:00 PM on 12h clock
    timeLabel: '4:00 PM',
    title: 'The Ceremony',
    subtitle: 'The sacred vows that bind two souls for all eternity.',
    theme: 'ceremony',
    bgGrad:
      'radial-gradient(ellipse at 50% 40%, rgba(245, 200, 100, 0.22) 0%, rgba(18, 14, 8, 0.95) 75%)',
    accentColor: '#f3dd90',
    particleColor: 'rgba(240, 200, 100,',
  },
  {
    hour: 18,
    angle: 180, // 6:00 PM
    timeLabel: '6:00 PM',
    title: 'The Celebration',
    subtitle: 'Champagne, toasts, and laughter beneath twilight lanterns.',
    theme: 'celebration',
    bgGrad:
      'radial-gradient(ellipse at 50% 40%, rgba(210, 120, 200, 0.22) 0%, rgba(14, 8, 20, 0.95) 75%)',
    accentColor: '#e879f9',
    particleColor: 'rgba(230, 150, 240,',
  },
  {
    hour: 20,
    angle: 240, // 8:00 PM
    timeLabel: '8:00 PM',
    title: 'The Feast & Dinner',
    subtitle: 'A feast of candlelight, fine wine, and heartfelt memories.',
    theme: 'dinner',
    bgGrad:
      'radial-gradient(ellipse at 50% 40%, rgba(220, 90, 40, 0.22) 0%, rgba(20, 10, 8, 0.95) 75%)',
    accentColor: '#fb923c',
    particleColor: 'rgba(245, 130, 60,',
  },
  {
    hour: 23,
    angle: 330, // 11:00 PM
    timeLabel: '11:00 PM',
    title: 'Dancing Under the Stars',
    subtitle: 'Music, starlight waltzes, and celebration until midnight.',
    theme: 'dancing',
    bgGrad:
      'radial-gradient(ellipse at 50% 40%, rgba(90, 140, 255, 0.24) 0%, rgba(6, 8, 24, 0.95) 75%)',
    accentColor: '#93c5fd',
    particleColor: 'rgba(140, 190, 255,',
  },
];

export default function TimeKeeper() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const clockFaceRef = useRef(null);
  const handRef = useRef(null);
  const prefersReduced = useReducedMotion();

  const [currentAngle, setCurrentAngle] = useState(120); // 4:00 PM default
  const [selectedEvent, setSelectedEvent] = useState(SCHEDULE_EVENTS[0]);
  const [isDragging, setIsDragging] = useState(false);

  const dragRef = useRef({
    cx: 0,
    cy: 0,
    lastAngle: 120,
    angularVelocity: 0,
    lastTime: 0,
  });

  // Atmospheric Particle Canvas responding dynamically to time
  useEffect(() => {
    if (prefersReduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const gate = visibilityGate(canvas);
    const dpr = canvasDpr();
    let animId;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Dynamic particle pool
    const particles = Array.from({ length: scaled(65) }, () => ({
      x: Math.random() * (canvas.width / dpr),
      y: Math.random() * (canvas.height / dpr),
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.2 - Math.random() * 0.5,
      size: 0.8 + Math.random() * 2,
      pulse: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      if (!gate.on) { animId = requestAnimationFrame(render); return; }
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      ctx.clearRect(0, 0, W, H);

      const colorPrefix = selectedEvent.particleColor;

      particles.forEach((p) => {
        p.pulse += 0.025;
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < 0) {
          p.y = H;
          p.x = Math.random() * W;
        }
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;

        const a = (0.3 + 0.5 * Math.sin(p.pulse)).toFixed(3);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${colorPrefix} ${a})`;
        ctx.shadowColor = selectedEvent.accentColor;
        ctx.shadowBlur = IS_LOW_POWER ? 0 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animId);
      gate.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [selectedEvent, prefersReduced]);

  const findClosestEvent = useCallback((angle) => {
    let closest = SCHEDULE_EVENTS[0];
    let minDist = Infinity;
    SCHEDULE_EVENTS.forEach((ev) => {
      const diff = Math.abs(ev.angle - angle);
      const dist = Math.min(diff, 360 - diff);
      if (dist < minDist) {
        minDist = dist;
        closest = ev;
      }
    });
    return closest;
  }, []);

  const snapToEvent = useCallback(
    (event) => {
      const targetAngle = event.angle;
      sound.playClockTick();

      if (prefersReduced) {
        setCurrentAngle(targetAngle);
        setSelectedEvent(event);
        return;
      }

      gsap.to(
        { a: currentAngle },
        {
          a: targetAngle,
          duration: 0.55,
          ease: 'back.out(2)',
          onUpdate: function () {
            const val = this.targets()[0].a;
            setCurrentAngle(val);
          },
          onComplete: () => {
            setCurrentAngle(targetAngle);
            setSelectedEvent(event);
          },
        }
      );
    },
    [currentAngle, prefersReduced]
  );

  const updateClockCenter = useCallback(() => {
    const clock = clockFaceRef.current;
    if (!clock) return;
    const rect = clock.getBoundingClientRect();
    dragRef.current.cx = rect.left + rect.width / 2;
    dragRef.current.cy = rect.top + rect.height / 2;
  }, []);

  const getAngleFromPointer = useCallback((clientX, clientY) => {
    const { cx, cy } = dragRef.current;
    const dx = clientX - cx;
    const dy = clientY - cy;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    return angle;
  }, []);

  const handlePointerDown = useCallback(
    (e) => {
      setIsDragging(true);
      updateClockCenter();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const angle = getAngleFromPointer(clientX, clientY);
      dragRef.current.lastAngle = angle;
      dragRef.current.lastTime = performance.now();
      setCurrentAngle(angle);

      const closest = findClosestEvent(angle);
      if (closest !== selectedEvent) {
        setSelectedEvent(closest);
        sound.playClockTick();
      }
    },
    [updateClockCenter, getAngleFromPointer, findClosestEvent, selectedEvent]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const angle = getAngleFromPointer(clientX, clientY);
      const now = performance.now();
      const dt = Math.max(1, now - dragRef.current.lastTime);

      let dAngle = angle - dragRef.current.lastAngle;
      if (dAngle > 180) dAngle -= 360;
      if (dAngle < -180) dAngle += 360;

      dragRef.current.angularVelocity = dAngle / dt;
      dragRef.current.lastAngle = angle;
      dragRef.current.lastTime = now;

      setCurrentAngle(angle);
      const closest = findClosestEvent(angle);
      if (closest !== selectedEvent) {
        setSelectedEvent(closest);
        sound.playClockTick();
      }
    },
    [isDragging, getAngleFromPointer, findClosestEvent, selectedEvent]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    const closest = findClosestEvent(currentAngle);
    snapToEvent(closest);
  }, [isDragging, currentAngle, findClosestEvent, snapToEvent]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove, {
        passive: true,
      });
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove, {
        passive: true,
      });
      window.addEventListener('touchend', handlePointerUp);
    }
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const idx = SCHEDULE_EVENTS.findIndex(
        (ev) => ev.hour === selectedEvent.hour
      );
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        const next = SCHEDULE_EVENTS[(idx + 1) % SCHEDULE_EVENTS.length];
        snapToEvent(next);
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        const prev =
          SCHEDULE_EVENTS[
            (idx - 1 + SCHEDULE_EVENTS.length) % SCHEDULE_EVENTS.length
          ];
        snapToEvent(prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEvent, snapToEvent]);

  return (
    <section
      id="schedule"
      ref={sectionRef}
      className={`timekeeper-section scene theme--${selectedEvent.theme}`}
      aria-label="Interactive Magical Clock — Order of Events"
    >
      {/* Dynamic atmospheric particle canvas */}
      <canvas
        ref={canvasRef}
        className="timekeeper-particle-canvas fill-parent"
        aria-hidden="true"
      />

      {/* Atmospheric lighting pool */}
      <div className="timekeeper-ambient-pool" aria-hidden="true" />

      {/* Heading */}
      <SectionHeader
        kicker="Saturday · 31 October 2026"
        title="The Order of the Day"
        subtitle="Turn the golden hand, or tap a time, to see how the evening unfolds"
      />

      {/* Clock & Event Information Stage */}
      <div className="timekeeper-stage">
        {/* Antique Interactive Clock Face */}
        <div
          ref={clockFaceRef}
          className="magical-clock-wrap"
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          role="slider"
          aria-label="Magical antique clock"
          aria-valuenow={Math.round(currentAngle)}
          aria-valuetext={`${selectedEvent.timeLabel} — ${selectedEvent.title}`}
          tabIndex={0}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <svg viewBox="0 0 320 320" className="clock-svg" aria-hidden="true">
            <defs>
              <radialGradient id="clockBezelGrad" cx="45%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#4a371c" />
                <stop offset="50%" stopColor="#2b1e0f" />
                <stop offset="100%" stopColor="#140d07" />
              </radialGradient>
              <radialGradient id="clockDialGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1e1610" />
                <stop offset="70%" stopColor="#120c08" />
                <stop offset="100%" stopColor="#0a0604" />
              </radialGradient>
              <filter
                id="handGlow"
                x="-30%"
                y="-30%"
                width="160%"
                height="160%"
              >
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Outer Brass Bezel */}
            <circle
              cx="160"
              cy="160"
              r="150"
              fill="url(#clockBezelGrad)"
              stroke="#c9a84c"
              strokeWidth="2.5"
            />
            <circle
              cx="160"
              cy="160"
              r="142"
              fill="none"
              stroke="rgba(201,168,76,0.3)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />

            {/* Inner Clock Dial Face */}
            <circle cx="160" cy="160" r="134" fill="url(#clockDialGrad)" />

            {/* Astrological Astrolabe Rings */}
            <circle
              cx="160"
              cy="160"
              r="105"
              fill="none"
              stroke="rgba(201,168,76,0.2)"
              strokeWidth="0.8"
            />
            <circle
              cx="160"
              cy="160"
              r="75"
              fill="none"
              stroke="rgba(201,168,76,0.15)"
              strokeWidth="0.6"
              strokeDasharray="6 4"
            />

            {/* 60 Minute Tick Marks */}
            {Array.from({ length: 60 }, (_, i) => {
              const rad = (i / 60) * Math.PI * 2;
              const isMajor = i % 5 === 0;
              const r1 = isMajor ? 122 : 126;
              const r2 = 132;
              return (
                <line
                  key={i}
                  x1={160 + r1 * Math.sin(rad)}
                  y1={160 - r1 * Math.cos(rad)}
                  x2={160 + r2 * Math.sin(rad)}
                  y2={160 - r2 * Math.cos(rad)}
                  stroke={isMajor ? '#c9a84c' : 'rgba(201,168,76,0.3)'}
                  strokeWidth={isMajor ? 1.5 : 0.6}
                />
              );
            })}

            {/* Roman Numerals for 12 Hours */}
            {[
              { num: 'XII', a: 0 },
              { num: 'I', a: 30 },
              { num: 'II', a: 60 },
              { num: 'III', a: 90 },
              { num: 'IV', a: 120 }, // 4 PM Ceremony
              { num: 'V', a: 150 },
              { num: 'VI', a: 180 }, // 6 PM Celebration
              { num: 'VII', a: 210 },
              { num: 'VIII', a: 240 }, // 8 PM Dinner
              { num: 'IX', a: 270 },
              { num: 'X', a: 300 },
              { num: 'XI', a: 330 }, // 11 PM Dancing
            ].map(({ num, a }, i) => {
              const rad = (a * Math.PI) / 180;
              const dist = 112;
              const isTarget = [120, 180, 240, 330].includes(a);
              return (
                <text
                  key={i}
                  x={160 + dist * Math.sin(rad)}
                  y={160 - dist * Math.cos(rad) + 4}
                  textAnchor="middle"
                  fontFamily="'Cinzel', serif"
                  fontSize={isTarget ? 11 : 9}
                  fontWeight={isTarget ? 'bold' : 'normal'}
                  fill={isTarget ? '#f3dd90' : 'rgba(201,168,76,0.5)'}
                >
                  {num}
                </text>
              );
            })}

            {/* Highlighted Event Nodes on Dial */}
            {SCHEDULE_EVENTS.map((ev, i) => {
              const rad = (ev.angle * Math.PI) / 180;
              const x = 160 + 112 * Math.sin(rad);
              const y = 160 - 112 * Math.cos(rad);
              const isSelected = selectedEvent.hour === ev.hour;
              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 16 : 12}
                    fill={isSelected ? 'rgba(201,168,76,0.25)' : 'none'}
                    stroke={
                      isSelected ? ev.accentColor : 'rgba(201,168,76,0.4)'
                    }
                    strokeWidth={isSelected ? 1.5 : 0.8}
                  />
                  {isSelected && (
                    <circle
                      cx={x}
                      cy={y}
                      r={22}
                      fill="none"
                      stroke={ev.accentColor}
                      strokeWidth="0.8"
                      strokeDasharray="3 3"
                      opacity="0.6"
                    />
                  )}
                </g>
              );
            })}

            {/* Antique Filigree Clock Hand */}
            <g
              ref={handRef}
              transform={`rotate(${currentAngle}, 160, 160)`}
              filter="url(#handGlow)"
            >
              {/* Invisible wider hit area for touch */}
              <polygon
                points="160,42 170,130 172,165 148,165 150,130"
                fill="transparent"
                stroke="none"
              />
              <polygon
                points="160,50 163,130 165,160 155,160 157,130"
                fill="#f3dd90"
                stroke="#8a6d2e"
                strokeWidth="1"
              />
              <circle cx="160" cy="58" r="7" fill="#c9a84c" />
              <circle cx="160" cy="58" r="4" fill="#fff5d0" />
              <polygon
                points="160,185 163,160 157,160"
                fill="#c9a84c"
              />
              <circle
                cx="160"
                cy="188"
                r="5"
                fill="#8a6d2e"
                stroke="#c9a84c"
                strokeWidth="1"
              />
            </g>

            {/* Central Pivot Cap */}
            <circle
              cx="160"
              cy="160"
              r="9"
              fill="#c9a84c"
              stroke="#5a401c"
              strokeWidth="1.5"
            />
            <circle cx="160" cy="160" r="4" fill="#fffbe8" />
          </svg>
        </div>

        {/* Event Details Card */}
        <div className="timekeeper-info-panel" aria-live="polite">
          <div
            className="time-badge"
            style={{ borderColor: selectedEvent.accentColor }}
          >
            <span
              className="time-spark"
              style={{ color: selectedEvent.accentColor }}
            >
              ✦
            </span>
            <span
              className="time-label t-display"
              style={{ color: selectedEvent.accentColor }}
            >
              {selectedEvent.timeLabel}
            </span>
          </div>

          <h3 className="event-title t-display">{selectedEvent.title}</h3>
          <p className="event-description t-ink">
            "{selectedEvent.subtitle}"
          </p>

          {/* Quick Event Selection Buttons */}
          <div
            className="time-selector-buttons"
            role="group"
            aria-label="Select schedule milestone"
          >
            {SCHEDULE_EVENTS.map((ev) => {
              const isSelected = selectedEvent.hour === ev.hour;
              return (
                <button
                  key={ev.hour}
                  className={`time-btn ${
                    isSelected ? 'time-btn--active' : ''
                  }`}
                  onClick={() => snapToEvent(ev)}
                  aria-label={`Jump clock to ${ev.timeLabel}: ${ev.title}`}
                  aria-pressed={isSelected}
                  style={
                    isSelected
                      ? {
                          borderColor: ev.accentColor,
                          color: ev.accentColor,
                        }
                      : {}
                  }
                >
                  <span className="btn-time t-display">{ev.timeLabel}</span>
                  <span className="btn-name t-serif">
                    {ev.title.replace('The ', '')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p className="timekeeper-hint t-ink" aria-hidden="true">
        ✦ Drag the golden clock hand or tap times to travel through the
        celebration ✦
      </p>
    </section>
  );
}
