import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useCompactLayout } from '../hooks/useCompactLayout';
import { sound } from '../utils/audioSystem';
import SectionHeader from './SectionHeader';
import './MagicalMap.css';

gsap.registerPlugin(ScrollTrigger);

// High-fidelity continuous journey spline through Scotland landmarks
const MAP_PATH =
  'M 60 520 C 90 470 140 440 160 390 C 180 340 130 280 180 220 C 220 170 280 140 330 110 C 390 80 430 120 420 170 C 400 240 330 280 360 340 C 390 400 440 430 380 490 C 350 520 280 540 240 560';

// Milestone stops along the path
const MAP_STOPS = [
  {
    t: 0.12,
    date: '14.02.2021',
    place: 'St. Andrews Coast',
    note: 'Where two paths first intertwined under winter tides',
    x: 160,
    y: 390,
  },
  {
    t: 0.38,
    date: '27.08.2022',
    place: 'The Highland Mists',
    note: 'An adventure into ancient pine valleys and high peaks',
    x: 330,
    y: 110,
  },
  {
    t: 0.65,
    date: '06.05.2024',
    place: 'Arthur’s Seat',
    note: 'A quiet summit over the city, and a question asked',
    x: 360,
    y: 340,
  },
  {
    t: 0.92,
    date: '31.10.2026',
    place: 'The Grand Hall',
    note: 'Where forever begins in candlelight and joy',
    x: 240,
    y: 560,
  },
];

// Marauder's Map–style footsteps, sampled along the route so each print
// faces the direction of travel and alternates left/right of the path.
const STEP_SPACING = 15;
function buildFootsteps() {
  if (typeof document === 'undefined') return [];
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', MAP_PATH);
  const total = path.getTotalLength();
  const steps = [];
  for (let d = 6, i = 0; d < total - 2; d += STEP_SPACING, i++) {
    const p = path.getPointAtLength(d);
    const q = path.getPointAtLength(Math.min(total, d + 1));
    const ang = Math.atan2(q.y - p.y, q.x - p.x);
    const isLeft = i % 2 === 0;
    const off = isLeft ? -3.2 : 3.2;
    steps.push({
      x: p.x + Math.cos(ang + Math.PI / 2) * off,
      y: p.y + Math.sin(ang + Math.PI / 2) * off,
      // prints are drawn pointing "up" (-y); rotate to face travel direction
      rot: (ang * 180) / Math.PI + 90,
      isLeft,
      t: (d / total) * 0.92,
    });
  }
  return steps;
}

export default function MagicalMap() {
  const sectionRef = useRef(null);
  const stopsRef = useRef([]);
  const footprintsRef = useRef([]);
  const destinationFrameRef = useRef(null);
  const introRef = useRef(null);
  const prefersReduced = useReducedMotion();
  const [FOOTSTEPS] = useState(buildFootsteps);
  const compact = useCompactLayout();

  useEffect(() => {
    if (prefersReduced) {
      stopsRef.current.forEach((el) => {
        if (el) el.style.opacity = '1';
      });
      footprintsRef.current.forEach((el) => {
        if (el) el.style.opacity = '0.85';
      });
      if (destinationFrameRef.current) destinationFrameRef.current.style.opacity = '1';
      if (introRef.current) introRef.current.style.display = 'none';
      return;
    }

    const ctx = gsap.context(() => {
      // Phones: a normal section. The walk plays by itself (about 6s) once the
      // map is on screen, and the cards sit in a list below it.
      // Desktop: the scroll-driven, pinned scene.
      const tl = compact
        ? gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current.querySelector('.map-svg'),
              start: 'top 70%',
              toggleActions: 'play none none none',
            },
          })
        : gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: '+=450%',
              scrub: 1.2,
              pin: true,
              anticipatePin: 1,
            },
          });
      if (compact) tl.timeScale(0.18);

      if (introRef.current) {
        gsap.set(introRef.current, { autoAlpha: 1 });
      }

      if (introRef.current) {
        tl.to(introRef.current, { autoAlpha: 0, duration: 0.04, ease: 'none' }, 0);
      }

      // 2. Animate footsteps sequentially along the route with subtle audio
      let lastStepIndex = -1;
      FOOTSTEPS.forEach((step, i) => {
        const fp = footprintsRef.current[i];
        if (!fp) return;
        // Each print inks in, then settles to a faded trail behind the walker
        tl.fromTo(
          fp,
          { opacity: 0, scale: 0.4 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.02,
            ease: 'power2.out',
            onStart: () => {
              if (lastStepIndex !== i && i % 4 === 0) {
                sound.playFootstep();
                lastStepIndex = i;
              }
            },
          },
          step.t
        );
        tl.to(fp, { opacity: 0.45, duration: 0.06, ease: 'none' }, step.t + 0.04);
      });

      // 3. Reveal milestone markers with handwritten annotations
      MAP_STOPS.forEach((stop, i) => {
        const el = stopsRef.current[i];
        if (!el) return;
        tl.fromTo(
          el,
          { opacity: 0, scale: 0.7, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.1, ease: 'back.out(1.8)' },
          stop.t
        );
      });

      // 4. MAP -> MEMORY TRANSITION: Final destination expands into ornate photo frame
      if (destinationFrameRef.current && !compact) {
        tl.fromTo(
          destinationFrameRef.current,
          { opacity: 0, scale: 0.7, filter: 'blur(8px)' },
          {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.15,
            ease: 'power3.out',
            onStart: () => sound.playLiquidWhoosh(),
          },
          0.88
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReduced, FOOTSTEPS, compact]);

  return (
    <section
      id="map"
      ref={sectionRef}
      className={`map-section scene ${compact ? 'map-section--compact' : ''}`}
      aria-label="Hand-drawn map of their journey"
    >
      {compact ? (
        <SectionHeader
          kicker="Chapter Two"
          title="The Marauder’s Map"
          subtitle="Follow our footsteps across Scotland, from the first hello to the Great Hall."
        />
      ) : (
        <div ref={introRef} className="scene-intro scene-intro--map">
          <SectionHeader
            kicker="Chapter Two"
            title="The Marauder’s Map"
            subtitle="Follow our footsteps across Scotland, from the first hello to the Great Hall."
          />
          <span className="scene-intro-cue" aria-hidden="true">↓</span>
        </div>
      )}
      {/* Background ancient parchment texture */}
      <div className="map-parchment-bg" aria-hidden="true" />

      {/* Main Hand-Drawn SVG Fantasy Map */}
      <svg
        className="map-svg"
        viewBox="0 0 520 640"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#f3e4bd" />
            <stop offset="65%" stopColor="#e2c991" />
            <stop offset="100%" stopColor="#b08c55" />
          </radialGradient>

          <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="goldPathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c9a84c" />
            <stop offset="50%" stopColor="#f3dd90" />
            <stop offset="100%" stopColor="#e8c878" />
          </linearGradient>
        </defs>

        {/* Parchment Base Layer */}
        <rect width="520" height="640" fill="url(#mapGlow)" rx="6" />

        {/* Vintage Double Border */}
        <rect
          x="12"
          y="12"
          width="496"
          height="616"
          fill="none"
          stroke="rgba(190, 150, 70, 0.4)"
          strokeWidth="1.5"
          rx="4"
        />
        <rect
          x="18"
          y="18"
          width="484"
          height="604"
          fill="none"
          stroke="rgba(190, 150, 70, 0.2)"
          strokeWidth="0.8"
          strokeDasharray="6 4"
          rx="3"
        />

        {/* Corner Filigree Ornaments */}
        {[
          { x: 26, y: 26, r: 0 },
          { x: 494, y: 26, r: 90 },
          { x: 494, y: 614, r: 180 },
          { x: 26, y: 614, r: 270 },
        ].map((c, i) => (
          <g
            key={i}
            transform={`translate(${c.x}, ${c.y}) rotate(${c.r})`}
            opacity="0.6"
          >
            <path
              d="M0 0 L18 0 Q10 10 0 18 Z"
              fill="rgba(190, 150, 70, 0.3)"
            />
            <path
              d="M0 0 L24 0 L0 24 Z"
              fill="none"
              stroke="rgba(190, 150, 70, 0.5)"
              strokeWidth="0.8"
            />
          </g>
        ))}

        {/* Handwritten section marker — replaces cartouche */}
        <g transform="translate(260, 42)" opacity="0.75">
          <text
            x="0"
            y="4"
            textAnchor="middle"
            fontSize="13"
            fontFamily="'Dancing Script', cursive"
            fill="rgba(80, 55, 20, 0.9)"
          >
            I solemnly swear we are up to no good
          </text>
          <text
            x="0"
            y="18"
            textAnchor="middle"
            fontSize="7.5"
            fontFamily="'IM Fell English', serif"
            fontStyle="italic"
            fill="rgba(80, 55, 20, 0.7)"
          >
            Messrs. Evelyn &amp; Adrian present: The Map of Their Story
          </text>
        </g>

        {/* Illustrated Terrain Features */}
        {/* Highland Mountains */}
        <g
          stroke="rgba(180, 140, 80, 0.35)"
          strokeWidth="0.8"
          fill="rgba(35, 25, 15, 0.4)"
        >
          <path d="M40 180 L70 130 L100 180 L130 135 L160 185Z" />
          <path d="M70 130 L80 180 M130 135 L140 185" strokeWidth="0.5" />
          <path d="M220 120 L245 80 L270 120 L295 85 L320 125Z" />
          <path d="M245 80 L255 120 M295 85 L305 125" strokeWidth="0.5" />
          <text
            x="75"
            y="195"
            fontSize="7"
            fontFamily="'IM Fell English', serif"
            fontStyle="italic"
            fill="rgba(190, 150, 80, 0.5)"
          >
            The Northern Highlands
          </text>
        </g>

        {/* Enchanted Forests */}
        <g opacity="0.35">
          {[
            { x: 380, y: 90 },
            { x: 405, y: 80 },
            { x: 430, y: 95 },
            { x: 395, y: 110 },
            { x: 425, y: 115 },
            { x: 450, y: 100 },
            { x: 70, y: 310 },
            { x: 95, y: 320 },
            { x: 80, y: 340 },
          ].map((tree, i) => (
            <g key={i} transform={`translate(${tree.x}, ${tree.y})`}>
              <path
                d="M0 0 L5 12 L-5 12 Z"
                fill="#2d3d20"
                stroke="rgba(140, 160, 100, 0.4)"
                strokeWidth="0.5"
              />
              <path d="M0 -5 L4 5 L-4 5 Z" fill="#384c28" />
            </g>
          ))}
          <text
            x="420"
            y="70"
            fontSize="6.5"
            fontFamily="'IM Fell English', serif"
            fontStyle="italic"
            fill="rgba(160, 180, 120, 0.6)"
          >
            Blackwood Grove
          </text>
        </g>

        {/* Winding River */}
        <path
          d="M 10 260 C 80 250 120 310 180 300 C 240 290 290 350 350 330 C 410 310 460 370 510 360"
          stroke="rgba(90, 135, 175, 0.28)"
          strokeWidth="9"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 10 260 C 80 250 120 310 180 300 C 240 290 290 350 350 330 C 410 310 460 370 510 360"
          stroke="rgba(140, 190, 230, 0.2)"
          strokeWidth="3"
          fill="none"
          strokeDasharray="12 8"
        />
        <text
          x="260"
          y="320"
          fontSize="7"
          fontFamily="'IM Fell English', serif"
          fontStyle="italic"
          fill="rgba(120, 160, 200, 0.5)"
        >
          Firth of Forth
        </text>

        {/* Antique Compass Rose */}
        <g transform="translate(450, 560)" opacity="0.65">
          <circle
            cx="0"
            cy="0"
            r="22"
            fill="none"
            stroke="rgba(201, 168, 76, 0.4)"
            strokeWidth="0.8"
          />
          <circle
            cx="0"
            cy="0"
            r="16"
            fill="none"
            stroke="rgba(201, 168, 76, 0.2)"
            strokeWidth="0.5"
            strokeDasharray="3 3"
          />
          <polygon points="0,-20 4,-5 0,0 -4,-5" fill="#c9a84c" />
          <polygon
            points="0,20 4,5 0,0 -4,5"
            fill="rgba(201, 168, 76, 0.4)"
          />
          <polygon
            points="20,0 5,4 0,0 5,-4"
            fill="rgba(201, 168, 76, 0.4)"
          />
          <polygon
            points="-20,0 -5,4 0,0 -5,-4"
            fill="rgba(201, 168, 76, 0.4)"
          />
          <text
            x="0"
            y="-24"
            textAnchor="middle"
            fontSize="8"
            fontFamily="'Cinzel', serif"
            fill="#e8c878"
          >
            N
          </text>
        </g>

        {/* Hand-Drawn Castle & Landmark Icons */}
        <g transform="translate(145, 370)" opacity="0.7">
          <rect
            x="0"
            y="0"
            width="16"
            height="18"
            fill="#2d2215"
            stroke="rgba(201, 168, 76, 0.5)"
            strokeWidth="0.8"
          />
          <polygon points="0,0 8,-8 16,0" fill="#4a3520" />
        </g>

        <g transform="translate(315, 90)" opacity="0.7">
          <rect
            x="0"
            y="0"
            width="18"
            height="16"
            fill="#2d2215"
            stroke="rgba(201, 168, 76, 0.5)"
            strokeWidth="0.8"
          />
          <polygon points="0,0 9,-8 18,0" fill="#4a3520" />
        </g>

        <g transform="translate(225, 535)" opacity="0.85">
          <path
            d="M-15 15 L-10 0 L15 0 L20 15 Z"
            fill="#3d2d1b"
            stroke="rgba(201, 168, 76, 0.6)"
            strokeWidth="0.8"
          />
          <rect
            x="-6"
            y="-10"
            width="12"
            height="10"
            fill="#4a3722"
            stroke="rgba(201, 168, 76, 0.5)"
            strokeWidth="0.6"
          />
          <polygon points="-6,-10 0,-16 6,-10" fill="#c9a84c" />
        </g>

        {/* Animated Footprints Along Route */}
        {FOOTSTEPS.map((step, i) => (
          <g
            key={i}
            ref={(el) => (footprintsRef.current[i] = el)}
            transform={`translate(${step.x}, ${step.y}) rotate(${step.rot})`}
            opacity="0"
            className="map-footprint"
          >
            <g fill="#3a230c" transform={step.isLeft ? 'scale(-1,1)' : undefined}>
              {/* sole + heel of a small boot print */}
              <path d="M0.3 -6.2 C2.4 -6.2 2.9 -3.6 2.5 -1.6 C2.2 -0.2 1.4 0.4 0.2 0.4 C-1.2 0.4 -2 -0.6 -2 -2.2 C-2 -4.4 -1.4 -6.2 0.3 -6.2 Z" />
              <ellipse cx="0.1" cy="3.4" rx="1.7" ry="2" />
            </g>
          </g>
        ))}

        {/* Milestone Waypoint Nodes (SVG) */}
        {MAP_STOPS.map((stop, i) => (
          <g key={i} transform={`translate(${stop.x}, ${stop.y})`}>
            <circle cx="0" cy="0" r="9" fill="rgba(201, 168, 76, 0.25)" />
            <circle
              cx="0"
              cy="0"
              r="5"
              fill="#f3dd90"
              stroke="#8a6d2e"
              strokeWidth="1"
            />
            <circle cx="0" cy="0" r="2" fill="#1a1209" />
          </g>
        ))}
      </svg>

      {/* Milestone Handwritten Annotation Cards */}
      <div className="map-annotations" aria-live="polite">
        {MAP_STOPS.map((stop, i) => (
          <div
            key={i}
            ref={(el) => (stopsRef.current[i] = el)}
            className={`map-card map-card--${i} map-card--rotate-${i % 2 === 0 ? 'neg' : 'pos'}`}
            aria-label={`${stop.date} at ${stop.place}: ${stop.note}`}
          >
            <div className="map-card-header">
              <span className="map-card-date t-handwritten">{stop.date}</span>
              <span className="map-card-tag t-serif">{stop.place}</span>
            </div>
            <p className="map-card-note t-ink">"{stop.note}"</p>
          </div>
        ))}
      </div>

      {/* MAP → MEMORY TRANSITION: Destination Bloom Circle */}
      <div
        ref={destinationFrameRef}
        className="map-lead-newspaper"
        aria-live="polite"
      >
        <span className="lead-spark" aria-hidden="true">✦</span>
        <p className="lead-text t-handwritten">follow the photographs</p>
        <p className="lead-sub t-ink">their memories await…</p>
      </div>
    </section>
  );
}
