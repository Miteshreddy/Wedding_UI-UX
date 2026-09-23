import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { WEDDING } from '../data/weddingData';
import './WeddingDetails.css';

gsap.registerPlugin(ScrollTrigger);

const SCHEDULE = WEDDING.schedule;

export default function WeddingDetails() {
  const sectionRef = useRef(null);
  const timelineRef = useRef(null);
  const itemsRef = useRef([]);
  const lineRef = useRef(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) {
      itemsRef.current.forEach(el => { if (el) el.style.opacity = '1'; });
      if (lineRef.current) lineRef.current.style.transform = 'scaleY(1)';
      return;
    }

    const ctx = gsap.context(() => {
      // Animate the vertical spine line
      if (lineRef.current) {
        gsap.fromTo(lineRef.current,
          { scaleY: 0, transformOrigin: 'top center' },
          {
            scaleY: 1,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              end: 'center center',
              scrub: 0.8,
            }
          }
        );
      }

      // Animate each schedule item
      itemsRef.current.forEach((el, i) => {
        if (!el) return;
        const dir = i % 2 === 0 ? -1 : 1;
        gsap.fromTo(el,
          { opacity: 0, x: dir * 40, filter: 'blur(6px)' },
          {
            opacity: 1,
            x: 0,
            filter: 'blur(0px)',
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
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
      className="details-section scene"
      aria-label="Wedding day details and programme"
    >
      {/* Background atmosphere */}
      <div className="details-ambient" aria-hidden="true" />

      <div className="details-content">
        {/* Section Header */}
        <header className="details-header">
          <p className="details-eyebrow t-display">31 · October · 2026</p>
          <h2 className="details-title t-display">The Programme</h2>
          <span className="gold-rule" style={{ width: '60px' }} />
          <p className="details-subtitle t-ink">
            An evening of ceremony, celebration, and wonder
          </p>
        </header>

        {/* Timeline */}
        <div className="details-timeline" ref={timelineRef} aria-label="Wedding day schedule">
          {/* Spine line */}
          <div className="timeline-spine" ref={lineRef} aria-hidden="true" />

          {SCHEDULE.map((item, i) => (
            <div
              key={i}
              ref={el => (itemsRef.current[i] = el)}
              className={`timeline-item timeline-item--${i % 2 === 0 ? 'left' : 'right'}`}
              aria-label={`${item.time}: ${item.label} — ${item.description}`}
            >
              {/* Node on spine */}
              <div className="timeline-node" aria-hidden="true">
                <span className="node-icon t-display">{item.icon}</span>
                <div className="node-ring" />
              </div>

              {/* Card */}
              <div className="timeline-card">
                <div className="timeline-card-inner">
                  <span className="timeline-time t-display">{item.time}</span>
                  <h3 className="timeline-label t-display">{item.label}</h3>
                  <p className="timeline-desc t-ink">{item.description}</p>
                </div>
                {/* Corner ornaments */}
                <span className="tc-corner tc-corner--tl" aria-hidden="true" />
                <span className="tc-corner tc-corner--br" aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>

        {/* Venue Info Strip */}
        <div className="details-venue-strip">
          <span className="gold-rule" style={{ width: '40px' }} />
          <div className="venue-strip-text">
            <span className="venue-strip-name t-display">{WEDDING.venue.name}</span>
            <span className="venue-strip-sep t-ink"> · </span>
            <span className="venue-strip-city t-serif">{WEDDING.venue.city}, Scotland</span>
          </div>
          <span className="gold-rule" style={{ width: '40px' }} />
        </div>
      </div>
    </section>
  );
}
