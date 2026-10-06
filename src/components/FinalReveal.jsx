import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { sound } from '../utils/audioSystem';
import { NAV_ITEMS, scrollToSection } from './NavBar';
import { downloadCalendarInvite } from '../utils/calendar';
import { WEDDING } from '../data/weddingData';
import { canvasDpr, scaled, visibilityGate, IS_LOW_POWER } from '../utils/perf';
import './FinalReveal.css';

gsap.registerPlugin(ScrollTrigger);

export default function FinalReveal() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const line3Ref = useRef(null);
  const line4Ref = useRef(null);
  const sealRef = useRef(null);
  const venueRef = useRef(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) {
      [line1Ref, line2Ref, line3Ref, line4Ref, sealRef, venueRef].forEach(
        (r) => {
          if (r.current) r.current.style.opacity = '1';
        }
      );
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const gate = visibilityGate(canvas);
    let animId;
    const dpr = canvasDpr();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Scrub state for particle vortex condensation
    const vortexState = { converge: 0 };

    // 120 floating particles that vortex and gather into center
    const particles = Array.from({ length: scaled(120) }, (_, i) => {
      const angle = (i / scaled(120)) * Math.PI * 2;
      const dist = 180 + Math.random() * 260;
      return {
        x: Math.random(),
        y: Math.random(),
        origAngle: angle,
        origDist: dist,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.3 - Math.random() * 0.5,
        size: 0.8 + Math.random() * 1.8,
        opacity: 0.3 + Math.random() * 0.6,
        pulse: Math.random() * Math.PI * 2,
      };
    });

    let time = 0;

    const draw = () => {
      if (!gate.on) { animId = requestAnimationFrame(draw); return; }
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      const cx = W / 2;
      const cy = H / 2;
      ctx.clearRect(0, 0, W, H);
      time += 0.02;

      const cFactor = vortexState.converge;

      particles.forEach((p, idx) => {
        p.pulse += 0.03;

        let px = p.x * W + Math.sin(time + idx) * 15;
        let py = p.y * H + Math.cos(time + idx) * 12;

        if (cFactor > 0.01) {
          const spin = time * 0.8 + p.origAngle;
          const currentDist = p.origDist * (1 - cFactor * 0.75);
          const targetX = cx + Math.cos(spin) * currentDist;
          const targetY = cy + Math.sin(spin) * (currentDist * 0.6);

          px = px * (1 - cFactor) + targetX * cFactor;
          py = py * (1 - cFactor) + targetY * cFactor;
        }

        const osc = 0.4 + 0.6 * Math.sin(p.pulse);
        const a = p.opacity * osc * (1 - cFactor * 0.25);

        ctx.beginPath();
        ctx.arc(px, py, p.size * (1 + cFactor * 0.4), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(225, 195, 100, ${a.toFixed(3)})`;
        ctx.shadowColor = 'rgba(201, 168, 76, 0.5)';
        ctx.shadowBlur = IS_LOW_POWER ? 0 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Center golden glow pool
      if (cFactor > 0.3) {
        const glowRad = (1 - cFactor) * 120 + 40;
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRad);
        glow.addColorStop(
          0,
          `rgba(225, 195, 100, ${(0.4 * cFactor).toFixed(2)})`
        );
        glow.addColorStop(
          0.6,
          `rgba(180, 130, 50, ${(0.15 * cFactor).toFixed(2)})`
        );
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(cx, cy, glowRad, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    // GSAP ScrollTrigger timeline
    const gsapCtx = gsap.context(() => {
      let soundTriggered = false;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          end: 'bottom 90%',
          scrub: 0.8,
          onUpdate: (self) => {
            vortexState.converge = self.progress;
            if (self.progress > 0.25 && !soundTriggered) {
              sound.playCelestialChime(432);
              soundTriggered = true;
            }
          },
        },
      });

      if (line1Ref.current) {
        tl.fromTo(
          line1Ref.current,
          { opacity: 0, y: 25, scale: 0.9, filter: 'blur(6px)' },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.25,
            ease: 'power2.out',
          },
          0.05
        );
      }

      if (line2Ref.current) {
        tl.fromTo(
          line2Ref.current,
          {
            opacity: 0,
            y: 30,
            scale: 0.85,
            letterSpacing: '0.4em',
            filter: 'blur(8px)',
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            letterSpacing: '0.14em',
            filter: 'blur(0px)',
            duration: 0.35,
            ease: 'power3.out',
          },
          0.18
        );
      }

      if (line3Ref.current) {
        tl.fromTo(
          line3Ref.current,
          { opacity: 0, y: 20, filter: 'blur(4px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.25,
            ease: 'power2.out',
          },
          0.35
        );
      }

      if (line4Ref.current) {
        tl.fromTo(
          line4Ref.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' },
          0.48
        );
      }

      if (sealRef.current) {
        tl.fromTo(
          sealRef.current,
          { opacity: 0, scale: 0.4, rotation: -90 },
          {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 0.2,
            ease: 'back.out(2)',
          },
          0.58
        );
      }

      if (venueRef.current) {
        tl.fromTo(
          venueRef.current,
          { opacity: 0, y: 12 },
          { opacity: 0.85, y: 0, duration: 0.2, ease: 'power2.out' },
          0.66
        );
      }
    }, sectionRef);

    return () => {
      cancelAnimationFrame(animId);
      gate.disconnect();
      window.removeEventListener('resize', resize);
      gsapCtx.revert();
    };
  }, [prefersReduced]);

  return (
    <section
      id="finale"
      ref={sectionRef}
      className="final-section scene"
      aria-label="Save the date — final reveal"
    >
      <canvas
        ref={canvasRef}
        className="final-canvas fill-parent"
        aria-hidden="true"
      />

      <div className="final-content">
        {/* Decorative Top Flourish */}
        <div className="final-deco-top" aria-hidden="true">
          <svg viewBox="0 0 240 40" className="final-deco-svg">
            <path
              d="M10 20 Q60 5 120 20 Q180 35 230 20"
              stroke="rgba(201,168,76,0.4)"
              strokeWidth="1"
              fill="none"
            />
            <circle cx="120" cy="20" r="3.5" fill="#f0d480" />
            {[30, 75, 165, 210].map((x, i) => (
              <circle
                key={i}
                cx={x}
                cy={20}
                r="1.5"
                fill="rgba(201,168,76,0.5)"
              />
            ))}
          </svg>
        </div>

        {/* Whisper before the reveal */}
        <p className="final-whisper t-handwritten">
          one more thing…
        </p>

        {/* Wedding Date in Gold */}
        <p
          ref={line1Ref}
          className="final-date t-display"
          aria-label="Wedding date: 31 October 2026"
        >
          31 · October · 2026
        </p>

        {/* Couple Names */}
        <h2
          ref={line2Ref}
          className="final-names t-display"
          aria-label="Evelyn and Adrian"
        >
          EVELYN × ADRIAN
        </h2>

        {/* Save the Date */}
        <p ref={line3Ref} className="final-save t-ink">
          Save the Date
        </p>

        {/* Tagline */}
        <p ref={line4Ref} className="final-tagline t-handwritten">
          Be there.
        </p>

        {/* Decorative Seal Symbol */}
        <div ref={sealRef} className="final-deco-bottom" aria-hidden="true">
          <span className="gold-rule" style={{ width: '80px' }} />
          <span className="final-seal-text t-display">✦</span>
          <span className="gold-rule" style={{ width: '80px' }} />
        </div>

        {/* Venue & Location */}
        <p ref={venueRef} className="final-venue t-serif">
          The Grand Hall · Edinburgh · Scotland
        </p>
      </div>

      {/* Cinematic Vignette */}
      <div className="final-vignette" aria-hidden="true" />

      <footer className="site-footer">
        <div className="footer-actions">
          <button type="button" className="footer-btn footer-btn--primary t-display" onClick={() => scrollToSection('rsvp')}>
            Reply to the invitation
          </button>
          <button type="button" className="footer-btn t-display" onClick={downloadCalendarInvite}>
            Add to calendar
          </button>
        </div>
        <nav className="footer-links" aria-label="Footer">
          {NAV_ITEMS.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={(e) => { e.preventDefault(); scrollToSection(n.id); }}>
              {n.label}
            </a>
          ))}
        </nav>
        <p className="footer-note t-ink">
          Questions? Write to <a href={`mailto:${WEDDING.rsvp.email}`}>{WEDDING.rsvp.email}</a>
        </p>
        <p className="footer-mischief t-display">Mischief managed.</p>
      </footer>
    </section>
  );
}
