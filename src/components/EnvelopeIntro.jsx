import { useRef, useState, useCallback, useEffect } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { WEDDING } from '../data/weddingData';
import { sound } from '../utils/audioSystem';
import DeathlyHallows from './DeathlyHallows';
import './EnvelopeIntro.css';

// Utility: clamp a value between min and max
const clampVal = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Atmospheric ambient particle motes (embers, paper fibers, and ink particles)
const AMBIENT_PARTICLES = [
  { type: 'ember', left: 16, top: 22, delay: 0.2, dur: 9.5, size: 2.2, dx: 14, dy: -28 },
  { type: 'fiber', left: 30, top: 68, delay: 1.8, dur: 12.0, size: 2.0, rot: 35, dx: -12, dy: -32 },
  { type: 'ink', left: 52, top: 20, delay: 3.1, dur: 10.5, size: 1.5, dx: 18, dy: -24 },
  { type: 'ember', left: 76, top: 70, delay: 0.8, dur: 13.0, size: 2.2, dx: -16, dy: -36 },
  { type: 'fiber', left: 84, top: 34, delay: 2.4, dur: 11.0, size: 2.4, rot: -40, dx: 10, dy: -26 },
  { type: 'ink', left: 42, top: 14, delay: 4.0, dur: 8.5, size: 1.3, dx: -8, dy: -20 },
  { type: 'ember', left: 22, top: 82, delay: 1.2, dur: 10.0, size: 1.8, dx: 15, dy: -30 },
  { type: 'fiber', left: 68, top: 16, delay: 3.5, dur: 14.0, size: 2.2, rot: 55, dx: -14, dy: -34 },
  { type: 'ink', left: 82, top: 84, delay: 2.0, dur: 9.0, size: 1.6, dx: -10, dy: -22 },
  { type: 'ember', left: 48, top: 86, delay: 0.5, dur: 11.5, size: 2.0, dx: 12, dy: -28 },
  { type: 'fiber', left: 12, top: 48, delay: 2.8, dur: 13.5, size: 1.8, rot: -25, dx: 16, dy: -30 },
  { type: 'ember', left: 64, top: 50, delay: 1.5, dur: 10.8, size: 2.4, dx: -15, dy: -26 },
];

export default function EnvelopeIntro({ onComplete }) {
  const sceneRef = useRef(null);
  const envelopeWrapRef = useRef(null);
  const envelopeBodyRef = useRef(null);
  const flapRef = useRef(null);
  const sealLeftRef = useRef(null);
  const sealRightRef = useRef(null);
  const crackLinesRef = useRef(null);
  const sparkCanvasRef = useRef(null);
  const risingLetterRef = useRef(null);
  const fullParchmentRef = useRef(null);
  const inkTextRef = useRef(null);
  const promptRef = useRef(null);
  const candleGlowRef1 = useRef(null);
  const candleGlowRef2 = useRef(null);
  const timelineRef = useRef(null);
  const scrollCueRef = useRef(null);
  const inkBridgeRef = useRef(null);
  const prefersReduced = useReducedMotion();
  const scrollListenerRef = useRef(null);

  const [phase, setPhase] = useState('idle'); // 'idle' | 'opening' | 'opened'
  const [subText, setSubText] = useState('A letter has found you.');
  const [isHovered, setIsHovered] = useState(false);

  // Ambient candle light motion
  useEffect(() => {
    if (prefersReduced) return;
    const tl1 = gsap.timeline({ repeat: -1, yoyo: true });
    if (candleGlowRef1.current) {
      tl1.to(candleGlowRef1.current, {
        x: 28,
        y: -18,
        scale: 1.12,
        opacity: 0.85,
        duration: 4.8,
        ease: 'sine.inOut',
      }).to(candleGlowRef1.current, {
        x: -22,
        y: 22,
        scale: 0.92,
        opacity: 0.65,
        duration: 5.8,
        ease: 'sine.inOut',
      });
    }

    const tl2 = gsap.timeline({ repeat: -1, yoyo: true });
    if (candleGlowRef2.current) {
      tl2.to(candleGlowRef2.current, {
        x: -30,
        y: 16,
        scale: 0.94,
        opacity: 0.7,
        duration: 6.2,
        ease: 'sine.inOut',
      }).to(candleGlowRef2.current, {
        x: 24,
        y: -20,
        scale: 1.15,
        opacity: 0.9,
        duration: 5.0,
        ease: 'sine.inOut',
      });
    }

    return () => {
      tl1.kill();
      tl2.kill();
    };
  }, [prefersReduced]);

  // Clean up GSAP on unmount
  useEffect(() => {
    return () => {
      if (timelineRef.current) timelineRef.current.kill();
      if (scrollListenerRef.current) {
        window.removeEventListener('scroll', scrollListenerRef.current);
      }
    };
  }, []);

  // Scroll-responsive parchment: when user scrolls, parchment immediately reacts with feedback
  useEffect(() => {
    if (phase !== 'opened') return;
    const parchment = fullParchmentRef.current;
    const bridge = inkBridgeRef.current;
    const scrollCue = scrollCueRef.current;
    if (!parchment) return;

    const handler = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight || 800;

      // 1. Scroll cue fades smoothly on the very first few pixels of scroll (0-90px)
      if (scrollCue) {
        const cueOpacity = Math.max(0, 1 - scrollY / 80);
        scrollCue.style.opacity = cueOpacity;
        scrollCue.style.pointerEvents = cueOpacity < 0.1 ? 'none' : 'auto';
        scrollCue.style.transform = `translateY(${Math.min(scrollY * 0.35, 25)}px)`;
      }

      // 2. Parchment drifts upward and fades out naturally as user scrolls into scene 2
      const t = clampVal(scrollY / (vh * 0.65), 0, 1);
      const yShift = -scrollY * 0.55;
      const scaleShift = 1 - t * 0.08;
      const opacityShift = Math.max(0, 1 - t * 0.95);

      parchment.style.transform = `translate(-50%, calc(-50% + ${yShift}px)) scale(${scaleShift})`;
      parchment.style.opacity = opacityShift;
      parchment.style.pointerEvents = opacityShift < 0.1 ? 'none' : 'auto';

      // 3. Ink bridge grows visible connecting downward to next section
      if (bridge) {
        bridge.style.opacity = clampVal(t * 2, 0, 1);
        bridge.style.transform = `scaleY(${clampVal(t * 1.5, 0, 1)})`;
      }
    };

    scrollListenerRef.current = handler;
    window.addEventListener('scroll', handler, { passive: true });
    handler();

    return () => {
      window.removeEventListener('scroll', handler);
      scrollListenerRef.current = null;
    };
  }, [phase]);

  // Wax crack spark particles and fragments
  const triggerWaxBurst = useCallback(() => {
    const canvas = sparkCanvasRef.current;
    if (!canvas || prefersReduced) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const cx = W / 2;
    const cy = H / 2 - 10;

    // Wax fragments + golden sparks
    const particles = Array.from({ length: 65 }, (_, i) => {
      const angle = (i / 65) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const speed = 2.5 + Math.random() * 6.0;
      const isWax = Math.random() > 0.4;
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        size: isWax ? 1.5 + Math.random() * 3.5 : 1 + Math.random() * 2.5,
        color: isWax ? 'rgba(168, 34, 34,' : 'rgba(243, 221, 144,',
        alpha: 1,
        decay: 0.02 + Math.random() * 0.02,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 15,
      };
    });

    let rafId;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      particles.forEach((p) => {
        if (p.alpha <= 0) return;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.14; // gravity
        p.alpha -= p.decay;
        p.rotation += p.rotSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${Math.max(0, p.alpha).toFixed(2)})`;
        ctx.shadowColor = '#c9a84c';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      });

      if (alive) {
        rafId = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, W, H);
      }
    };
    draw();
  }, [prefersReduced]);

  // Smoothly scroll down when clicking/tapping the continuation cue
  const handleCueClick = useCallback(() => {
    const targetY = window.innerHeight || 800;
    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });
    sound.playCelestialChime(528);
  }, []);

  // Master 14-Step Cinematic Opening Handler with Tactile Press Response
  const handleOpen = useCallback(() => {
    if (phase !== 'idle') return;
    setPhase('opening');

    sound.init();

    if (prefersReduced) {
      setPhase('opened');
      if (envelopeWrapRef.current) envelopeWrapRef.current.style.display = 'none';
      if (fullParchmentRef.current) {
        fullParchmentRef.current.style.opacity = '1';
        fullParchmentRef.current.style.visibility = 'visible';
        fullParchmentRef.current.style.display = 'flex';
      }
      if (inkTextRef.current) {
        const lines = inkTextRef.current.querySelectorAll('.ink-script-line');
        lines.forEach((l) => {
          l.style.opacity = '1';
          l.style.transform = 'none';
        });
      }
      onComplete?.();
      return;
    }

    const masterTl = gsap.timeline();
    timelineRef.current = masterTl;

    // STEP 1 & 2: TACTILE PRESS RESPONSE (0.0s – 0.35s)
    // 0.0s - 0.14s: Envelope compresses on touch
    masterTl.to(envelopeWrapRef.current, {
      scale: 0.965,
      y: 4,
      duration: 0.14,
      ease: 'power2.in',
    });

    // 0.15s - 0.35s: Seal awakens, pulses with gold warmth, envelope shudders gently
    masterTl.call(
      () => {
        setSubText('The seal awakens…');
        sound.playPaperRustle();
      },
      [],
      0.15
    );

    masterTl.to(
      '.envelope-wax-seal',
      {
        scale: 1.1,
        duration: 0.18,
        ease: 'power1.out',
      },
      0.15
    );

    masterTl.to(
      envelopeWrapRef.current,
      {
        keyframes: [
          { x: -5, rotation: -1.2, duration: 0.04 },
          { x: 5, rotation: 1.2, duration: 0.04 },
          { x: -3, rotation: -0.6, duration: 0.04 },
          { x: 3, rotation: 0.6, duration: 0.04 },
          { x: 0, rotation: 0, scale: 1, y: 0, duration: 0.06 },
        ],
        ease: 'none',
      },
      0.18
    );

    // STEP 3–6: WAX FISSURE PROPAGATION & BURST (0.35s – 0.9s)
    masterTl.call(
      () => {
        setSubText('The seal breaks…');
        sound.playWaxCrack();
      },
      [],
      0.35
    );

    if (crackLinesRef.current) {
      const lines = crackLinesRef.current.querySelectorAll('.seal-fissure');
      masterTl.to(
        lines,
        {
          strokeDashoffset: 0,
          stagger: 0.03,
          duration: 0.22,
          ease: 'power2.in',
        },
        0.35
      );
    }

    masterTl.call(() => triggerWaxBurst(), [], 0.55);

    masterTl.to(
      sealLeftRef.current,
      {
        x: -36,
        y: 20,
        rotation: -35,
        opacity: 0,
        scale: 0.75,
        duration: 0.45,
        ease: 'power3.out',
      },
      0.55
    );

    masterTl.to(
      sealRightRef.current,
      {
        x: 36,
        y: 22,
        rotation: 40,
        opacity: 0,
        scale: 0.75,
        duration: 0.45,
        ease: 'power3.out',
      },
      0.55
    );

    // Fade out tap CTA & ornamental underlay
    if (promptRef.current) {
      masterTl.to(
        promptRef.current,
        {
          opacity: 0,
          y: 10,
          duration: 0.3,
          ease: 'power2.in',
        },
        0.38
      );
    }

    masterTl.to(
      '.env-under-ornament',
      {
        opacity: 0,
        scale: 0.9,
        duration: 0.5,
        ease: 'power2.in',
      },
      0.4
    );

    // STEP 7 & 8: 3D FLAP OPENING (0.75s – 1.6s)
    masterTl.call(() => sound.playPaperRustle(), [], 0.8);
    masterTl.to(
      flapRef.current,
      {
        rotateX: -180,
        duration: 0.85,
        ease: 'power2.inOut',
      },
      0.75
    );

    // STEP 9–11: PARCHMENT LETTER RISES FROM POCKET (1.3s – 2.3s)
    masterTl.fromTo(
      risingLetterRef.current,
      { y: 0, opacity: 1, scale: 1 },
      { y: -160, opacity: 1, scale: 1.04, duration: 1.0, ease: 'power2.out' },
      1.3
    );

    masterTl.set(risingLetterRef.current, { zIndex: 35 }, 1.7);

    // STEP 12–14: ENVELOPE RECEDES & PARCHMENT BLOSSOMS (2.2s – 3.3s)
    masterTl.to(
      envelopeBodyRef.current,
      {
        scale: 0.65,
        y: 80,
        opacity: 0,
        filter: 'blur(10px)',
        duration: 0.85,
        ease: 'power2.inOut',
      },
      2.2
    );

    masterTl.set(
      fullParchmentRef.current,
      {
        visibility: 'visible',
        display: 'flex',
        pointerEvents: 'auto',
      },
      2.2
    );

    masterTl.fromTo(
      fullParchmentRef.current,
      { opacity: 0, scale: 0.5, y: -30, filter: 'blur(10px)' },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.05,
        ease: 'power3.out',
      },
      2.3
    );

    masterTl.to(
      risingLetterRef.current,
      {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.in',
      },
      2.45
    );

    // ANIMATED CALLIGRAPHY INK WRITING (3.2s – 4.8s)
    masterTl.call(
      () => {
        setPhase('opened');
        sound.playInkWrite();
      },
      [],
      3.2
    );

    if (inkTextRef.current) {
      const lines = inkTextRef.current.querySelectorAll('.ink-script-line');
      masterTl.fromTo(
        lines,
        {
          opacity: 0,
          y: 28,
          filter: 'blur(8px)',
          letterSpacing: '0.3em',
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          letterSpacing: '0.12em',
          stagger: 0.22,
          duration: 0.65,
          ease: 'power3.out',
          onStart: () => sound.playInkWrite(),
        },
        3.3
      );
    }

    // Scroll cue: the prominent "CONTINUE THE STORY" prompt
    if (scrollCueRef.current) {
      masterTl.fromTo(
        scrollCueRef.current,
        { opacity: 0, y: 22, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power2.out' },
        4.4
      );
    }

    // Complete & unlock scrolling
    masterTl.call(
      () => {
        sound.playCelestialChime(432);
        onComplete?.();
      },
      [],
      4.7
    );
  }, [phase, prefersReduced, triggerWaxBurst, onComplete]);

  return (
    <section
      ref={sceneRef}
      className={`envelope-scene scene envelope-scene--${phase}`}
      role="region"
      aria-label="Wedding invitation letter opening"
    >
      {/* ─── Layer 1: Deep Atmospheric Cosmos & Moving Candlelight ─── */}
      <div className="env-cosmic-bg" aria-hidden="true" />
      <div className="env-fog-layer env-fog-layer-1" aria-hidden="true" />
      <div className="env-fog-layer env-fog-layer-2" aria-hidden="true" />

      {/* Deathly Hallows emblem glowing behind the letter */}
      <div className="env-hallows" aria-hidden="true">
        <DeathlyHallows size="100%" strokeWidth={0.7} />
      </div>
      
      {/* Dual Warm Candlelight Auras */}
      <div ref={candleGlowRef1} className="env-candle-glow env-candle-glow-1" aria-hidden="true" />
      <div ref={candleGlowRef2} className="env-candle-glow env-candle-glow-2" aria-hidden="true" />

      {/* ─── Layer 2: Ambient Drifting Dust, Ink Flecks & Paper Fibers ─── */}
      <div className="env-particles-stage" aria-hidden="true">
        {AMBIENT_PARTICLES.map((p, i) => (
          <div
            key={i}
            className={`env-ambient-particle env-ambient-particle--${p.type}`}
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: p.type === 'fiber' ? `${p.size * 2.8}px` : `${p.size}px`,
              transform: p.rot ? `rotate(${p.rot}deg)` : undefined,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
            }}
          />
        ))}
      </div>

      {/* ─── Layer 3: Faint Antique Celestial Ornament Underneath Envelope ─── */}
      <div className="env-under-ornament" aria-hidden="true">
        <svg viewBox="0 0 400 400" className="under-ornament-svg">
          <circle cx="200" cy="200" r="185" fill="none" stroke="rgba(201, 168, 76, 0.08)" strokeWidth="0.8" />
          <circle cx="200" cy="200" r="172" fill="none" stroke="rgba(201, 168, 76, 0.12)" strokeWidth="1" strokeDasharray="3 4" />
          <circle cx="200" cy="200" r="148" fill="none" stroke="rgba(201, 168, 76, 0.07)" strokeWidth="0.8" />
          <circle cx="200" cy="200" r="115" fill="none" stroke="rgba(201, 168, 76, 0.10)" strokeWidth="1" strokeDasharray="6 6" />
          
          {/* Subtle Cardinal Notches & Star Rays */}
          <path d="M200 15 L200 45 M200 355 L200 385 M15 200 L45 200 M355 200 L385 200" stroke="rgba(201, 168, 76, 0.18)" strokeWidth="1" />
          <path d="M69 69 L90 90 M310 310 L331 331 M69 331 L90 310 M331 69 L310 90" stroke="rgba(201, 168, 76, 0.12)" strokeWidth="0.8" />
          
          {/* Delicate Antique Corner Flourishes */}
          <circle cx="200" cy="20" r="2.5" fill="rgba(243, 221, 144, 0.25)" />
          <circle cx="200" cy="380" r="2.5" fill="rgba(243, 221, 144, 0.25)" />
          <circle cx="20" cy="200" r="2.5" fill="rgba(243, 221, 144, 0.25)" />
          <circle cx="380" cy="200" r="2.5" fill="rgba(243, 221, 144, 0.25)" />
        </svg>
      </div>

      {/* Wax Spark Burst Canvas */}
      <canvas
        ref={sparkCanvasRef}
        className="env-spark-canvas fill-parent"
        aria-hidden="true"
      />

      {/* ─── Layer 4: PHYSICAL 3D ENVELOPE STAGE ─── */}
      <div
        ref={envelopeWrapRef}
        className={`envelope-3d-stage ${isHovered ? 'is-hovered' : ''}`}
      >
        <button
          className="envelope-interactive-btn"
          onClick={handleOpen}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsHovered(true)}
          onBlur={() => setIsHovered(false)}
          aria-label="Break the seal and open the wedding invitation envelope"
          disabled={phase !== 'idle'}
        >
          <div ref={envelopeBodyRef} className="envelope-body-box">
            {/* Paper Texture & Depth */}
            <div className="envelope-grain-texture" aria-hidden="true" />
            <div className="envelope-pocket-shadow" aria-hidden="true" />

            {/* Subtle Warm Light Sweep across paper surface */}
            <div className="envelope-light-sweep" aria-hidden="true" />

            {/* Rising Letter (emerges from pocket to front during opening) */}
            <div
              ref={risingLetterRef}
              className="envelope-rising-letter"
              aria-hidden="true"
            >
              <div className="letter-inner-card">
                <span className="letter-corner letter-corner--tl" />
                <span className="letter-corner letter-corner--tr" />
                <span className="letter-emblem-small">✦</span>
                <span className="letter-monogram-small t-display">EA</span>
                <span className="letter-corner letter-corner--bl" />
                <span className="letter-corner letter-corner--br" />
              </div>
            </div>

            {/* Bottom & Side Fold Triangles */}
            <div className="envelope-side-fold-l" aria-hidden="true" />
            <div className="envelope-side-fold-r" aria-hidden="true" />
            <div className="envelope-bottom-fold" aria-hidden="true" />

            {/* 3D Top Flap */}
            <div ref={flapRef} className="envelope-top-flap" aria-hidden="true">
              <div className="flap-outer" />
              <div className="flap-inner" />
            </div>

            {/* ─── WAX SEAL (The Living Centerpiece) ─── */}
            <div className="envelope-wax-seal" aria-hidden="true">
              {/* Living Wax Seal Ambient Aura & Glow */}
              <div className="seal-ambient-aura" />
              
              {/* Rare Specular Glint */}
              <div className="seal-specular-glint" />

              {/* Tiny orbiting golden magic motes */}
              <div className="seal-magic-mote seal-magic-mote-1" />
              <div className="seal-magic-mote seal-magic-mote-2" />
              <div className="seal-magic-mote seal-magic-mote-3" />

              {/* Left Shard */}
              <div ref={sealLeftRef} className="seal-shard seal-shard--left">
                <svg viewBox="0 0 100 100" className="shard-svg shard-svg--left">
                  <defs>
                    <radialGradient id="waxGradL" cx="38%" cy="36%" r="62%">
                      <stop offset="0%" stopColor="#c02a2a" />
                      <stop offset="35%" stopColor="#9e1919" />
                      <stop offset="70%" stopColor="#6e0f0f" />
                      <stop offset="100%" stopColor="#3d0606" />
                    </radialGradient>
                    <filter id="waxGleamL" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#ffe89e" floodOpacity="0.4" />
                    </filter>
                  </defs>
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="url(#waxGradL)"
                    stroke="#2e0404"
                    strokeWidth="2"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="37"
                    fill="none"
                    stroke="rgba(243, 221, 144, 0.55)"
                    strokeWidth="1.2"
                    strokeDasharray="3 2"
                  />
                  <text
                    x="50"
                    y="58"
                    textAnchor="middle"
                    fontSize="22"
                    fontFamily="'Cinzel Decorative', serif"
                    fontWeight="700"
                    fill="#f6e4a6"
                    filter="url(#waxGleamL)"
                  >
                    EA
                  </text>
                  <text
                    x="50"
                    y="74"
                    textAnchor="middle"
                    fontSize="9"
                    fontFamily="'Cinzel', serif"
                    letterSpacing="2"
                    fill="rgba(246, 228, 166, 0.8)"
                  >
                    ✦ 10.31 ✦
                  </text>
                </svg>
              </div>

              {/* Right Shard */}
              <div ref={sealRightRef} className="seal-shard seal-shard--right">
                <svg viewBox="0 0 100 100" className="shard-svg shard-svg--right">
                  <defs>
                    <radialGradient id="waxGradR" cx="38%" cy="36%" r="62%">
                      <stop offset="0%" stopColor="#c02a2a" />
                      <stop offset="35%" stopColor="#9e1919" />
                      <stop offset="70%" stopColor="#6e0f0f" />
                      <stop offset="100%" stopColor="#3d0606" />
                    </radialGradient>
                  </defs>
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="url(#waxGradR)"
                    stroke="#2e0404"
                    strokeWidth="2"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="37"
                    fill="none"
                    stroke="rgba(243, 221, 144, 0.55)"
                    strokeWidth="1.2"
                    strokeDasharray="3 2"
                  />
                  <text
                    x="50"
                    y="58"
                    textAnchor="middle"
                    fontSize="22"
                    fontFamily="'Cinzel Decorative', serif"
                    fontWeight="700"
                    fill="#f6e4a6"
                  >
                    EA
                  </text>
                  <text
                    x="50"
                    y="74"
                    textAnchor="middle"
                    fontSize="9"
                    fontFamily="'Cinzel', serif"
                    letterSpacing="2"
                    fill="rgba(246, 228, 166, 0.8)"
                  >
                    ✦ 10.31 ✦
                  </text>
                </svg>
              </div>

              {/* Fissures Overlay */}
              <svg
                ref={crackLinesRef}
                viewBox="0 0 100 100"
                className="seal-fissures-svg"
              >
                {[
                  'M50 6 L49 32 L53 50 L47 70 L50 94',
                  'M49 32 L26 20',
                  'M53 50 L75 38',
                  'M47 70 L24 80',
                  'M47 70 L72 82',
                ].map((d, i) => (
                  <path
                    key={i}
                    d={d}
                    className="seal-fissure"
                    stroke="#fff5d0"
                    strokeWidth={i === 0 ? '2.5' : '1.4'}
                    fill="none"
                    strokeLinecap="round"
                  />
                ))}
              </svg>
            </div>
          </div>
        </button>

        {/* ─── Layer 5: Subtle Animated Connecting Ink Trail ─── */}
        <div className="env-connector-trail" aria-hidden="true">
          <svg viewBox="0 0 2 36" className="connector-svg">
            <line x1="1" y1="0" x2="1" y2="36" className="connector-line" />
          </svg>
          <span className="connector-dot" />
        </div>

        {/* ─── Layer 6: Editorial Invitation Cue & Interactive Prompt ─── */}
        <div
          ref={promptRef}
          className="env-prompt-group"
          aria-live="polite"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <p className="env-owlpost t-display">By Owl Post</p>
          <p className="env-tagline t-ink">{subText}</p>
          <button
            type="button"
            className="env-cta-btn"
            onClick={handleOpen}
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
            aria-label="Break the wax seal"
            disabled={phase !== 'idle'}
          >
            <span className="cta-ornament-dash">✦</span>
            <span className="cta-text t-display">BREAK THE SEAL</span>
            <span className="cta-ornament-dash">✦</span>
          </button>
        </div>
      </div>

      {/* ─── FULL INVITATION PARCHMENT CARD (Foreground Hero) ─── */}
      <div
        ref={fullParchmentRef}
        className="env-fullscreen-parchment"
        aria-hidden={phase === 'idle'}
      >
        <div className="parchment-fiber-layer" aria-hidden="true" />
        <div className="parchment-warm-vignette" aria-hidden="true" />

        <div className="full-corner full-corner--tl" aria-hidden="true" />
        <div className="full-corner full-corner--tr" aria-hidden="true" />
        <div className="full-corner full-corner--bl" aria-hidden="true" />
        <div className="full-corner full-corner--br" aria-hidden="true" />

        {/* Ink text — editorial composition */}
        <div ref={inkTextRef} className="parchment-ink-container" aria-live="polite">
          {/* Deathly Hallows sigil */}
          <div className="ink-script-line ink-hallows">
            <DeathlyHallows size={64} strokeWidth={2} title="Deathly Hallows" />
          </div>

          {/* Small pre-title */}
          <p className="ink-script-line ink-pretitle t-display">
            YOU ARE INVITED
          </p>

          {/* Thin gold ornament line */}
          <div className="ink-script-line ink-ornament-rule">
            <span className="gold-rule" />
          </div>

          {/* The names — stacked, editorial */}
          <div className="ink-script-line ink-names-stack t-display">
            <span className="ink-name-first">EVELYN</span>
            <span className="ink-names-cross-center">×</span>
            <span className="ink-name-second">ADRIAN</span>
          </div>

          {/* Lower ornament */}
          <div className="ink-script-line ink-ornament-rule">
            <span className="gold-rule" />
          </div>

          <p className="ink-script-line ink-letter-line t-ink">
            We are pleased to inform you that you have been
            <br />
            accepted as a guest at our wedding.
          </p>

          {/* Date */}
          <p className="ink-script-line ink-date t-display">
            31 OCTOBER 2026
          </p>

          {/* Venue */}
          <p className="ink-script-line ink-venue t-serif">
            {WEDDING.venue.full}
          </p>
        </div>

        {/* Scroll continuation cue — prominent, elegant, animated visual guidance */}
        <div
          ref={scrollCueRef}
          className="scroll-cue"
          onClick={handleCueClick}
          role="button"
          tabIndex={0}
          aria-label="Scroll down to continue the story"
        >
          <div className="scroll-cue-header">
            <span className="scroll-cue-dash" aria-hidden="true">✦</span>
            <span className="scroll-cue-text t-display">CONTINUE THE STORY</span>
            <span className="scroll-cue-dash" aria-hidden="true">✦</span>
          </div>

          <div className="scroll-cue-trail" aria-hidden="true">
            <svg
              className="scroll-cue-trail-svg"
              viewBox="0 0 24 52"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Animated flowing vertical line */}
              <line
                x1="12"
                y1="2"
                x2="12"
                y2="38"
                className="scroll-cue-line"
              />
              {/* Downward indicator chevron */}
              <path
                d="M7 32 L12 40 L17 32"
                className="scroll-cue-chevron"
              />
              {/* Pulsing guidance dot */}
              <circle
                cx="12"
                cy="46"
                r="1.8"
                className="scroll-cue-dot"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Ink bridge — visual trail between invitation and next section */}
      <div
        ref={inkBridgeRef}
        className="ink-bridge"
        aria-hidden="true"
      >
        <svg
          className="ink-bridge-svg"
          viewBox="0 0 2 200"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="inkBridgeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.6" />
              <stop offset="50%" stopColor="var(--gold)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M1 0 L1 200"
            stroke="url(#inkBridgeGrad)"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </section>
  );
}
