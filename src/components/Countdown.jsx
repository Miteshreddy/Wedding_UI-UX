import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { WEDDING } from '../data/weddingData';
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
  const canvasRef = useRef(null);
  const secondPulseRef = useRef(null);
  const prefersReduced = useReducedMotion();
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining());

  // 1-second live countdown
  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(getTimeRemaining());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Magical ink wisp canvas — soft atmospheric ink motes
  useEffect(() => {
    if (prefersReduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let animId;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // 30 soft ink wisps
    const wisps = Array.from({ length: 30 }, (_, i) => ({
      x: Math.random(),
      y: 0.3 + Math.random() * 0.7,
      vy: -0.00025 - Math.random() * 0.00035,
      vx: (Math.random() - 0.5) * 0.00012,
      size: 1.2 + Math.random() * 2.8,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.08 + Math.random() * 0.18,
    }));

    const draw = () => {
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      ctx.clearRect(0, 0, W, H);

      wisps.forEach((w) => {
        w.phase += 0.012;
        w.x += w.vx + Math.sin(w.phase * 0.6) * 0.00008;
        w.y += w.vy;
        if (w.y < -0.05) { w.y = 1.05; w.x = Math.random(); }
        if (w.x < 0) w.x = 1;
        if (w.x > 1) w.x = 0;

        const a = w.opacity * (0.5 + 0.5 * Math.sin(w.phase));
        const grad = ctx.createRadialGradient(
          w.x * W, w.y * H, 0,
          w.x * W, w.y * H, w.size * 2.5
        );
        grad.addColorStop(0, `rgba(201, 168, 76, ${a.toFixed(3)})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(w.x * W, w.y * H, w.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [prefersReduced]);

  // Second tick pulse micro-animation
  const prevSecRef = useRef(timeLeft.seconds);
  useEffect(() => {
    if (prefersReduced) return;
    if (timeLeft.seconds !== prevSecRef.current) {
      if (secondPulseRef.current) {
        gsap.fromTo(
          secondPulseRef.current,
          { scale: 0.95, filter: 'brightness(1.4)' },
          {
            scale: 1,
            filter: 'brightness(1)',
            duration: 0.35,
            ease: 'back.out(2)',
          }
        );
      }
      prevSecRef.current = timeLeft.seconds;
    }
  }, [timeLeft.seconds, prefersReduced]);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <section
      ref={sectionRef}
      className="countdown-section scene"
      aria-label="Countdown to the Wedding Day"
    >
      {/* Ink Wisp Atmosphere Canvas */}
      <canvas ref={canvasRef} className="countdown-wisp-canvas fill-parent" aria-hidden="true" />

      {/* Enchanted Parchment Frame */}
      <div className="countdown-parchment-frame">
        {/* Corner Ornaments */}
        <span className="parchment-corner parchment-corner--tl" aria-hidden="true">✦</span>
        <span className="parchment-corner parchment-corner--tr" aria-hidden="true">✦</span>
        <span className="parchment-corner parchment-corner--bl" aria-hidden="true">✦</span>
        <span className="parchment-corner parchment-corner--br" aria-hidden="true">✦</span>

        {/* Wedding Date */}
        <p className="countdown-date-title t-display" aria-label={`Wedding date: ${WEDDING.date.display}`}>
          {WEDDING.date.parts.day} · {WEDDING.date.parts.month} · {WEDDING.date.parts.year}
        </p>

        <span className="gold-rule" style={{ width: '60px' }} />

        {/* Live Countdown Numbers */}
        <div
          className="countdown-hud"
          aria-label="Time remaining until the wedding"
        >
          {[
            { label: 'Days', value: timeLeft.days, id: 'days' },
            { label: 'Hours', value: pad(timeLeft.hours), id: 'hours' },
            { label: 'Minutes', value: pad(timeLeft.minutes), id: 'minutes' },
            { label: 'Seconds', value: pad(timeLeft.seconds), id: 'seconds' },
          ].map(({ label, value, id }) => (
            <div
              key={id}
              ref={id === 'seconds' ? secondPulseRef : null}
              className={`countdown-unit countdown-unit--${id}`}
              aria-label={`${value} ${label.toLowerCase()}`}
            >
              <span className="countdown-value t-display">{value}</span>
              <span className="countdown-label t-ink">{label}</span>
            </div>
          ))}
        </div>

        <span className="gold-rule" style={{ width: '60px' }} />

        <p className="countdown-tagline t-handwritten">
          The stars are already counting.
        </p>
      </div>
    </section>
  );
}
