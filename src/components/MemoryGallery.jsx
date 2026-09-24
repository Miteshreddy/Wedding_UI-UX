import { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { sound } from '../utils/audioSystem';
import './MemoryGallery.css';

// Real couple photos for each memory
import coupleCandlelit from '../assets/couple_candlelit.jpg';
import coupleHighland from '../assets/couple_highland.jpg';
import coupleGarden from '../assets/couple_garden.jpg';
import coupleProposal from '../assets/couple_proposal.jpg';
import coupleEdinburgh from '../assets/couple_edinburgh.jpg';
import coupleWeddingCeremony from '../assets/couple_wedding_ceremony.jpg';

// 6 memories with real couple photographs
const MEMORIES = [
  {
    id: 0,
    title: 'A Candlelit Evening',
    date: '14 February 2021',
    place: 'St. Andrews',
    caption: 'Where two quiet paths first crossed under a winter sky.',
    photo: coupleCandlelit,
  },
  {
    id: 1,
    title: 'The Highland Trail',
    date: '27 August 2022',
    place: 'Isle of Skye',
    caption: 'Lost amidst towering mountain mists and ancient streams.',
    photo: coupleHighland,
  },
  {
    id: 2,
    title: 'The Secret Garden',
    date: '15 June 2023',
    place: 'Royal Botanic Garden',
    caption: 'A midsummer afternoon hidden under wild ivy and jasmine.',
    photo: coupleGarden,
  },
  {
    id: 3,
    title: 'The Question',
    date: '06 May 2024',
    place: "Arthur's Seat",
    caption: 'A ring beneath the constellation of our future.',
    photo: coupleProposal,
  },
  {
    id: 4,
    title: 'Edinburgh at Dusk',
    date: '18 October 2025',
    place: 'The Old Town',
    caption: 'Cobblestone streets glowing under gaslight lanterns.',
    photo: coupleEdinburgh,
  },
  {
    id: 5,
    title: 'Forever Begins',
    date: '31 October 2026',
    place: 'The Grand Hall',
    caption: 'The moment two souls became one under a canopy of stars and candlelight.',
    photo: coupleWeddingCeremony,
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

      const distortScale = Math.min(45, Math.abs(vx) * 18 + Math.abs(totalDx) * 0.05);

      if (displacementFilterRef.current) {
        displacementFilterRef.current.setAttribute('scale', String(distortScale));
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
      gsap.to(displacementFilterRef.current, { scale: 0, duration: 0.4, ease: 'power2.out' });
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

  const mem = MEMORIES[currentIndex];

  return (
    <section
      ref={sectionRef}
      className="gallery-section scene"
      aria-label="Memory Gallery — Photographic Chronicle"
    >
      {/* SVG Liquid Displacement Map Filter */}
      <svg className="filter-def-svg" aria-hidden="true">
        <defs>
          <filter id="liquidDistortFilter" x="-20%" y="-20%" width="140%" height="140%">
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

      {/* Section Header */}
      <header className="gallery-editorial-header" role="banner">
        <p className="gallery-edition t-ink">2021 – 2026</p>
        <h2 className="gallery-title t-display">Six Memories</h2>
        <span className="gold-rule" />
      </header>

      {/* Pensieve Pool wrapper */}
      <div className="pensieve-pool" aria-label="Memory pensieve basin">

        {/* ── Circular Stone Basin (photo only inside) ── */}
        <div className="pensieve-basin-outer">
          {/* Inner circle clips the photo */}
          <div className="pensieve-basin-inner">
            {/* Swipeable gallery stage — fills the circle */}
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
              aria-label="Memory Gallery — Drag or swipe to browse"
              tabIndex={0}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              {MEMORIES.map((memory, i) => {
                const isActive = i === currentIndex;
                const cardX = isActive
                  ? isDragging ? physics.dx * 0.6 : 0
                  : i > currentIndex ? '100%' : '-100%';

                return (
                  <div
                    key={memory.id}
                    className={`liquid-card ${isActive ? 'liquid-card--active' : ''}`}
                    aria-hidden={!isActive}
                    style={{
                      transform: `translateX(${typeof cardX === 'number' ? cardX + 'px' : cardX})`,
                      opacity: isActive ? 1 : 0,
                      filter:
                        isActive && isDragging && physics.distort > 4
                          ? 'url(#liquidDistortFilter)'
                          : 'none',
                      transition: isDragging
                        ? 'none'
                        : 'transform 0.55s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.45s ease',
                    }}
                  >
                    <div className="liquid-photo-frame">
                      <div className="liquid-photo-inner">
                        <img
                          src={memory.photo}
                          className="liquid-photo-img"
                          alt={`${memory.title} — ${memory.place}`}
                          draggable={false}
                        />
                      </div>
                    </div>
                    {/* Grain + sheen on top of photo */}
                    <div className="liquid-grain-overlay" aria-hidden="true" />
                    <div className="liquid-sheen-light" aria-hidden="true" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Metadata card — outside the circle, fully visible ── */}
        <div className="liquid-card-meta" aria-live="polite" aria-atomic="true">
          <div className="liquid-meta-header">
            <span className="liquid-meta-date t-ink">{mem.date}</span>
            <span className="liquid-meta-place t-display">{mem.place}</span>
          </div>
          <h3 className="liquid-meta-title t-display">{mem.title}</h3>
          <p className="liquid-meta-caption t-ink">{mem.caption}</p>
        </div>
      </div>

      {/* Constellation Progress Indicator */}
      <div className="liquid-progress-tracker" aria-label="Gallery Navigation">
        <div className="tracker-line" aria-hidden="true" />
        {MEMORIES.map((m, i) => (
          <button
            key={m.id}
            className={`tracker-node ${i === currentIndex ? 'tracker-node--active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`View memory ${i + 1}: ${m.title}`}
          >
            <span className="node-glow" aria-hidden="true" />
            <span className="node-dot" aria-hidden="true" />
          </button>
        ))}
      </div>

      {/* Tactile hint */}
      <p className="liquid-drag-hint t-handwritten" aria-hidden="true">
        {('ontouchstart' in window || navigator.maxTouchPoints > 0) ? 'swipe to explore' : 'drag to distort'}
      </p>
    </section>
  );
}
