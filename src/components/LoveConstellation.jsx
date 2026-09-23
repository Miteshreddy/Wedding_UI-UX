import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { sound } from '../utils/audioSystem';
import './LoveConstellation.css';

gsap.registerPlugin(ScrollTrigger);

// 4 Signature milestone nodes across celestial journey
const MILESTONES = [
  {
    id: 0,
    t: 0.18,
    x: 0.24,
    y: 0.32,
    date: '14 FEBRUARY 2021',
    title: 'THE FIRST ENCOUNTER',
    sub: 'Two orbits cross under quiet winter stars',
    // Story panel content
    storyDate: '14 February 2021',
    storyLines: ['The first time they were in the same room,', 'neither knew what had just started.'],
    storyAlign: 'left',
  },
  {
    id: 1,
    t: 0.42,
    x: 0.76,
    y: 0.38,
    date: '27 AUGUST 2022',
    title: 'THE FIRST ADVENTURE',
    sub: 'Through highland mists and winding paths',
    storyDate: '27 August 2022',
    storyLines: ['They got lost on purpose.', 'Two weeks in the Highlands.'],
    storyAlign: 'right',
  },
  {
    id: 2,
    t: 0.66,
    x: 0.32,
    y: 0.68,
    date: '06 MAY 2024',
    title: 'THE QUESTION',
    sub: 'A promise whispered beneath the heavens',
    storyDate: '06 May 2024',
    storyLines: ['He asked.', 'She said yes.', 'Under a sky full of witnesses.'],
    storyAlign: 'left',
  },
  {
    id: 3,
    t: 0.88,
    x: 0.68,
    y: 0.65,
    date: '31 OCTOBER 2026',
    title: 'FOREVER',
    sub: 'Two worlds unite in eternal harmony',
    storyDate: '31 October 2026',
    storyLines: ['Forever begins here.', 'You are invited to witness it.'],
    storyAlign: 'center',
  },
];

export default function LoveConstellation() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const storyCardsRef = useRef([]);
  const photoRef = useRef(null);
  const photoTextRef = useRef(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const state = { progress: 0 };

    // Background starfield
    const stars = Array.from({ length: 140 }, (_, i) => ({
      x: ((i * 137.5) % 100) / 100,
      y: ((i * 93.7 + 7) % 100) / 100,
      size: 0.4 + (i % 5) * 0.3,
      opacity: 0.2 + (i % 6) * 0.12,
      pulseSpeed: 0.02 + (i % 4) * 0.015,
      phase: i * 0.5,
    }));

    // Background static constellation lines
    const bgLines = [
      { x1: 0.1, y1: 0.15, x2: 0.22, y2: 0.22 },
      { x1: 0.22, y1: 0.22, x2: 0.35, y2: 0.18 },
      { x1: 0.65, y1: 0.12, x2: 0.82, y2: 0.2 },
      { x1: 0.82, y1: 0.2, x2: 0.9, y2: 0.35 },
      { x1: 0.12, y1: 0.65, x2: 0.28, y2: 0.75 },
      { x1: 0.72, y1: 0.7, x2: 0.88, y2: 0.62 },
    ];

    // Radial shockwave sparks for collision
    const sparks = Array.from({ length: 55 }, (_, i) => {
      const angle = (i / 55) * Math.PI * 2;
      const speed = 0.6 + (i % 5) * 0.3;
      return {
        cos: Math.cos(angle),
        sin: Math.sin(angle),
        speed,
        len: 15 + (i % 4) * 15,
        size: 1 + (i % 3) * 0.8,
      };
    });

    let animId;
    let time = 0;

    // Cubic bezier interpolation helper
    const cubicBezier = (p0, p1, p2, p3, t) => {
      const u = 1 - t;
      const tt = t * t;
      const uu = u * u;
      const uuu = uu * u;
      const ttt = tt * t;
      return uuu * p0 + 3 * uu * t * p1 + 3 * u * tt * p2 + ttt * p3;
    };

    // Smooth trajectory for Evelyn (Top-left -> curves through milestones -> Center)
    const getEvelynPos = (prog) => {
      const x = cubicBezier(0.12, 0.25, 0.42, 0.5, prog);
      const y = cubicBezier(0.18, 0.35, 0.58, 0.5, prog);
      const wobble = (1 - prog) * Math.sin(time * 2 + 1) * 0.012;
      return { x, y: y + wobble };
    };

    // Smooth trajectory for Adrian (Bottom-right -> curves through milestones -> Center)
    const getAdrianPos = (prog) => {
      const x = cubicBezier(0.88, 0.75, 0.58, 0.5, prog);
      const y = cubicBezier(0.82, 0.45, 0.38, 0.5, prog);
      const wobble = (1 - prog) * Math.cos(time * 2 + 2) * 0.012;
      return { x, y: y + wobble };
    };

    // Draw Deathly Hallows symbol (triangle + circle + vertical line)
    const drawDeathlyHallows = (cx, cy, size, alpha) => {
      if (alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = `rgba(220, 190, 255, ${alpha})`;
      ctx.lineWidth = 0.9;
      ctx.shadowColor = 'rgba(180, 140, 255, 0.6)';
      ctx.shadowBlur = 8;

      // Triangle (Cloak of Invisibility)
      const triH = size;
      const triW = size * 0.9;
      ctx.beginPath();
      ctx.moveTo(cx, cy - triH * 0.55);
      ctx.lineTo(cx + triW * 0.5, cy + triH * 0.45);
      ctx.lineTo(cx - triW * 0.5, cy + triH * 0.45);
      ctx.closePath();
      ctx.stroke();

      // Circle (Resurrection Stone)
      const circR = size * 0.22;
      ctx.beginPath();
      ctx.arc(cx, cy + triH * 0.05, circR, 0, Math.PI * 2);
      ctx.stroke();

      // Vertical Line (Elder Wand)
      ctx.beginPath();
      ctx.moveTo(cx, cy - triH * 0.55);
      ctx.lineTo(cx, cy + triH * 0.45);
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.restore();
    };

    const drawFrame = () => {
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      const prog = state.progress;
      time += 0.02;

      ctx.clearRect(0, 0, W, H);

      // Deep space backdrop
      const bg = ctx.createRadialGradient(
        W * 0.5,
        H * 0.5,
        0,
        W * 0.5,
        H * 0.5,
        W * 0.8
      );
      bg.addColorStop(0, '#0d091a');
      bg.addColorStop(0.5, '#080612');
      bg.addColorStop(1, '#040308');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Nebula haze
      const nebula = ctx.createRadialGradient(
        W * 0.5,
        H * 0.5,
        20,
        W * 0.5,
        H * 0.5,
        W * 0.5
      );
      nebula.addColorStop(0, 'rgba(90, 50, 140, 0.12)');
      nebula.addColorStop(0.5, 'rgba(40, 60, 120, 0.06)');
      nebula.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, W, H);

      // Deathly Hallows symbol — centered, subtle, grows with progress
      const hallowsAlpha = Math.min(0.18, prog * 0.28) * (0.5 + 0.5 * Math.sin(time * 0.5));
      const hallowsSize = Math.min(W, H) * 0.28;
      drawDeathlyHallows(W * 0.5, H * 0.5, hallowsSize, hallowsAlpha);

      // Background stars
      stars.forEach((s) => {
        const tw = Math.sin(time * s.pulseSpeed * 60 + s.phase);
        const a = s.opacity * (0.5 + 0.5 * tw);
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 230, 200, ${a.toFixed(3)})`;
        ctx.fill();
      });

      // Constellation backdrop lines
      bgLines.forEach((l) => {
        ctx.beginPath();
        ctx.moveTo(l.x1 * W, l.y1 * H);
        ctx.lineTo(l.x2 * W, l.y2 * H);
        ctx.strokeStyle = 'rgba(190, 160, 100, 0.08)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      });

      // Milestone Constellation Nodes & Connecting Filaments
      MILESTONES.forEach((m, idx) => {
        const mx = m.x * W;
        const my = m.y * H;
        const isReached = prog >= m.t - 0.05;
        const glowFactor = isReached
          ? Math.min(1, (prog - (m.t - 0.05)) / 0.12)
          : 0;

        // Connecting lines to previous milestone
        if (idx > 0 && prog >= MILESTONES[idx - 1].t) {
          const prev = MILESTONES[idx - 1];
          const lineProg = Math.min(
            1,
            Math.max(0, (prog - prev.t) / (m.t - prev.t))
          );
          const targetX = prev.x * W + (m.x - prev.x) * W * lineProg;
          const targetY = prev.y * H + (m.y - prev.y) * H * lineProg;

          ctx.beginPath();
          ctx.moveTo(prev.x * W, prev.y * H);
          ctx.lineTo(targetX, targetY);
          ctx.strokeStyle = `rgba(201, 168, 76, ${(
            0.15 +
            0.25 * glowFactor
          ).toFixed(2)})`;
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Milestone star node
        if (glowFactor > 0) {
          const halo = ctx.createRadialGradient(
            mx,
            my,
            0,
            mx,
            my,
            30 * glowFactor
          );
          halo.addColorStop(
            0,
            `rgba(240, 200, 100, ${(0.55 * glowFactor).toFixed(2)})`
          );
          halo.addColorStop(
            0.5,
            `rgba(180, 140, 60, ${(0.22 * glowFactor).toFixed(2)})`
          );
          halo.addColorStop(1, 'rgba(160, 110, 30, 0)');
          ctx.beginPath();
          ctx.arc(mx, my, 30 * glowFactor, 0, Math.PI * 2);
          ctx.fillStyle = halo;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(mx, my, 2.5 + 2 * glowFactor, 0, Math.PI * 2);
          ctx.fillStyle = '#fff9e6';
          ctx.fill();

          // Cross flare
          ctx.beginPath();
          ctx.moveTo(mx - 10 * glowFactor, my);
          ctx.lineTo(mx + 10 * glowFactor, my);
          ctx.moveTo(mx, my - 10 * glowFactor);
          ctx.lineTo(mx, my + 10 * glowFactor);
          ctx.strokeStyle = `rgba(255, 235, 170, ${(0.75 * glowFactor).toFixed(
            2
          )})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      });

      // Current positions of Evelyn and Adrian
      const evPos = getEvelynPos(prog);
      const adPos = getAdrianPos(prog);
      const evX = evPos.x * W;
      const evY = evPos.y * H;
      const adX = adPos.x * W;
      const adY = adPos.y * H;

      // Particle path trails
      if (prog > 0.02 && prog < 0.96) {
        // Evelyn Sapphire Trail
        ctx.beginPath();
        for (let tStep = 0; tStep <= prog; tStep += 0.03) {
          const pos = getEvelynPos(tStep);
          if (tStep === 0) ctx.moveTo(pos.x * W, pos.y * H);
          else ctx.lineTo(pos.x * W, pos.y * H);
        }
        ctx.strokeStyle = 'rgba(140, 180, 255, 0.25)';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Adrian Amber Trail
        ctx.beginPath();
        for (let tStep = 0; tStep <= prog; tStep += 0.03) {
          const pos = getAdrianPos(tStep);
          if (tStep === 0) ctx.moveTo(pos.x * W, pos.y * H);
          else ctx.lineTo(pos.x * W, pos.y * H);
        }
        ctx.strokeStyle = 'rgba(255, 195, 90, 0.25)';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Harmonious chord connecting them
        const chord = ctx.createLinearGradient(evX, evY, adX, adY);
        chord.addColorStop(0, 'rgba(140, 180, 255, 0.32)');
        chord.addColorStop(
          0.5,
          `rgba(220, 190, 110, ${(0.15 + 0.35 * prog).toFixed(2)})`
        );
        chord.addColorStop(1, 'rgba(255, 190, 80, 0.32)');
        ctx.beginPath();
        ctx.moveTo(evX, evY);
        ctx.lineTo(adX, adY);
        ctx.strokeStyle = chord;
        ctx.lineWidth = 1 + prog * 1.5;
        ctx.stroke();
      }

      // Render Evelyn (Starlight Sapphire)
      if (prog < 0.96) {
        const evGlow = ctx.createRadialGradient(evX, evY, 0, evX, evY, 28);
        evGlow.addColorStop(0, 'rgba(180, 215, 255, 0.95)');
        evGlow.addColorStop(0.35, 'rgba(120, 165, 240, 0.45)');
        evGlow.addColorStop(1, 'rgba(70, 110, 200, 0)');
        ctx.beginPath();
        ctx.arc(evX, evY, 28, 0, Math.PI * 2);
        ctx.fillStyle = evGlow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(evX, evY, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#f0f6ff';
        ctx.fill();

        if (prog < 0.75) {
          ctx.font = `300 12px 'Cormorant Garamond', serif`;
          ctx.fillStyle = `rgba(190, 220, 255, ${(1 - prog * 1.25).toFixed(
            2
          )})`;
          ctx.textAlign = 'center';
          ctx.fillText('Evelyn', evX, evY - 18);
        }
      }

      // Render Adrian (Solar Amber)
      if (prog < 0.96) {
        const adGlow = ctx.createRadialGradient(adX, adY, 0, adX, adY, 28);
        adGlow.addColorStop(0, 'rgba(255, 215, 120, 0.95)');
        adGlow.addColorStop(0.35, 'rgba(225, 160, 60, 0.45)');
        adGlow.addColorStop(1, 'rgba(180, 100, 30, 0)');
        ctx.beginPath();
        ctx.arc(adX, adY, 28, 0, Math.PI * 2);
        ctx.fillStyle = adGlow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(adX, adY, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff8e2';
        ctx.fill();

        if (prog < 0.75) {
          ctx.font = `300 12px 'Cormorant Garamond', serif`;
          ctx.fillStyle = `rgba(255, 225, 140, ${(1 - prog * 1.25).toFixed(
            2
          )})`;
          ctx.textAlign = 'center';
          ctx.fillText('Adrian', adX, adY - 18);
        }
      }

      // Collision Shockwave & Celestial Convergence (prog > 0.86)
      if (prog > 0.86) {
        const burstProg = (prog - 0.86) / 0.14; // 0..1
        const cx = W * 0.5;
        const cy = H * 0.5;

        // Expanding shockwave rings
        for (let r = 1; r <= 3; r++) {
          const ringRad = burstProg * (55 * r + 20);
          const ringAlpha = Math.max(0, (1 - burstProg) * (0.65 / r));
          ctx.beginPath();
          ctx.arc(cx, cy, ringRad, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(240, 210, 120, ${ringAlpha.toFixed(3)})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Radial spark filaments
        sparks.forEach((sp) => {
          const dist = burstProg * 95 * sp.speed;
          const px = cx + sp.cos * dist;
          const py = cy + sp.sin * dist;
          const p2x = cx + sp.cos * (dist + sp.len * (1 - burstProg));
          const p2y = cy + sp.sin * (dist + sp.len * (1 - burstProg));

          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(p2x, p2y);
          ctx.strokeStyle = `rgba(255, 235, 150, ${(
            (1 - burstProg * 0.8) *
            0.75
          ).toFixed(2)})`;
          ctx.lineWidth = sp.size;
          ctx.stroke();
        });

        // Center golden core
        const core = ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          85 * burstProg
        );
        core.addColorStop(
          0,
          `rgba(255, 250, 230, ${(0.95 * (1 - burstProg * 0.25)).toFixed(2)})`
        );
        core.addColorStop(
          0.3,
          `rgba(230, 195, 95, ${(0.65 * (1 - burstProg * 0.25)).toFixed(2)})`
        );
        core.addColorStop(
          0.7,
          `rgba(170, 120, 230, ${(0.35 * (1 - burstProg * 0.25)).toFixed(2)})`
        );
        core.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(cx, cy, 85 * burstProg, 0, Math.PI * 2);
        ctx.fillStyle = core;
        ctx.fill();

        // Transformation: Constellation filaments morph into Cartographic Coordinates
        if (burstProg > 0.55) {
          const mapMorphAlpha = (burstProg - 0.55) / 0.45;
          // Compass ring
          ctx.beginPath();
          ctx.arc(cx, cy, 145 * mapMorphAlpha, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(201, 168, 76, ${(
            0.4 * mapMorphAlpha
          ).toFixed(2)})`;
          ctx.lineWidth = 0.8;
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Cross coordinates
          ctx.beginPath();
          ctx.moveTo(cx - 170 * mapMorphAlpha, cy);
          ctx.lineTo(cx + 170 * mapMorphAlpha, cy);
          ctx.moveTo(cx, cy - 170 * mapMorphAlpha);
          ctx.lineTo(cx, cy + 170 * mapMorphAlpha);
          ctx.strokeStyle = `rgba(201, 168, 76, ${(
            0.28 * mapMorphAlpha
          ).toFixed(2)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(drawFrame);
    };

    if (!prefersReduced) drawFrame();

    // GSAP ScrollTrigger timeline
    const gsapCtx = gsap.context(() => {
      const isMobile = window.innerWidth < 768;
      const scrollLength = isMobile ? '+=320%' : '+=450%';

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: scrollLength,
        scrub: 1.2,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          state.progress = self.progress;
        },
      });

      // Milestone cards keyed to scroll
      let lastSoundPlayed = -1;
      MILESTONES.forEach((m, i) => {
        const card = storyCardsRef.current[i];
        if (!card) return;

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: scrollLength,
          scrub: 1,
          onUpdate: (self) => {
            const p = self.progress;
            const isVisible = p >= m.t - 0.08 && p < m.t + 0.16;

            if (isVisible && lastSoundPlayed !== i && p >= m.t - 0.02) {
              sound.playCelestialChime(528 + i * 80);
              lastSoundPlayed = i;
            }

            gsap.to(card, {
              opacity: isVisible ? 1 : 0,
              y: isVisible ? 0 : 25,
              scale: isVisible ? 1 : 0.92,
              duration: 0.3,
              ease: 'power2.out',
            });
          },
        });
      });

      // Silhouette & finale caption on collision
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: scrollLength,
        scrub: 1,
        onUpdate: (self) => {
          const show = self.progress > 0.85;
          if (photoRef.current) {
            gsap.to(photoRef.current, {
              opacity: show ? 1 : 0,
              scale: show ? 1 : 0.75,
              filter: show ? 'blur(0px)' : 'blur(8px)',
              duration: 0.4,
              ease: 'power2.out',
            });
          }
          if (photoTextRef.current) {
            gsap.to(photoTextRef.current, {
              opacity: show ? 1 : 0,
              y: show ? 0 : 25,
              duration: 0.4,
              ease: 'power2.out',
            });
          }
        },
      });
    }, sectionRef);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      gsapCtx.revert();
    };
  }, [prefersReduced]);

  return (
    <section
      ref={sectionRef}
      className="constellation-section scene"
      aria-label="Their love story constellation"
    >
      <canvas
        ref={canvasRef}
        className="constellation-canvas fill-parent"
        aria-hidden="true"
      />

      {/* Atmospheric vignette */}
      <div className="constellation-vignette" aria-hidden="true" />

      {/* Floating Unified Milestone Story Cards */}
      <div className="constellation-milestones" aria-live="polite">
        {MILESTONES.map((m, i) => (
          <div
            key={i}
            ref={(el) => (storyCardsRef.current[i] = el)}
            className={`milestone-card milestone-card--${i}`}
            aria-label={`${m.date}: ${m.title} — ${m.sub}`}
          >
            <div className="milestone-badge">
              <span className="milestone-spark" aria-hidden="true">
                ✦
              </span>
              <span className="milestone-date t-display">{m.date}</span>
            </div>
            <h3 className="milestone-title t-display">{m.title}</h3>
            <p className="milestone-sub t-serif">{m.sub}</p>
            <div className="milestone-divider" aria-hidden="true">
              <span className="gold-rule" style={{ width: '40px', margin: '0.35rem 0' }} />
            </div>
            <div className="milestone-story">
              {m.storyLines.map((line, j) => (
                <p
                  key={j}
                  className={`milestone-story-line t-serif ${
                    j === m.storyLines.length - 1 ? 'milestone-story-line--last' : ''
                  }`}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Central Couple Silhouette on Collision */}
      <div
        ref={photoRef}
        className="constellation-photo"
        aria-label="The couple silhouette"
      >
        <div className="photo-frame-glow">
          <svg
            viewBox="0 0 220 280"
            className="couple-illustration"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="portraitGlow" cx="50%" cy="45%" r="60%">
                <stop offset="0%" stopColor="rgba(201, 168, 76, 0.35)" />
                <stop offset="60%" stopColor="rgba(120, 80, 160, 0.15)" />
                <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
              </radialGradient>
              <linearGradient
                id="silhouetteGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#281e14" />
                <stop offset="100%" stopColor="#120c08" />
              </linearGradient>
            </defs>

            {/* Background oval medallion */}
            <ellipse
              cx="110"
              cy="140"
              rx="98"
              ry="125"
              fill="#0c0910"
              stroke="rgba(201, 168, 76, 0.45)"
              strokeWidth="1.2"
            />
            <ellipse
              cx="110"
              cy="140"
              rx="92"
              ry="118"
              fill="url(#portraitGlow)"
            />
            <ellipse
              cx="110"
              cy="140"
              rx="88"
              ry="114"
              fill="none"
              stroke="rgba(201, 168, 76, 0.22)"
              strokeWidth="0.8"
              strokeDasharray="4 3"
            />

            {/* Silhouette: Evelyn */}
            <g
              fill="url(#silhouetteGrad)"
              stroke="rgba(201, 168, 76, 0.3)"
              strokeWidth="0.5"
            >
              <ellipse cx="80" cy="85" rx="19" ry="24" />
              <path d="M56 280 Q62 170 80 145 Q90 130 105 136 Q98 148 92 180 L88 280Z" />
              <path
                d="M88 170 Q75 195 58 220"
                stroke="rgba(180, 140, 70, 0.6)"
                strokeWidth="16"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            {/* Silhouette: Adrian */}
            <g
              fill="url(#silhouetteGrad)"
              stroke="rgba(201, 168, 76, 0.3)"
              strokeWidth="0.5"
            >
              <ellipse cx="140" cy="84" rx="18" ry="23" />
              <path d="M118 280 Q122 190 132 160 Q142 138 155 144 Q160 165 162 195 L165 280Z" />
              <path
                d="M132 170 Q145 195 160 220"
                stroke="rgba(160, 120, 60, 0.6)"
                strokeWidth="15"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            {/* Clasping hands aura */}
            <circle
              cx="110"
              cy="190"
              r="14"
              fill="rgba(220, 185, 90, 0.3)"
              filter="blur(4px)"
            />
            <path
              d="M98 190 Q110 182 122 190"
              stroke="rgba(255, 230, 150, 0.8)"
              strokeWidth="2"
              fill="none"
            />

            {/* Delicate celestial stars around medallion */}
            {[35, 60, 160, 185].map((x, i) => (
              <circle
                key={i}
                cx={x}
                cy={35 + (i % 2) * 15}
                r="1.5"
                fill="rgba(220, 190, 100, 0.7)"
              />
            ))}
          </svg>
        </div>
      </div>

      {/* Final Caption at Collision */}
      <div
        ref={photoTextRef}
        className="constellation-caption"
        aria-live="polite"
      >
        <p className="caption-line t-display">Two Worlds Entwined</p>
        <p className="caption-sub t-ink">
          Guided by fate across the turning heavens
        </p>
      </div>

      {/* Screen reader summary */}
      <div className="visually-hidden">
        Interactive constellation showing the journey of Evelyn and Adrian
        through key milestones to their union.
      </div>
    </section>
  );
}
