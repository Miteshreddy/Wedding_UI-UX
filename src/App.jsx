import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import NoiseOverlay from './components/NoiseOverlay';
import WorldCanvas from './components/WorldCanvas';
import FloatingCandles from './components/FloatingCandles';
import NavBar from './components/NavBar';
import EnvelopeIntro from './components/EnvelopeIntro';
import LoveConstellation from './components/LoveConstellation';
import MagicalMap from './components/MagicalMap';
import MemoryGallery from './components/MemoryGallery';
import TimeKeeper from './components/TimeKeeper';
import WeddingDetails from './components/WeddingDetails';
import Countdown from './components/Countdown';
import RSVP from './components/RSVP';
import FinalReveal from './components/FinalReveal';

import { sound } from './utils/audioSystem';
import './styles/index.css';

gsap.registerPlugin(ScrollTrigger);
// Mobile address-bar show/hide changes the viewport height on every scroll;
// recalculating pins then makes the page jump. Ignore those height-only resizes.
ScrollTrigger.config({ ignoreMobileResize: true });

export default function App() {
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const scrollRef = useRef(null);

  // Refresh ScrollTrigger only when the width changes (rotation, desktop resize),
  // never for the mobile address bar collapsing/expanding.
  useEffect(() => {
    let refreshTimer;
    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
    };
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize);
    return () => {
      clearTimeout(refreshTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  // Pause CSS animations (and drop layer hints) in scenes that are off screen
  useEffect(() => {
    const main = scrollRef.current;
    if (!main || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('is-offscreen', !e.isIntersecting)),
      { rootMargin: '150px 0px' }
    );
    const observeAll = () => main.querySelectorAll('section.scene').forEach((el) => io.observe(el));
    observeAll();
    const mo = new MutationObserver(observeAll);
    mo.observe(main, { childList: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  const handleEnvelopeComplete = useCallback(() => {
    setEnvelopeOpened(true);
    // Refresh ScrollTrigger so all subsequent scenes calibrate
    requestAnimationFrame(() => {
      setTimeout(() => {
        ScrollTrigger.refresh();
              }, 100);
    });
  }, []);

  // Lock body scroll while envelope is unopened
  useEffect(() => {
    if (!envelopeOpened) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = '0';
      window.scrollTo(0, 0);
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [envelopeOpened]);


  return (
    <div id="app-root">
      {/* Film grain noise overlay */}
      <NoiseOverlay />

      {/* Persistent world canvas backdrop */}
      <WorldCanvas />
      <FloatingCandles />

      {envelopeOpened && <NavBar />}

{/* Continuous Master Journey */}
      <main
        ref={scrollRef}
        className="scroll-container"
        aria-label="The Enchanted Invitation — Evelyn Ashcroft × Adrian Blackwood"
      >
        {/* Scene 1: Cinematic Interactive Envelope Opening & Invitation Parchment */}
        <EnvelopeIntro onComplete={handleEnvelopeComplete} />

        {/* Scenes 2–8: Only rendered after envelope is opened */}
        {envelopeOpened && (
          <>
            {/* Scene 2: The Love Constellation — Two orbits converging */}
            <LoveConstellation />

            {/* Scene 3: The Magical Map — Hand-drawn cartography & footsteps */}
            <MagicalMap />

            {/* Scene 4: Liquid Memory Gallery — Photographic Chronicle */}
            <MemoryGallery />

            {/* Scene 5: The TimeKeeper — Interactive antique clock */}
            <TimeKeeper />

            {/* Venue, dress code & registry */}
            <WeddingDetails />

            {/* Scene 6: Astronomical Orrery Countdown */}
            <Countdown />

            {/* Scene 7: Tactile Parchment RSVP & stamped seal */}
            <RSVP />

            {/* Scene 8: Cinematic Final Reveal */}
            <FinalReveal />
          </>
        )}
      </main>
    </div>
  );
}
