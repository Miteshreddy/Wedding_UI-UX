import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { WEDDING } from '../data/weddingData';
import { sound } from '../utils/audioSystem';
import { downloadCalendarInvite } from '../utils/calendar';
import { scrollToSection } from './NavBar';
import SectionHeader from './SectionHeader';
import { canvasDpr, scaled, visibilityGate, IS_LOW_POWER } from '../utils/perf';
import './Countdown.css';

const TARGET_DATE = new Date(WEDDING.date.iso);

function getTimeRemaining() {
  const now = new Date();
  const total = TARGET_DATE - now;
  if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

export default function Countdown() {
  const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const canvasRef = useRef(null);
  const prefersReduced = useReducedMotion();
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining());
  const prevTimeRef = useRef(timeLeft);

  // 1-second live countdown interval
  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(getTimeRemaining());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // 3D Parallax Tilt Effect on Mouse Move / Device Touch
  const handleMouseMove = useCallback((e) => {
    if (prefersReduced || !cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    gsap.to(card, {
      rotateX,
      rotateY,
      duration: 0.5,
      ease: 'power2.out',
      transformPerspective: 1000,
    });
  }, [prefersReduced]);

  const handleMouseLeave = useCallback(() => {
    if (prefersReduced || !cardRef.current) return;
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: 'elastic.out(1, 0.5)',
    });
  }, [prefersReduced]);

  // Enhanced Astronomical Stardust Canvas
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

    // 40 celestial stardust particles with constellation connections
    const particles = Array.from({ length: scaled(40) }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0003,
      vy: -0.00015 - Math.random() * 0.0003,
      size: 1 + Math.random() * 2.5,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.02 + Math.random() * 0.03,
      hue: 42 + (Math.random() - 0.5) * 12,
    }));

    const draw = () => {
      if (!gate.on) { animId = requestAnimationFrame(draw); return; }
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      ctx.clearRect(0, 0, W, H);

      // Draw subtle constellation filaments between close particles (skipped on phones: O(n²))
      for (let i = 0; i < (IS_LOW_POWER ? 0 : particles.length); i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = (particles[i].x - particles[j].x) * W;
          const dy = (particles[i].y - particles[j].y) * H;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            const alpha = (1 - dist / 90) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x * W, particles[i].y * H);
            ctx.lineTo(particles[j].x * W, particles[j].y * H);
            ctx.strokeStyle = `rgba(212, 175, 55, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw glowing celestial particles
      particles.forEach((p) => {
        p.twinkle += p.twinkleSpeed;
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
        if (p.x < -0.05) p.x = 1.05;
        if (p.x > 1.05) p.x = -0.05;

        const bright = 0.3 + 0.7 * Math.abs(Math.sin(p.twinkle));
        const px = p.x * W;
        const py = p.y * H;

        // Particle core
        const grad = ctx.createRadialGradient(px, py, 0, px, py, p.size * 3);
        grad.addColorStop(0, `hsla(${p.hue}, 85%, 75%, ${(bright * 0.9).toFixed(3)})`);
        grad.addColorStop(0.4, `hsla(${p.hue}, 80%, 55%, ${(bright * 0.4).toFixed(3)})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.beginPath();
        ctx.arc(px, py, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      gate.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [prefersReduced]);

  // Micro-animations when individual time units change
  const secPodRef = useRef(null);
  const minPodRef = useRef(null);
  const hrPodRef = useRef(null);
  const dayPodRef = useRef(null);

  useEffect(() => {
    if (prefersReduced) return;
    if (timeLeft.seconds !== prevTimeRef.current.seconds && secPodRef.current) {
      gsap.fromTo(
        secPodRef.current.querySelector('.pod-num'),
        { y: -3, opacity: 0.7, filter: 'brightness(1.5)' },
        { y: 0, opacity: 1, filter: 'brightness(1)', duration: 0.3, ease: 'power2.out' }
      );
    }
    if (timeLeft.minutes !== prevTimeRef.current.minutes && minPodRef.current) {
      gsap.fromTo(
        minPodRef.current.querySelector('.pod-num'),
        { scale: 1.08, filter: 'brightness(1.6)' },
        { scale: 1, filter: 'brightness(1)', duration: 0.5, ease: 'back.out(2)' }
      );
    }
    prevTimeRef.current = timeLeft;
  }, [timeLeft, prefersReduced]);

  const pad = (n) => String(n).padStart(2, '0');

  // Calculate current seconds progress percentage for the circular orbit indicator (0..100)
  const secondsProgress = (timeLeft.seconds / 60) * 100;

  const timeUnits = [
    { label: 'DAYS', value: pad(timeLeft.days), id: 'days', ref: dayPodRef, hint: 'Until Forever' },
    { label: 'HOURS', value: pad(timeLeft.hours), id: 'hours', ref: hrPodRef, hint: 'Under the Stars' },
    { label: 'MINUTES', value: pad(timeLeft.minutes), id: 'minutes', ref: minPodRef, hint: 'Of Anticipation' },
    { label: 'SECONDS', value: pad(timeLeft.seconds), id: 'seconds', ref: secPodRef, hint: 'Ticking in Harmony', isSec: true },
  ];

  return (
    <section
      id="countdown"
      ref={sectionRef}
      className="countdown-section scene"
      aria-label="Countdown to the Wedding Day"
    >
      <SectionHeader kicker="Save the Date" title="Our Countdown to Forever" subtitle="We can’t wait to celebrate with you." />
      {/* Background Starfield Atmosphere */}
      <canvas ref={canvasRef} className="countdown-wisp-canvas fill-parent" aria-hidden="true" />

      {/* Main Luxury Astronomical Plaque */}
      <div
        ref={cardRef}
        className="countdown-master-card"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Subtle Ambient Glow Aura */}
        <div className="card-ambient-glow" aria-hidden="true" />

        {/* Intricate Victorian Filigree Corner Brackets */}
        <div className="filigree-corner filigree-corner--tl" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 46V12C2 6.47715 6.47715 2 12 2H46" stroke="url(#goldGrad)" strokeWidth="1.5" />
            <path d="M8 40V14C8 10.6863 10.6863 8 14 8H40" stroke="url(#goldGrad)" strokeWidth="0.75" strokeDasharray="2 2" />
            <circle cx="12" cy="12" r="2.5" fill="url(#goldGrad)" />
            <path d="M12 4L14 12L22 14L14 16L12 24L10 16L2 14L10 12L12 4Z" fill="url(#goldGrad)" opacity="0.8" />
          </svg>
        </div>
        <div className="filigree-corner filigree-corner--tr" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M46 46V12C46 6.47715 41.5228 2 36 2H2" stroke="url(#goldGrad)" strokeWidth="1.5" />
            <path d="M40 40V14C40 10.6863 37.3137 8 34 8H8" stroke="url(#goldGrad)" strokeWidth="0.75" strokeDasharray="2 2" />
            <circle cx="36" cy="12" r="2.5" fill="url(#goldGrad)" />
            <path d="M36 4L38 12L46 14L38 16L36 24L34 16L26 14L34 12L36 4Z" fill="url(#goldGrad)" opacity="0.8" />
          </svg>
        </div>
        <div className="filigree-corner filigree-corner--bl" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 2V36C2 41.5228 6.47715 46 12 46H46" stroke="url(#goldGrad)" strokeWidth="1.5" />
            <path d="M8 8V34C8 37.3137 10.6863 40 14 40H40" stroke="url(#goldGrad)" strokeWidth="0.75" strokeDasharray="2 2" />
            <circle cx="12" cy="36" r="2.5" fill="url(#goldGrad)" />
            <path d="M12 24L14 32L22 34L14 36L12 44L10 36L2 34L10 32L12 24Z" fill="url(#goldGrad)" opacity="0.8" />
          </svg>
        </div>
        <div className="filigree-corner filigree-corner--br" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M46 2V36C46 41.5228 41.5228 46 36 46H2" stroke="url(#goldGrad)" strokeWidth="1.5" />
            <path d="M40 8V34C40 37.3137 37.3137 40 34 40H8" stroke="url(#goldGrad)" strokeWidth="0.75" strokeDasharray="2 2" />
            <circle cx="36" cy="36" r="2.5" fill="url(#goldGrad)" />
            <path d="M36 24L38 32L46 34L38 36L36 44L34 36L26 34L34 32L36 24Z" fill="url(#goldGrad)" opacity="0.8" />
          </svg>
        </div>

        {/* Reusable SVG Gradients Definition */}
        <svg width="0" height="0" className="visually-hidden">
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F9E8B2" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#8A6C24" />
            </linearGradient>
          </defs>
        </svg>

        {/* Card Header & Crest */}
        <header className="countdown-card-header">
          {/* Astrolabe Crest Icon */}
          <div className="astronomical-crest" aria-hidden="true">
            <span className="crest-ring" />
            <span className="crest-star">✦</span>
          </div>

          <p className="countdown-date-badge t-display" aria-label={`Wedding date: ${WEDDING.date.display}`}>
            {WEDDING.date.parts.day} · {WEDDING.date.parts.month.toUpperCase()} · {WEDDING.date.parts.year}
          </p>

          <div className="ornate-gold-divider" aria-hidden="true">
            <span className="divider-flourish divider-flourish--left" />
            <span className="divider-diamond">◈</span>
            <span className="divider-flourish divider-flourish--right" />
          </div>
        </header>

        {/* 4 Horological Sculpted Time Pods */}
        <div
          className="countdown-pods-grid"
          aria-label="Time remaining until the wedding"
        >
          {timeUnits.map(({ label, value, id, ref, isSec }) => (
            <div
              key={id}
              ref={ref}
              className={`countdown-pod ${isSec ? 'countdown-pod--seconds' : ''}`}
              title={label}
            >
              {/* Bevelled Glass Highlight */}
              <div className="pod-specular-glare" aria-hidden="true" />

              {/* Number Capsule */}
              <div className="pod-capsule">
                {/* Horizontal Horological Split Crease */}
                <div className="pod-split-crease" aria-hidden="true" />

                {/* Live Number */}
                <span className="pod-num t-display">{value}</span>

                {/* Animated Seconds Radial Arc for Seconds Pod */}
                {isSec && (
                  <svg className="seconds-orbital-ring" viewBox="0 0 60 60" aria-hidden="true">
                    <circle
                      cx="30"
                      cy="30"
                      r="26"
                      className="ring-track"
                    />
                    <circle
                      cx="30"
                      cy="30"
                      r="26"
                      className="ring-progress"
                      style={{
                        strokeDashoffset: 163.36 - (163.36 * secondsProgress) / 100,
                      }}
                    />
                  </svg>
                )}
              </div>

              {/* Unit Subtitle */}
              <span className="pod-label t-display">{label}</span>
            </div>
          ))}
        </div>

        {/* Footer Flourish & Tagline */}
        <footer className="countdown-card-footer">
          <div className="ornate-gold-divider ornate-gold-divider--footer" aria-hidden="true">
            <span className="divider-flourish divider-flourish--left" />
            <span className="divider-star">✦</span>
            <span className="divider-flourish divider-flourish--right" />
          </div>

          <p className="countdown-script-tagline t-handwritten">
            {timeLeft.total > 0 ? 'The stars are already counting.' : 'The day has come. Mischief managed.'}
          </p>

          <span className="countdown-location-hint t-serif">
            {WEDDING.venue?.name || 'The Grand Hall'} · {WEDDING.venue?.city || 'Edinburgh'}
          </span>

          <div className="countdown-actions">
            <button type="button" className="countdown-btn t-display" onClick={downloadCalendarInvite}>
              Add to calendar
            </button>

          </div>
        </footer>
      </div>
    </section>
  );
}
