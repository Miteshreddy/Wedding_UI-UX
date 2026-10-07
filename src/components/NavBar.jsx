import { useEffect, useState, useCallback } from 'react';
import DeathlyHallows from './DeathlyHallows';
import { sound } from '../utils/audioSystem';
import { WEDDING } from '../data/weddingData';
import './NavBar.css';

export const NAV_ITEMS = [
  { id: 'story', label: 'Our Story' },
  { id: 'map', label: 'The Map' },
  { id: 'memories', label: 'Pensieve' },
  { id: 'schedule', label: 'The Day' },
  { id: 'details', label: 'Details' },
  { id: 'rsvp', label: 'RSVP' },
];

// Pinned (ScrollTrigger) sections live inside a .pin-spacer; scroll to that
// wrapper so we land at the start of the scene rather than mid-pin.
export function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const target = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el;
  const navH = document.querySelector('.site-nav')?.offsetHeight || 0;
  const top = target.getBoundingClientRect().top + window.scrollY - (target === el ? navH : 0);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
}

export default function NavBar() {
  const [muted, setMuted] = useState(sound.isMuted);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [onInvite, setOnInvite] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      // Keep the invitation screen clear: the bar slides in once you scroll on
      setOnInvite(window.scrollY < window.innerHeight * 0.55);
      const probe = window.innerHeight * 0.4;
      let current = '';
      for (const { id } of NAV_ITEMS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const box = (el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el).getBoundingClientRect();
        if (box.top <= probe && box.bottom > probe) current = id;
      }
      setActive(current);
    };
    // At most one measurement per frame, however fast scroll events arrive
    let ticking = false;
    const onScrollThrottled = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        onScroll();
      });
    };
    onScroll();
    window.addEventListener('scroll', onScrollThrottled, { passive: true });
    return () => window.removeEventListener('scroll', onScrollThrottled);
  }, []);

  // Close the mobile menu on Escape and lock background scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const go = useCallback((id) => {
    setOpen(false);
    // let the menu close (and body scroll unlock) before measuring
    requestAnimationFrame(() => scrollToSection(id));
  }, []);

  const toggleSound = () => setMuted(sound.toggleMute());

  return (
    <nav className={`site-nav ${scrolled ? 'site-nav--solid' : ''} ${open ? 'site-nav--open' : ''} ${onInvite && !open ? 'site-nav--hidden' : ''}`} aria-label="Main">
      <button className="nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
        <DeathlyHallows size={22} strokeWidth={4} />
        <span className="nav-monogram t-display">
          {WEDDING.couple.person1[0]}
          <span aria-hidden="true"> & </span>
          {WEDDING.couple.person2[0]}
        </span>
      </button>

      <ul id="nav-menu" className="nav-links">
        {NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`nav-link t-display ${active === item.id ? 'nav-link--active' : ''} ${item.id === 'rsvp' ? 'nav-link--cta' : ''}`}
              aria-current={active === item.id ? 'true' : undefined}
              onClick={(e) => {
                e.preventDefault();
                go(item.id);
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="nav-actions">
        <button
          className="nav-icon-btn"
          onClick={toggleSound}
          aria-pressed={!muted}
          aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
          title={muted ? 'Sound off' : 'Sound on'}
        >
          {muted ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M17 9l5 6M22 9l-5 6" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12" /></svg>
          )}
        </button>
        <button
          className="nav-icon-btn nav-burger"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="nav-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
