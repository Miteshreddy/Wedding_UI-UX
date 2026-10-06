import { useRef, useEffect } from 'react';
import { canvasDpr, scaled, visibilityGate, IS_LOW_POWER } from '../utils/perf';
import './WorldCanvas.css';

/**
 * WorldCanvas — Persistent ambient background that lives behind all scenes.
 * Shifts color temperature, particle density, and atmosphere as the page scrolls.
 * Receives a scrollProgress prop (0..1) from App to drive its visual state.
 */

// One cohesive "enchanted Great Hall ceiling" — a midnight sky that only
// shifts gently in warmth as the evening progresses down the page.
const WORLD_PHASES = [
  { bg: [6, 7, 18], nebula: [44, 52, 120], starCount: 230, dustCount: 30 },
  { bg: [7, 7, 18], nebula: [56, 50, 112], starCount: 200, dustCount: 38 },
  { bg: [8, 7, 16], nebula: [74, 56, 92], starCount: 170, dustCount: 46 },
  { bg: [7, 8, 20], nebula: [52, 66, 128], starCount: 190, dustCount: 34 },
  { bg: [9, 7, 15], nebula: [92, 62, 60], starCount: 150, dustCount: 44 },
  { bg: [6, 7, 18], nebula: [48, 56, 124], starCount: 220, dustCount: 50 },
  { bg: [9, 7, 14], nebula: [96, 56, 50], starCount: 160, dustCount: 36 },
  { bg: [6, 6, 16], nebula: [70, 58, 96], starCount: 250, dustCount: 70 },
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

const STATIC_STARS = Array.from({ length: scaled(260) }, (_, i) => ({
  x: ((i * 137.508) % 100) / 100,
  y: ((i * 97.31 + 13) % 100) / 100,
  size: 0.3 + (i % 6) * 0.22,
  baseBrightness: 0.08 + (i % 8) * 0.08,
  pulseSpeed: 0.008 + (i % 5) * 0.006,
  phase: i * 0.72,
}));

const DUST = Array.from({ length: scaled(80) }, () => ({
  x: Math.random(),
  y: Math.random(),
  vx: (Math.random() - 0.5) * 0.00015,
  vy: -0.00005 - Math.random() * 0.0001,
  size: 0.6 + Math.random() * 1.4,
  phase: Math.random() * Math.PI * 2,
}));

export default function WorldCanvas() {
  const canvasRef = useRef(null);
  const progressRef = useRef(0);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  // Read scroll position directly each frame (no React re-render per scroll)
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressRef.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = canvasDpr();

    const resize = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Phones: the slow twinkle reads the same at ~8fps, and a full-screen
    // canvas repaint every frame was the largest scroll cost on mobile.
    const minGap = IS_LOW_POWER ? 120 : 0;
    let lastDraw = 0;
    const draw = (now = performance.now()) => {
      if (document.hidden || now - lastDraw < minGap) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }
      lastDraw = now;
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      const progress = progressRef.current;
      const world = getWorldPhase(progress);
      timeRef.current += IS_LOW_POWER ? 0.07 : 0.01;
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
      // Wide, gentle vignette: the old tight one showed as a hard dark oval with visible banding
      const vignette = ctx.createRadialGradient(W / 2, H / 2, Math.max(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) * 0.62);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, `rgba(${Math.round(r - 2)},${Math.round(g - 2)},${Math.round(b - 1)},0.4)`);
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
