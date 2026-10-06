import { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { sound } from '../utils/audioSystem';
import CouplePhoto from './CouplePhoto';
import './MemoryGallery.css';

// 6 Richly crafted memories as detailed SVG/CSS art scenes
const MEMORIES = [
  {
    id: 0,
    photo: '/photos/memory-1.jpg',
    title: 'A Candlelit Evening',
    date: '14 February 2021',
    place: 'St. Andrews',
    caption: 'Where two quiet paths first crossed under a winter sky.',
    scene: (
      <svg
        viewBox="0 0 340 230"
        className="liquid-svg"
        aria-label="Romantic candlelit evening illustration"
      >
        <defs>
          <radialGradient id="candleAtm" cx="50%" cy="55%" r="60%">
            <stop offset="0%" stopColor="rgba(240, 170, 70, 0.45)" />
            <stop offset="50%" stopColor="rgba(160, 90, 30, 0.15)" />
            <stop offset="100%" stopColor="rgba(10, 8, 14, 0)" />
          </radialGradient>
          <radialGradient id="flameGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff2a8" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
          </radialGradient>
        </defs>
        <rect width="340" height="230" fill="#0f0b12" />
        <rect x="0" y="155" width="340" height="75" fill="#08060a" />
        {/* Background window with stars */}
        <path
          d="M100 30 Q170 10 240 30 L240 150 L100 150 Z"
          fill="#090d18"
          stroke="rgba(201,168,76,0.25)"
          strokeWidth="1"
        />
        <line
          x1="170"
          y1="20"
          x2="170"
          y2="150"
          stroke="rgba(201,168,76,0.2)"
          strokeWidth="1"
        />
        <line
          x1="100"
          y1="90"
          x2="240"
          y2="90"
          stroke="rgba(201,168,76,0.2)"
          strokeWidth="1"
        />
        {/* Distant stars in window */}
        {[
          { x: 120, y: 50 },
          { x: 145, y: 70 },
          { x: 190, y: 45 },
          { x: 215, y: 75 },
          { x: 135, y: 110 },
          { x: 200, y: 120 },
          { x: 165, y: 60 },
        ].map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r="1"
            fill="#e8d5a3"
            opacity="0.75"
          />
        ))}
        {/* Atmospheric candle glow */}
        <rect width="340" height="230" fill="url(#candleAtm)" />
        {/* Table */}
        <rect
          x="60"
          y="145"
          width="220"
          height="12"
          fill="#2d1f14"
          rx="2"
          stroke="rgba(201,168,76,0.3)"
          strokeWidth="0.8"
        />
        <path d="M75 157 L85 200 L95 157" fill="#1f150d" />
        <path d="M265 157 L255 200 L245 157" fill="#1f150d" />
        {/* Candles */}
        {[
          { x: 135, y: 110, h: 36, w: 8 },
          { x: 170, y: 98, h: 48, w: 9 },
          { x: 200, y: 116, h: 30, w: 8 },
        ].map((c, i) => (
          <g key={i}>
            <rect
              x={c.x - c.w / 2}
              y={c.y}
              width={c.w}
              height={c.h}
              fill="#e5d0a0"
              rx="1.5"
            />
            <line
              x1={c.x}
              y1={c.y}
              x2={c.x}
              y2={c.y - 4}
              stroke="#4a3728"
              strokeWidth="1"
            />
            <ellipse cx={c.x} cy={c.y - 8} rx="4" ry="7" fill="#ffb830" />
            <ellipse cx={c.x} cy={c.y - 7} rx="2" ry="4" fill="#fffbe8" />
            <circle
              cx={c.x}
              cy={c.y - 8}
              r="18"
              fill="url(#flameGlow)"
              opacity="0.45"
            />
          </g>
        ))}
        {/* Wine glasses */}
        <path
          d="M110 132 Q115 152 118 156 L110 156 L126 156 L118 152 Q121 147 126 132 Z"
          fill="rgba(180, 50, 60, 0.4)"
          stroke="rgba(220, 190, 130, 0.4)"
          strokeWidth="0.6"
        />
        <path
          d="M225 130 Q230 150 233 154 L225 154 L241 154 L233 150 Q236 145 241 130 Z"
          fill="rgba(180, 50, 60, 0.35)"
          stroke="rgba(220, 190, 130, 0.4)"
          strokeWidth="0.6"
        />
      </svg>
    ),
  },
  {
    id: 1,
    photo: '/photos/memory-2.jpg',
    title: 'The Highland Trail',
    date: '27 August 2022',
    place: 'Isle of Skye',
    caption: 'Lost amidst towering mountain mists and ancient streams.',
    scene: (
      <svg
        viewBox="0 0 340 230"
        className="liquid-svg"
        aria-label="Highland road adventure illustration"
      >
        <defs>
          <linearGradient id="skyMists" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0c1420" />
            <stop offset="60%" stopColor="#182535" />
            <stop offset="100%" stopColor="#283a48" />
          </linearGradient>
        </defs>
        <rect width="340" height="230" fill="url(#skyMists)" />
        {/* Moon */}
        <circle cx="270" cy="45" r="22" fill="#e8dcba" opacity="0.8" />
        <circle cx="280" cy="40" r="20" fill="#0c1420" />
        {/* Mountain Silhouettes */}
        <path
          d="M0 160 Q60 90 130 135 Q200 80 270 140 Q310 100 340 150 L340 230 L0 230 Z"
          fill="#141e1b"
        />
        <path
          d="M0 180 Q80 130 170 165 Q250 140 340 175 L340 230 L0 230 Z"
          fill="#0e1713"
        />
        {/* Winding trail */}
        <path
          d="M120 230 Q170 180 180 150"
          stroke="#c9a84c"
          strokeWidth="2.5"
          fill="none"
          strokeDasharray="6 4"
          opacity="0.6"
        />
        {/* Walking Figures */}
        <g transform="translate(160, 142)">
          <circle cx="0" cy="-14" r="5" fill="#f0d59e" />
          <path d="M-4 -8 L-5 6 L0 16 L5 6 L4 -8 Z" fill="#2b3b2c" />
        </g>
        <g transform="translate(195, 145)">
          <circle cx="0" cy="-13" r="4.5" fill="#e8c878" />
          <path d="M-4 -7 L-4 5 L0 15 L4 5 L4 -7 Z" fill="#3a2f24" />
        </g>
        {/* Stars */}
        {[
          { x: 40, y: 30 },
          { x: 80, y: 60 },
          { x: 130, y: 40 },
          { x: 180, y: 70 },
          { x: 220, y: 30 },
        ].map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r="1.2"
            fill="#fff3d0"
            opacity="0.8"
          />
        ))}
      </svg>
    ),
  },
  {
    id: 2,
    photo: '/photos/memory-3.jpg',
    title: 'The Secret Garden',
    date: '15 June 2023',
    place: 'Royal Botanic Garden',
    caption: 'A midsummer afternoon hidden under wild ivy and jasmine.',
    scene: (
      <svg
        viewBox="0 0 340 230"
        className="liquid-svg"
        aria-label="Secret garden botanical illustration"
      >
        <defs>
          <radialGradient id="gardenSun" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="rgba(255, 230, 160, 0.4)" />
            <stop offset="70%" stopColor="rgba(30, 45, 25, 0.1)" />
            <stop offset="100%" stopColor="rgba(10, 15, 10, 0)" />
          </radialGradient>
        </defs>
        <rect width="340" height="230" fill="#0c140d" />
        {/* Botanical Arch */}
        <path
          d="M50 230 L50 90 Q170 20 290 90 L290 230 Z"
          fill="#132216"
          stroke="rgba(201,168,76,0.3)"
          strokeWidth="1.2"
        />
        <path
          d="M80 230 L80 110 Q170 50 260 110 L260 230 Z"
          fill="#1a2d1e"
          stroke="rgba(201,168,76,0.2)"
          strokeWidth="0.8"
        />
        <rect width="340" height="230" fill="url(#gardenSun)" />
        {/* Vines */}
        {[
          { x: 70, y: 90, r: 16 },
          { x: 110, y: 65, r: 20 },
          { x: 170, y: 50, r: 24 },
          { x: 230, y: 65, r: 20 },
          { x: 270, y: 90, r: 16 },
        ].map((v, i) => (
          <g key={i} opacity="0.6">
            <circle cx={v.x} cy={v.y} r={v.r} fill="#2f4a2d" />
            <circle cx={v.x + 8} cy={v.y + 12} r={v.r * 0.7} fill="#3d5e3a" />
          </g>
        ))}
        {/* Bench & Lantern */}
        <rect
          x="120"
          y="165"
          width="100"
          height="10"
          fill="#4a4439"
          rx="2"
          stroke="rgba(201,168,76,0.3)"
          strokeWidth="0.8"
        />
        <rect x="135" y="175" width="12" height="25" fill="#353026" />
        <rect x="193" y="175" width="12" height="25" fill="#353026" />
        <rect
          x="160"
          y="145"
          width="18"
          height="20"
          fill="#2b2318"
          stroke="#c9a84c"
          strokeWidth="1"
          rx="1"
        />
        <circle cx="169" cy="155" r="5" fill="#ffde6a" opacity="0.9" />
      </svg>
    ),
  },
  {
    id: 3,
    photo: '/photos/memory-4.jpg',
    title: 'The Question',
    date: '06 May 2024',
    place: 'Arthur’s Seat',
    caption: 'A ring beneath the constellation of our future.',
    scene: (
      <svg
        viewBox="0 0 340 230"
        className="liquid-svg"
        aria-label="The proposal under stars illustration"
      >
        <defs>
          <radialGradient id="skyCosmic" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#1c1232" />
            <stop offset="60%" stopColor="#0a0714" />
            <stop offset="100%" stopColor="#040308" />
          </radialGradient>
          <radialGradient id="diamondShine" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="rgba(147, 197, 253, 0)" />
          </radialGradient>
        </defs>
        <rect width="340" height="230" fill="url(#skyCosmic)" />
        {/* Milky Way dust cloud */}
        <path
          d="M0 40 Q170 10 340 70"
          stroke="rgba(190, 160, 240, 0.12)"
          strokeWidth="45"
          fill="none"
        />
        {/* Stars */}
        {Array.from({ length: 35 }, (_, i) => (
          <circle
            key={i}
            cx={(i * 37) % 340}
            cy={(i * 23 + 10) % 150}
            r={0.7 + (i % 3) * 0.5}
            fill="#f4e8c1"
            opacity={0.4 + (i % 5) * 0.12}
          />
        ))}
        {/* Arthur's Seat Rock Silhouette */}
        <path
          d="M0 180 Q80 130 160 145 Q240 120 340 160 L340 230 L0 230 Z"
          fill="#120c18"
        />
        {/* Ring Box */}
        <rect
          x="148"
          y="125"
          width="44"
          height="34"
          fill="#2d1c12"
          rx="3"
          stroke="#c9a84c"
          strokeWidth="1"
        />
        <ellipse
          cx="170"
          cy="140"
          rx="12"
          ry="7"
          fill="none"
          stroke="#f3dd90"
          strokeWidth="1.8"
        />
        <circle cx="170" cy="133" r="5" fill="url(#diamondShine)" />
        <circle
          cx="170"
          cy="133"
          r="16"
          fill="url(#diamondShine)"
          opacity="0.5"
        />
        {/* Figures */}
        <g transform="translate(110, 160)">
          <circle cx="0" cy="-14" r="5" fill="#f0d59e" />
          <path
            d="M-4 -8 L-5 4 L-12 12 M-4 4 L0 16"
            stroke="#f0d59e"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
        <g transform="translate(225, 152)">
          <circle cx="0" cy="-15" r="5" fill="#e8c878" />
          <path d="M-4 -9 L-5 6 L0 18 L5 6 L4 -9 Z" fill="#382a1d" />
        </g>
      </svg>
    ),
  },
  {
    id: 4,
    photo: '/photos/memory-5.jpg',
    title: 'Edinburgh at Dusk',
    date: '18 October 2025',
    place: 'The Old Town',
    caption: 'Cobblestone streets glowing under gaslight lanterns.',
    scene: (
      <svg
        viewBox="0 0 340 230"
        className="liquid-svg"
        aria-label="Edinburgh castle at dusk illustration"
      >
        <defs>
          <linearGradient id="duskAtm" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0d091a" />
            <stop offset="50%" stopColor="#25122b" />
            <stop offset="100%" stopColor="#3d1f2b" />
          </linearGradient>
        </defs>
        <rect width="340" height="230" fill="url(#duskAtm)" />
        {/* Castle */}
        <path
          d="M50 180 Q80 110 130 95 Q190 75 250 85 Q290 90 310 130 L310 190 Z"
          fill="#0f0916"
        />
        <rect
          x="145"
          y="65"
          width="60"
          height="45"
          fill="#130c1c"
          stroke="rgba(201,168,76,0.3)"
          strokeWidth="0.6"
        />
        {[
          [160, 80],
          [180, 80],
          [160, 95],
          [180, 95],
        ].map(([x, y], i) => (
          <rect
            key={i}
            x={x}
            y={y}
            width="8"
            height="9"
            fill="#ffbe42"
            rx="1"
            opacity="0.85"
          />
        ))}
        {/* Towers */}
        <polygon points="90,140 100,80 110,140" fill="#150e20" />
        <polygon points="265,145 275,85 285,145" fill="#150e20" />
        {/* Street lamps */}
        {[65, 125, 235, 290].map((x, i) => (
          <g key={i}>
            <line
              x1={x}
              y1="190"
              x2={x}
              y2="165"
              stroke="#1f1826"
              strokeWidth="2"
            />
            <circle cx={x} cy="163" r="4" fill="#ffd166" />
            <circle cx={x} cy="163" r="14" fill="#ffd166" opacity="0.25" />
          </g>
        ))}
      </svg>
    ),
  },
  {
    id: 5,
    photo: '/photos/memory-6.jpg',
    title: 'The Grand Hall',
    date: '31 October 2026',
    place: 'The Grand Hall',
    caption: 'Where all our memories converge into forever.',
    scene: (
      <svg
        viewBox="0 0 340 230"
        className="liquid-svg"
        aria-label="Grand Hall wedding venue illustration"
      >
        <defs>
          <radialGradient id="hallGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(240, 200, 110, 0.35)" />
            <stop offset="60%" stopColor="rgba(120, 80, 30, 0.12)" />
            <stop offset="100%" stopColor="rgba(10, 8, 12, 0)" />
          </radialGradient>
        </defs>
        <rect width="340" height="230" fill="#0d0a0f" />
        {/* Cathedral Arch */}
        <path
          d="M40 230 L40 90 Q170 30 300 90 L300 230 Z"
          fill="#19131d"
          stroke="rgba(201,168,76,0.3)"
          strokeWidth="1.2"
        />
        <rect width="340" height="230" fill="url(#hallGlow)" />
        {/* Pillars */}
        {[65, 120, 220, 275].map((x, i) => (
          <g key={i}>
            <rect
              x={x}
              y="70"
              width="14"
              height="160"
              fill="rgba(201,168,76,0.12)"
            />
            <rect
              x={x - 3}
              y="68"
              width="20"
              height="7"
              fill="rgba(201,168,76,0.25)"
              rx="1.5"
            />
          </g>
        ))}
        {/* Aisle & Altar */}
        <polygon
          points="140,230 160,130 180,130 200,230"
          fill="rgba(201,168,76,0.15)"
          stroke="rgba(201,168,76,0.3)"
          strokeWidth="0.8"
        />
        <ellipse
          cx="170"
          cy="130"
          rx="26"
          ry="10"
          fill="rgba(220,180,80,0.25)"
        />
        <circle
          cx="170"
          cy="115"
          r="10"
          fill="rgba(255,220,130,0.5)"
          filter="blur(4px)"
        />
        <circle cx="170" cy="115" r="3" fill="#fffbf0" />
      </svg>
    ),
  },
];

export default function MemoryGallery() {
  const sectionRef = useRef(null);
  const galleryRef = useRef(null);
  const displacementFilterRef = useRef(null);
  const turbulenceRef = useRef(null);
  const prefersReduced = useReducedMotion();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [physics, setPhysics] = useState({ dx: 0, vx: 0, distort: 0 });

  const dragRef = useRef({
    startX: 0,
    lastX: 0,
    lastTime: 0,
    vx: 0,
    dx: 0,
  });

  const goTo = useCallback(
    (targetIdx) => {
      const idx = Math.max(0, Math.min(MEMORIES.length - 1, targetIdx));
      if (idx === currentIndex) return;

      sound.playLiquidWhoosh();

      if (prefersReduced) {
        setCurrentIndex(idx);
        return;
      }

      const cards = galleryRef.current?.querySelectorAll('.liquid-card');
      if (!cards) return;

      const currentCard = cards[currentIndex];
      const nextCard = cards[idx];
      const dir = idx > currentIndex ? 1 : -1;

      gsap.set(nextCard, {
        x: dir * 100 + '%',
        opacity: 0.8,
        scale: 0.9,
        filter: 'url(#liquidDistortFilter)',
      });

      if (displacementFilterRef.current) {
        gsap.fromTo(
          displacementFilterRef.current,
          { scale: 35 },
          { scale: 0, duration: 0.7, ease: 'power2.out' }
        );
      }

      gsap.to(currentCard, {
        x: -dir * 100 + '%',
        opacity: 0,
        scale: 0.85,
        duration: 0.65,
        ease: 'power3.inOut',
      });

      gsap.to(nextCard, {
        x: '0%',
        opacity: 1,
        scale: 1,
        duration: 0.65,
        ease: 'power3.out',
        onComplete: () => {
          setCurrentIndex(idx);
          gsap.set(nextCard, { filter: 'none' });
        },
      });
    },
    [currentIndex, prefersReduced]
  );

  const handleDragStart = useCallback((e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setIsDragging(true);
    dragRef.current.startX = clientX;
    dragRef.current.lastX = clientX;
    dragRef.current.lastTime = performance.now();
    dragRef.current.vx = 0;
    dragRef.current.dx = 0;
  }, []);

  const handleDragMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const now = performance.now();
      const dt = Math.max(1, now - dragRef.current.lastTime);
      const deltaSinceLast = clientX - dragRef.current.lastX;

      const vx = deltaSinceLast / dt;
      const totalDx = clientX - dragRef.current.startX;

      dragRef.current.vx = vx;
      dragRef.current.dx = totalDx;
      dragRef.current.lastX = clientX;
      dragRef.current.lastTime = now;

      const distortScale = Math.min(
        45,
        Math.abs(vx) * 18 + Math.abs(totalDx) * 0.05
      );

      if (displacementFilterRef.current) {
        displacementFilterRef.current.setAttribute(
          'scale',
          String(distortScale)
        );
      }

      setPhysics({ dx: totalDx, vx, distort: distortScale });
    },
    [isDragging]
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const { dx, vx } = dragRef.current;
    const threshold = 60;
    const flickThreshold = 0.45;

    if (displacementFilterRef.current) {
      gsap.to(displacementFilterRef.current, {
        scale: 0,
        duration: 0.4,
        ease: 'power2.out',
      });
    }

    if (dx < -threshold || vx < -flickThreshold) {
      goTo(currentIndex + 1);
    } else if (dx > threshold || vx > flickThreshold) {
      goTo(currentIndex - 1);
    }

    setPhysics({ dx: 0, vx: 0, distort: 0 });
  }, [isDragging, currentIndex, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goTo(currentIndex - 1);
      if (e.key === 'ArrowRight') goTo(currentIndex + 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, goTo]);

  return (
    <section
      ref={sectionRef}
      className="gallery-section scene"
      aria-label="Liquid Memory Gallery — Photographic Chronicle"
    >
      {/* SVG Liquid Displacement Map Filter */}
      <svg className="filter-def-svg" aria-hidden="true">
        <defs>
          <filter
            id="liquidDistortFilter"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feTurbulence
              ref={turbulenceRef}
              type="fractalNoise"
              baseFrequency="0.035 0.055"
              numOctaves="2"
              result="noise"
            />
            <feDisplacementMap
              ref={displacementFilterRef}
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
          </filter>
        </defs>
      </svg>

      {/* Simple Editorial Section Header */}
      <header className="gallery-editorial-header" role="banner">
        <p className="gallery-edition t-ink">2021 – 2026</p>
        <h2 className="gallery-title t-display">The Pensieve</h2>
        <p className="gallery-subtitle t-ink">Six memories, siphoned into the silver pool</p>
        <span className="gold-rule" />
      </header>

      {/* The Pensieve: a stone basin holding a glowing pool of memories */}
      <div className="pensieve-basin">
        <div className="pensieve-runes" aria-hidden="true">
          <svg viewBox="0 0 200 200">
            <defs>
              <path id="runeCircle" d="M100 100 m-92 0 a92 92 0 1 1 184 0 a92 92 0 1 1 -184 0" />
            </defs>
            <text>
              <textPath href="#runeCircle" startOffset="0">
                ✦ ᚱᛖᛗᛖᛗᛒᛖᚱ ✦ THE PENSIEVE ✦ ᛗᛖᛗᛟᚱᛁᛖᛋ ✦ 2021 — 2026 ✦ ᛚᛟᚢᛖ ✦ EVELYN &amp; ADRIAN ✦
              </textPath>
            </text>
          </svg>
        </div>
      <div
        ref={galleryRef}
        className="liquid-gallery-stage"
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        role="region"
        aria-label="Liquid Memory Gallery — Drag or swipe to distort and browse"
        tabIndex={0}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {MEMORIES.map((mem, i) => {
          const isActive = i === currentIndex;
          const skewAngle =
            isActive && isDragging
              ? Math.max(-12, Math.min(12, -physics.dx * 0.05))
              : 0;
          const rotateAngle =
            isActive && isDragging
              ? Math.max(-10, Math.min(10, physics.dx * 0.04))
              : 0;
          const cardX = isActive
            ? isDragging
              ? physics.dx * 0.6
              : 0
            : i > currentIndex
            ? 100
            : -100;

          return (
            <div
              key={mem.id}
              className={`liquid-card ${
                isActive ? 'liquid-card--active' : ''
              }`}
              aria-hidden={!isActive}
              style={{
                transform: `translateX(${cardX}px) skewX(${skewAngle}deg) rotateY(${rotateAngle}deg) rotate(${[-0.8, 1.2, -1.5, 0.6, -0.4, 1.0][mem.id] || 0}deg)`,
                opacity: isActive ? 1 : 0,
                filter:
                  isActive && isDragging && physics.distort > 4
                    ? 'url(#liquidDistortFilter)'
                    : 'none',
                transition: isDragging
                  ? 'none'
                  : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.5s ease',
              }}
            >
              {/* Memory surfacing inside the Pensieve pool */}
              <div className="liquid-photo-frame">
                <div className="liquid-photo-inner">
                  <CouplePhoto
                    src={mem.photo}
                    alt={`${mem.title}, ${mem.date}`}
                    className="liquid-photo-img"
                    fallback={mem.scene}
                  />
                </div>
                <div className="liquid-grain-overlay" aria-hidden="true" />
                <div className="liquid-sheen-light" aria-hidden="true" />
              </div>
            </div>
          );
        })}
        {/* Silvery memory mist swirling over the pool surface */}
        <div className="pensieve-mist" aria-hidden="true" />
        <div className="pensieve-mist pensieve-mist--2" aria-hidden="true" />
      </div>
      </div>

      {/* Memory metadata (below the basin) */}
      {MEMORIES.filter((_, i) => i === currentIndex).map((mem) => (

              <div key={mem.id} className="liquid-card-meta" aria-live="polite">
                <div className="liquid-meta-header">
                  <span className="liquid-meta-date t-ink">{mem.date}</span>
                  <span className="liquid-meta-place t-display">
                    {mem.place}
                  </span>
                </div>
                <h3 className="liquid-meta-title t-display">{mem.title}</h3>
                <p className="liquid-meta-caption t-ink">{mem.caption}</p>

              </div>
      ))}

      {/* Constellation Progress Indicator */}
      <div
        className="liquid-progress-tracker"
        aria-label="Gallery Navigation Tracker"
      >
        <div className="tracker-line" aria-hidden="true" />
        {MEMORIES.map((m, i) => (
          <button
            key={m.id}
            className={`tracker-node ${
              i === currentIndex ? 'tracker-node--active' : ''
            }`}
            onClick={() => goTo(i)}
            aria-label={`View memory ${i + 1}: ${m.title}`}
          >
            <span className="node-glow" aria-hidden="true" />
            <span className="node-dot" aria-hidden="true" />
          </button>
        ))}
      </div>

      {/* Tactile Interaction Hint */}
      <p className="liquid-drag-hint t-handwritten" aria-hidden="true">
        {('ontouchstart' in window || navigator.maxTouchPoints > 0) ? 'swipe the pool to stir a memory' : 'drag across the pool to stir a memory'}
      </p>
    </section>
  );
}
