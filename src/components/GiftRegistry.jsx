import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { sound } from '../utils/audioSystem';
import './GiftRegistry.css';

gsap.registerPlugin(ScrollTrigger);

const REGISTRY_ITEMS = [
  {
    id: 0,
    icon: '✈️',
    category: 'Honeymoon Fund',
    title: 'Our First Journey Together',
    desc: 'Help us begin our adventure as newlyweds. Every contribution takes us one step further into the world.',
    link: '#honeymoon',
    cta: 'Contribute',
  },
  {
    id: 1,
    icon: '🏡',
    category: 'Home & Hearth',
    title: 'Building Our Nest',
    desc: 'From art for the walls to candles for the table — help us fill our home with warmth and wonder.',
    link: '#home',
    cta: 'View Wishlist',
  },
  {
    id: 2,
    icon: '📚',
    category: 'Library of Memories',
    title: 'Stories & Experiences',
    desc: 'Gift us an experience — a dinner, a show, a weekend away — and we will remember it always.',
    link: '#experiences',
    cta: 'Gift an Experience',
  },
];

const NOTE_TEXT = [
  'Your presence at our celebration is the greatest gift of all.',
  'If you wish to give something more, any of the options below would be treasured deeply.',
];

export default function GiftRegistry() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const [hoveredId, setHoveredId] = useState(null);
  const prefersReduced = useReducedMotion();

  // Hover tilt effect
  const handleCardHover = (el, entering) => {
    if (prefersReduced || !el) return;
    gsap.to(el, {
      scale: entering ? 1.025 : 1,
      y: entering ? -4 : 0,
      duration: 0.35,
      ease: 'power2.out',
    });
  };

  const handleCTAClick = (item) => {
    sound.playCelestialChime(528);
    // In a real app this would navigate to the registry link
    // For demo, just trigger a glow pulse on the card
    const card = cardsRef.current[item.id];
    if (card && !prefersReduced) {
      gsap.fromTo(card,
        { boxShadow: '0 0 0 rgba(201, 168, 76, 0)' },
        {
          boxShadow: '0 0 40px rgba(201, 168, 76, 0.35)',
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out',
        }
      );
    }
  };

  return (
    <section
      ref={sectionRef}
      className="registry-section scene"
      aria-label="Gift registry and wishlist"
    >
      <div className="registry-ambient" aria-hidden="true" />

      <div className="registry-content">
        {/* Header */}
        <header className="registry-header">
          <p className="registry-eyebrow t-display">Gifts & Wishes</p>
          <h2 className="registry-title t-display">Gift Registry</h2>
          <span className="gold-rule" style={{ width: '60px' }} />
        </header>

        {/* Personal note */}
        <div className="registry-note" role="note">
          <span className="note-spark t-display" aria-hidden="true">✦</span>
          <div className="note-lines">
            {NOTE_TEXT.map((line, i) => (
              <p key={i} className={`note-line t-${i === 0 ? 'serif' : 'ink'}`}>{line}</p>
            ))}
          </div>
          <span className="note-spark t-display" aria-hidden="true">✦</span>
        </div>

        {/* Registry Cards */}
        <div className="registry-grid" role="list">
          {REGISTRY_ITEMS.map((item) => (
            <div
              key={item.id}
              ref={el => (cardsRef.current[item.id] = el)}
              className={`registry-card ${hoveredId === item.id ? 'registry-card--hovered' : ''}`}
              role="listitem"
              onMouseEnter={() => { setHoveredId(item.id); handleCardHover(cardsRef.current[item.id], true); }}
              onMouseLeave={() => { setHoveredId(null); handleCardHover(cardsRef.current[item.id], false); }}
            >
              {/* Card glow */}
              <div className="registry-card-glow" aria-hidden="true" />

              {/* Corner ornaments */}
              <span className="rc-corner rc-corner--tl" aria-hidden="true" />
              <span className="rc-corner rc-corner--br" aria-hidden="true" />

              <div className="registry-card-inner">
                <div className="registry-icon-wrap" aria-hidden="true">
                  <span className="registry-icon">{item.icon}</span>
                </div>
                <p className="registry-category t-display">{item.category}</p>
                <h3 className="registry-item-title t-display">{item.title}</h3>
                <p className="registry-item-desc t-ink">{item.desc}</p>
                <button
                  className="registry-cta-btn t-display"
                  onClick={() => handleCTAClick(item)}
                  aria-label={`${item.cta} — ${item.title}`}
                >
                  {item.cta} ✦
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="registry-footer-note t-handwritten">
          with love, Evelyn & Adrian
        </p>
      </div>
    </section>
  );
}
