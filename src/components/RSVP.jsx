import { useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { sound } from '../utils/audioSystem';
import './RSVP.css';

const RESPONSES = {
  attend: {
    label: 'I will be there.',
    icon: '✦',
    title: 'YOUR PLACE HAS BEEN RESERVED',
    sub: 'The Grand Hall in Edinburgh awaits your arrival beneath candlelight and starlight.',
    sealText: 'CONFIRMED',
    sealColor: '#1e4d2b',
    sealBorder: '#38a169',
  },
  decline: {
    label: "I'll be there in spirit.",
    icon: '✧',
    title: 'YOUR BLESSINGS ARE EMBRACED',
    sub: 'Though miles may part us on this eve, your love and spirit travel with us.',
    sealText: 'RECEIVED',
    sealColor: '#5c1428',
    sealBorder: '#e11d48',
  },
};

export default function RSVP() {
  const sectionRef = useRef(null);
  const parchmentRef = useRef(null);
  const stampRef = useRef(null);
  const canvasRef = useRef(null);
  const inputRef = useRef(null);
  const prefersReduced = useReducedMotion();

  const [phase, setPhase] = useState('choose'); // 'choose' | 'name' | 'stamping' | 'confirmed'
  const [choice, setChoice] = useState(null);
  const [name, setName] = useState('');

  // Magical particle burst on stamp landing
  const triggerMagicalBurst = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReduced) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    const cx = W / 2;
    const cy = H * 0.56;

    const sparks = Array.from({ length: 75 }, (_, i) => {
      const angle = (i / 75) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 6;
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.8,
        size: 1 + Math.random() * 3.2,
        opacity: 1,
        color:
          Math.random() > 0.4
            ? 'rgba(243, 221, 144,'
            : 'rgba(255, 240, 180,',
      };
    });

    let rafId;
    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      let isAlive = false;

      sparks.forEach((p) => {
        if (p.opacity <= 0) return;
        isAlive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.opacity -= 0.022;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${Math.max(0, p.opacity).toFixed(2)})`;
        ctx.shadowColor = 'rgba(201, 168, 76, 0.85)';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      if (isAlive) {
        rafId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, W, H);
      }
    };
    animate();
  }, [prefersReduced]);

  const initCanvas = useCallback((canvas) => {
    canvasRef.current = canvas;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
  }, []);

  // Handle Decision: Parchment reacts with physical bloom
  const handleDecision = useCallback(
    (decisionKey) => {
      if (phase !== 'choose') return;
      setChoice(decisionKey);
      sound.playPaperRustle();

      if (prefersReduced) {
        setPhase('name');
        return;
      }

      gsap.to(parchmentRef.current, {
        scale: 1.03,
        boxShadow:
          '0 25px 70px rgba(0, 0, 0, 0.95), 0 0 40px rgba(201, 168, 76, 0.4)',
        duration: 0.28,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          setPhase('name');
          setTimeout(() => inputRef.current?.focus(), 150);
        },
      });
    },
    [phase, prefersReduced]
  );

  // Handle Submit: Wax seal forms, heavy stamp drops, particle burst, confirmation
  const handleSealSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (phase !== 'name') return;
      setPhase('stamping');

      if (prefersReduced) {
        setPhase('confirmed');
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => setPhase('confirmed'),
      });

      // 1. Heavy antique stamp drops with realistic gravity
      if (stampRef.current) {
        tl.fromTo(
          stampRef.current,
          { y: -180, opacity: 0, scale: 2.2, rotation: -35 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            rotation: -6,
            duration: 0.42,
            ease: 'power4.in',
            onComplete: () => {
              sound.playStampThud();
              triggerMagicalBurst();
            },
          }
        );
      }

      // 2. Impact screen shake on parchment
      tl.to(
        parchmentRef.current,
        {
          keyframes: [
            { y: 8, duration: 0.05 },
            { y: -5, duration: 0.05 },
            { y: 3, duration: 0.04 },
            { y: 0, duration: 0.06 },
          ],
        },
        0.42
      );
    },
    [phase, prefersReduced, triggerMagicalBurst]
  );

  const activeResponse = choice ? RESPONSES[choice] : null;

  return (
    <section
      ref={sectionRef}
      className="rsvp-section scene"
      aria-label="RSVP — Will you join us?"
    >
      {/* Sparkle burst canvas */}
      <canvas
        ref={initCanvas}
        className="rsvp-burst-canvas fill-parent"
        aria-hidden="true"
      />

      {/* Atmospheric parchment background */}
      <div className="rsvp-ambient-bg" aria-hidden="true" />

      {/* Main Interactive Parchment Card */}
      <div
        ref={parchmentRef}
        className={`rsvp-parchment rsvp-parchment--${phase}`}
      >
        {/* Ornate Corner Filigrees */}
        <div
          className="parchment-corner parchment-corner--tl"
          aria-hidden="true"
        />
        <div
          className="parchment-corner parchment-corner--tr"
          aria-hidden="true"
        />
        <div
          className="parchment-corner parchment-corner--bl"
          aria-hidden="true"
        />
        <div
          className="parchment-corner parchment-corner--br"
          aria-hidden="true"
        />

        {/* Parchment Header */}
        <div className="rsvp-header">
          <span className="rsvp-spark" aria-hidden="true">✦</span>
          <h2 className="rsvp-main-title t-display">Will you be there?</h2>
          <span className="rsvp-spark" aria-hidden="true">✦</span>
        </div>

        <div className="rsvp-gold-rule">
          <span className="gold-rule" />
        </div>

        <p className="rsvp-invitation-line t-ink">
          Evelyn Ashcroft & Adrian Blackwood
          <br />
          request the honour of your presence
        </p>

        {/* Phase 1: Ritual Choice (Attend or Decline) */}
        {phase === 'choose' && (
          <div
            className="rsvp-ritual-choices"
            role="group"
            aria-label="RSVP Ritual Choices"
          >
            {Object.entries(RESPONSES).map(([key, res]) => (
              <button
                key={key}
                className={`rsvp-ritual-btn rsvp-ritual-btn--${key}`}
                onClick={() => handleDecision(key)}
                aria-label={res.label}
              >
                <span className="ritual-btn-icon" aria-hidden="true">
                  {res.icon}
                </span>
                <span className="ritual-btn-label t-display">{res.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Phase 2: Handwritten Name Input */}
        {phase === 'name' && (
          <form
            className="rsvp-name-form"
            onSubmit={handleSealSubmit}
            aria-label="Enter your name to seal RSVP"
          >
            <div className="decision-callout t-ink">
              <span className="decision-icon">{activeResponse?.icon}</span>
              <span className="decision-label">{activeResponse?.label}</span>
            </div>

            <label
              className="name-prompt-label t-handwritten"
              htmlFor="guest-name-input"
            >
              Sign your name below…
            </label>

            <div className="name-input-wrapper">
              <input
                ref={inputRef}
                id="guest-name-input"
                type="text"
                className="name-ink-input t-ink"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Write your name here"
                autoComplete="name"
                required
                aria-label="Your full name"
                inputMode="text"
                enterKeyHint="send"
              />
              <div className="ink-underline" aria-hidden="true" />
            </div>

            <button
              type="submit"
              className="rsvp-seal-submit-btn t-display"
              aria-label="Seal and Dispatch RSVP"
            >
              ✦ SEAL & DISPATCH ✦
            </button>
          </form>
        )}

        {/* Phase 3 & 4: Stamping Impact & Confirmation */}
        {(phase === 'stamping' || phase === 'confirmed') && (
          <div className="rsvp-sealed-confirmation" aria-live="assertive">
            {/* The Stamped Wax Monogram Seal */}
            <div
              ref={stampRef}
              className="rsvp-wax-stamp"
              style={{
                borderColor: activeResponse?.sealBorder,
                background: activeResponse?.sealColor,
                opacity: phase === 'confirmed' ? 1 : 0,
              }}
            >
              <div className="stamp-inner-disc">
                <span className="stamp-seal-status t-display">
                  {activeResponse?.sealText}
                </span>
                <span className="stamp-monogram t-serif">EA</span>
                <span className="stamp-ornament">✦</span>
              </div>
            </div>

            {phase === 'confirmed' && (
              <div className="confirmation-narrative">
                <h3 className="confirm-title t-display">
                  {activeResponse?.title}
                </h3>
                <p className="confirm-sub t-ink">{activeResponse?.sub}</p>
                {name && (
                  <p className="confirm-guest-name t-ink">— {name} —</p>
                )}
                <p className="confirm-venue-stamp t-serif">
                  The Grand Hall · Edinburgh · 31.10.2026
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer Details */}
        {phase === 'choose' && (
          <div className="rsvp-parchment-footer">
            <p className="footer-venue t-serif">The Grand Hall, Edinburgh</p>
            <p className="footer-date t-ink">31 October 2026</p>
          </div>
        )}
      </div>
    </section>
  );
}
