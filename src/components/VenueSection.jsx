import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../hooks/useReducedMotion';
import './VenueSection.css';

gsap.registerPlugin(ScrollTrigger);

const VENUE_DETAILS = [
  { icon: '◆', label: 'Venue', value: 'The Grand Hall' },
  { icon: '◈', label: 'City', value: 'Edinburgh, Scotland' },
  { icon: '✦', label: 'Date', value: '31st October 2026' },
  { icon: '◉', label: 'Ceremony', value: '4:00 PM — Begin' },
];

const DIRECTIONS = [
  { mode: '🚂', label: 'Train', info: 'Edinburgh Waverley → 12 min walk' },
  { mode: '🚗', label: 'Drive', info: 'Parking available on Royal Mile' },
  { mode: '✈️', label: 'Fly', info: 'Edinburgh Airport → 25 min by taxi' },
];

export default function VenueSection() {
  const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const mapRef = useRef(null);
  const detailsRef = useRef([]);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) {
      if (cardRef.current) cardRef.current.style.opacity = '1';
      detailsRef.current.forEach(el => { if (el) el.style.opacity = '1'; });
      return;
    }

    const ctx = gsap.context(() => {
      if (cardRef.current) {
        gsap.fromTo(cardRef.current,
          { opacity: 0, y: 50, scale: 0.96 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      }

      detailsRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(el,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0,
            duration: 0.5,
            delay: i * 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReduced]);

  return (
    <section
      ref={sectionRef}
      className="venue-section scene"
      aria-label="Venue information and directions"
    >
      <div className="venue-ambient" aria-hidden="true" />

      <div className="venue-content">
        {/* Header */}
        <header className="venue-header">
          <p className="venue-eyebrow t-display">Where Forever Begins</p>
          <h2 className="venue-title t-display">The Venue</h2>
          <span className="gold-rule" style={{ width: '60px' }} />
        </header>

        {/* Main Card */}
        <div ref={cardRef} className="venue-card">
          {/* Corner ornaments */}
          <div className="vc-corner vc-corner--tl" aria-hidden="true" />
          <div className="vc-corner vc-corner--tr" aria-hidden="true" />
          <div className="vc-corner vc-corner--bl" aria-hidden="true" />
          <div className="vc-corner vc-corner--br" aria-hidden="true" />

          {/* Illustrated Map / Venue Drawing */}
          <div className="venue-map-panel" ref={mapRef} aria-label="Illustrated venue map">
            <svg viewBox="0 0 400 240" className="venue-map-svg" aria-hidden="true">
              <defs>
                <radialGradient id="mapBg" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="#1a1208" />
                  <stop offset="100%" stopColor="#08060a" />
                </radialGradient>
                <filter id="mapGlow2">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* Parchment base */}
              <rect width="400" height="240" fill="url(#mapBg)" />
              <rect width="400" height="240" fill="rgba(200,170,100,0.04)" />

              {/* Grid lines (old-map style) */}
              {[60, 120, 180, 240, 300, 360].map((x, i) => (
                <line key={`v${i}`} x1={x} y1="0" x2={x} y2="240" stroke="rgba(180,150,80,0.06)" strokeWidth="0.5" />
              ))}
              {[40, 80, 120, 160, 200].map((y, i) => (
                <line key={`h${i}`} x1="0" y1={y} x2="400" y2={y} stroke="rgba(180,150,80,0.06)" strokeWidth="0.5" />
              ))}

              {/* Streets */}
              {/* Royal Mile */}
              <path d="M 20 140 L 380 130" stroke="rgba(180,150,80,0.35)" strokeWidth="5" strokeLinecap="round" />
              <text x="50" y="128" fontSize="6" fontFamily="'Dancing Script',cursive" fill="rgba(180,150,80,0.7)">Royal Mile</text>

              {/* North Bridge */}
              <path d="M 270 20 L 290 240" stroke="rgba(180,150,80,0.25)" strokeWidth="4" strokeLinecap="round" />
              <text x="295" y="120" fontSize="6" fontFamily="'Dancing Script',cursive" fill="rgba(180,150,80,0.6)" transform="rotate(90, 295, 120)">North Bridge</text>

              {/* Princes St */}
              <path d="M 20 80 L 380 72" stroke="rgba(180,150,80,0.2)" strokeWidth="3" strokeLinecap="round" />
              <text x="50" y="68" fontSize="5.5" fontFamily="'Dancing Script',cursive" fill="rgba(180,150,80,0.55)">Princes Street</text>

              {/* The Grand Hall building */}
              <g transform="translate(165, 108)" filter="url(#mapGlow2)">
                {/* Building footprint */}
                <rect x="-25" y="-22" width="50" height="40" fill="rgba(201,168,76,0.18)" stroke="rgba(201,168,76,0.6)" strokeWidth="1.2" rx="2" />
                {/* Entrance steps */}
                <rect x="-12" y="16" width="24" height="6" fill="rgba(201,168,76,0.12)" stroke="rgba(201,168,76,0.4)" strokeWidth="0.8" />
                {/* Columns */}
                {[-16, -8, 0, 8, 16].map((x, i) => (
                  <rect key={i} x={x - 1} y="-20" width="2" height="36" fill="rgba(201,168,76,0.25)" />
                ))}
                {/* Roof/pediment */}
                <polygon points="0,-30 30,-22 -30,-22" fill="rgba(201,168,76,0.2)" stroke="rgba(201,168,76,0.5)" strokeWidth="1" />
                {/* Star marker */}
                <circle cx="0" cy="-4" r="5" fill="rgba(201,168,76,0.5)" />
                <circle cx="0" cy="-4" r="2.5" fill="#f0d588" />
              </g>

              {/* Label */}
              <text x="200" y="170" textAnchor="middle" fontSize="7.5" fontFamily="'Cinzel',serif" fill="rgba(201,168,76,0.9)" letterSpacing="1">THE GRAND HALL</text>
              <text x="200" y="180" textAnchor="middle" fontSize="5.5" fontFamily="'Dancing Script',cursive" fill="rgba(200,170,100,0.55)">Edinburgh, Scotland</text>

              {/* Compass rose */}
              <g transform="translate(365, 30)" opacity="0.65">
                <circle cx="0" cy="0" r="14" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="0.6" />
                <polygon points="0,-12 2.5,-3 0,0 -2.5,-3" fill="#c9a84c" />
                <polygon points="0,12 2.5,3 0,0 -2.5,3" fill="rgba(201,168,76,0.35)" />
                <polygon points="12,0 3,2.5 0,0 3,-2.5" fill="rgba(201,168,76,0.35)" />
                <polygon points="-12,0 -3,2.5 0,0 -3,-2.5" fill="rgba(201,168,76,0.35)" />
                <text x="0" y="-15" textAnchor="middle" fontSize="6" fontFamily="'Cinzel',serif" fill="#e8c878">N</text>
              </g>

              {/* Decorative border */}
              <rect x="4" y="4" width="392" height="232" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="0.8" strokeDasharray="6 4" />
            </svg>
          </div>

          {/* Details Panel */}
          <div className="venue-details-panel">
            <div className="venue-name-block">
              <h3 className="venue-name t-display">The Grand Hall</h3>
              <p className="venue-address t-ink">Parliament Square, Edinburgh<br />Old Town, EH1 1RF</p>
            </div>

            <div className="venue-info-grid">
              {VENUE_DETAILS.map((d, i) => (
                <div
                  key={i}
                  ref={el => (detailsRef.current[i] = el)}
                  className="venue-info-item"
                >
                  <span className="vi-icon t-display" aria-hidden="true">{d.icon}</span>
                  <div className="vi-text">
                    <span className="vi-label t-display">{d.label}</span>
                    <span className="vi-value t-serif">{d.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="venue-divider">
              <span className="gold-rule" style={{ width: '30px' }} />
              <span className="t-display" style={{ color: 'var(--gold)', fontSize: '0.65rem', letterSpacing: '0.15em' }}>GETTING THERE</span>
              <span className="gold-rule" style={{ width: '30px' }} />
            </div>

            {/* Directions */}
            <div className="venue-directions">
              {DIRECTIONS.map((dir, i) => (
                <div key={i} className="direction-item">
                  <span className="dir-mode" aria-hidden="true">{dir.mode}</span>
                  <div className="dir-text">
                    <span className="dir-label t-display">{dir.label}</span>
                    <span className="dir-info t-ink">{dir.info}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Atmospheric quote */}
        <p className="venue-quote t-handwritten" aria-label="Venue atmospheric quote">
          "A hall of history, dressed for one extraordinary night"
        </p>
      </div>
    </section>
  );
}
