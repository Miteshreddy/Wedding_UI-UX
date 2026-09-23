import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../hooks/useReducedMotion';
import './DressCode.css';

gsap.registerPlugin(ScrollTrigger);

const PALETTE = [
  { name: 'Midnight Noir', hex: '#0d0a14', note: 'Gentlemen\'s suits & formal wear' },
  { name: 'Deep Burgundy', hex: '#5c1a1a', note: 'Evening gowns & shawls' },
  { name: 'Forest Shadow', hex: '#1a2d1e', note: 'Velvet jackets & waistcoats' },
  { name: 'Antique Gold', hex: '#c9a84c', note: 'Accessories & accents' },
  { name: 'Dusty Plum', hex: '#4a2060', note: 'Dresses & separates' },
  { name: 'Ivory Parchment', hex: '#f4e8c1', note: 'Blouses & light layers' },
];

const RULES = [
  { icon: '✦', title: 'Black Tie Optional', desc: 'Tuxedos, dark suits, evening gowns, and formal cocktail attire are all welcome.' },
  { icon: '◈', title: 'Enchanted Palette', desc: 'Deep jewel tones, midnight blacks, and warm golds — dress like you\'re stepping into a fairy tale.' },
  { icon: '◆', title: 'Please Avoid', desc: 'White, ivory, or champagne (reserved for the bride). Casual or overly bright colours.' },
  { icon: '◉', title: 'Accessories', desc: 'Elaborate headpieces, capes, cloaks, and vintage-inspired jewellery are thoroughly encouraged.' },
];

export default function DressCode() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const swatchesRef = useRef([]);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) {
      cardsRef.current.forEach(el => { if (el) el.style.opacity = '1'; });
      swatchesRef.current.forEach(el => { if (el) el.style.opacity = '1'; });
      return;
    }

    const ctx = gsap.context(() => {
      cardsRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(el,
          { opacity: 0, y: 30, filter: 'blur(5px)' },
          {
            opacity: 1, y: 0, filter: 'blur(0px)',
            duration: 0.65,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      });

      swatchesRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(el,
          { opacity: 0, scale: 0.7 },
          {
            opacity: 1, scale: 1,
            duration: 0.5,
            delay: i * 0.06,
            ease: 'back.out(1.8)',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
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
      className="dress-section scene"
      aria-label="Dress code and attire guide"
    >
      <div className="dress-ambient" aria-hidden="true" />

      <div className="dress-content">
        {/* Header */}
        <header className="dress-header">
          <p className="dress-eyebrow t-display">Attire & Elegance</p>
          <h2 className="dress-title t-display">Dress Code</h2>
          <span className="gold-rule" style={{ width: '60px' }} />
          <p className="dress-subtitle t-ink">
            Come dressed as though the evening is enchanted — because it is.
          </p>
        </header>

        {/* Rules Cards */}
        <div className="dress-rules-grid" role="list">
          {RULES.map((rule, i) => (
            <div
              key={i}
              ref={el => (cardsRef.current[i] = el)}
              className="dress-rule-card"
              role="listitem"
            >
              <span className="rule-icon t-display" aria-hidden="true">{rule.icon}</span>
              <div className="rule-text">
                <h3 className="rule-title t-display">{rule.title}</h3>
                <p className="rule-desc t-ink">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Colour Palette */}
        <div className="dress-palette-block">
          <p className="palette-heading t-display">Suggested Colour Palette</p>
          <div className="palette-swatches" role="list" aria-label="Dress code colour palette">
            {PALETTE.map((swatch, i) => (
              <div
                key={i}
                ref={el => (swatchesRef.current[i] = el)}
                className="palette-swatch"
                role="listitem"
                aria-label={`${swatch.name}: ${swatch.note}`}
              >
                <div
                  className="swatch-color"
                  style={{ background: swatch.hex }}
                  aria-hidden="true"
                />
                <span className="swatch-name t-display">{swatch.name}</span>
                <span className="swatch-note t-ink">{swatch.note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom flourish quote */}
        <p className="dress-quote t-handwritten">
          "Dress for the magic of the evening, and for the photographs that last forever."
        </p>
      </div>
    </section>
  );
}
