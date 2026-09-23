import { useRef, useEffect } from 'react';
import './WorldCanvas.css';

/**
 * WorldCanvas — Persistent ambient background that lives behind all scenes.
 * Shifts color temperature, particle density, and atmosphere as the page scrolls.
 * Receives a scrollProgress prop (0..1) from App to drive its visual state.
 */

const WORLD_PHASES = [
  // 0.00 – 0.12 : Constellation / Invitation (deep indigo, starfield)
  { bg: [6, 4, 14], nebula: [60, 30, 120], starCount: 220, dustCount: 30 },
  // 0.12 – 0.28 : Map transition (warm amber starts bleeding in)
  { bg: [8, 6, 10], nebula: [80, 50, 30], starCount: 160, dustCount: 45 },
  // 0.28 – 0.44 : Ancient Map (warm parchment amber, aged paper)
  { bg: [10, 8, 6], nebula: [120, 80, 30], starCount: 80, dustCount: 60 },
  // 0.44 – 0.60 : Chronicle Gallery (newsprint, cooler)
  { bg: [7, 6, 10], nebula: [40, 35, 55], starCount: 40, dustCount: 25 },
  // 0.60 – 0.72 : TimeKeeper (warm brass, candle-amber)
  { bg: [10, 7, 4], nebula: [110, 70, 20], starCount: 50, dustCount: 40 },
  // 0.72 – 0.86 : Countdown (deep cosmos, celestial purple-blue)
  { bg: [4, 4, 12], nebula: [30, 40, 100], starCount: 200, dustCount: 55 },
  // 0.86 – 0.94 : RSVP (dark parchment candlelight)
  { bg: [8, 5, 3], nebula: [90, 55, 15], starCount: 60, dustCount: 30 },
  // 0.94 – 1.00 : Final Reveal (star convergence, warm gold)
  { bg: [5, 4, 10], nebula: [80, 60, 20], starCount: 240, dustCount: 80 },
];

function lerpColor(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function getWorldPhase(progress) {
  const phaseCount = WORLD_PHASES.length;
  const rawIdx = progress * (phaseCount - 1);
  const idx = Math.floor(rawIdx);
  const t = rawIdx - idx;
  const from = WORLD_PHASES[Math.min(idx, phaseCount - 1)];
  const to = WORLD_PHASES[Math.min(idx + 1, phaseCount - 1)];
  return {
    bg: lerpColor(from.bg, to.bg, t),
    nebula: lerpColor(from.nebula, to.nebula, t),
    starCount: lerp(from.starCount, to.starCount, t),
    dustCount: lerp(from.dustCount, to.dustCount, t),
  };
}

const STATIC_STARS = Array.from({ length: 260 }, (_, i) => ({
  x: ((i * 137.508) % 100) / 100,
  y: ((i * 97.31 + 13) % 100) / 100,
  size: 0.3 + (i % 6) * 0.22,
  baseBrightness: 0.08 + (i % 8) * 0.08,
  pulseSpeed: 0.008 + (i % 5) * 0.006,
  phase: i * 0.72,
}));

const DUST = Array.from({ length: 80 }, () => ({
  x: Math.random(),
  y: Math.random(),
  vx: (Math.random() - 0.5) * 0.00015,
  vy: -0.00005 - Math.random() * 0.0001,
  size: 0.6 + Math.random() * 1.4,
  phase: Math.random() * Math.PI * 2,
}));

export default function WorldCanvas({ scrollProgress = 0 }) {
  const canvasRef = useRef(null);
  const progressRef = useRef(scrollProgress);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const draw = () => {
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      const progress = progressRef.current;
      const world = getWorldPhase(progress);
      timeRef.current += 0.01;
      const t = timeRef.current;

      // 1. Background gradient
      const [r, g, b] = world.bg;
      const [nr, ng, nb] = world.nebula;

      const bgGrad = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.5, W * 0.85);
      bgGrad.addColorStop(0, `rgb(${Math.round(r + 6)},${Math.round(g + 4)},${Math.round(b + 8)})`);
      bgGrad.addColorStop(0.55, `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`);
      bgGrad.addColorStop(1, `rgb(${Math.round(r - 2)},${Math.round(g - 2)},${Math.round(b - 2)})`);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // 2. Nebula haze
      const nebulaAlpha = 0.06 + 0.03 * Math.sin(t * 0.3);
      const nebGrad = ctx.createRadialGradient(
        W * (0.4 + 0.1 * Math.sin(t * 0.15)),
        H * (0.35 + 0.08 * Math.cos(t * 0.18)),
        0,
        W * 0.5, H * 0.5, W * 0.55
      );
      nebGrad.addColorStop(0, `rgba(${Math.round(nr)},${Math.round(ng)},${Math.round(nb)},${(nebulaAlpha * 2).toFixed(3)})`);
      nebGrad.addColorStop(0.5, `rgba(${Math.round(nr * 0.7)},${Math.round(ng * 0.6)},${Math.round(nb * 0.8)},${nebulaAlpha.toFixed(3)})`);
      nebGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = nebGrad;
      ctx.fillRect(0, 0, W, H);

      // 3. Stars
      const starAlpha = Math.min(1, world.starCount / 220);
      STATIC_STARS.forEach((s, i) => {
        if (i >= world.starCount) return;
        const tw = Math.sin(t * s.pulseSpeed * 60 + s.phase);
        const a = s.baseBrightness * starAlpha * (0.5 + 0.5 * tw);
        if (a < 0.01) return;
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(235, 220, 185, ${a.toFixed(3)})`;
        ctx.fill();
      });

      // 4. Ambient dust motes
      const dustAlpha = Math.min(1, world.dustCount / 80) * 0.55;
      DUST.forEach((d, i) => {
        if (i >= world.dustCount) return;
        d.x += d.vx;
        d.y += d.vy;
        d.phase += 0.015;
        if (d.y < -0.01) { d.y = 1.02; d.x = Math.random(); }
        if (d.x < -0.01) d.x = 1.01;
        if (d.x > 1.01) d.x = -0.01;
        const pulse = 0.35 + 0.65 * Math.sin(d.phase);
        const da = dustAlpha * pulse;
        ctx.beginPath();
        ctx.arc(d.x * W, d.y * H, d.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210, 185, 130, ${da.toFixed(3)})`;
        ctx.fill();
      });

      // 5. Vignette
      const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, W * 0.9);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, `rgba(${Math.round(r - 2)},${Math.round(g - 2)},${Math.round(b - 1)},0.75)`);
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="world-canvas"
      aria-hidden="true"
    />
  );
}
