import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import NoiseOverlay from './components/NoiseOverlay';
import WorldCanvas from './components/WorldCanvas';
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

export default function App() {
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef(null);
  const rafRef = useRef(null);

  // Track scroll progress for WorldCanvas (0..1 across the full page)
  const updateScrollProgress = useCallback(() => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (docH <= 0) return;
    const prog = Math.min(1, Math.max(0, window.scrollY / docH));
    setScrollProgress(prog);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateScrollProgress);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateScrollProgress();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateScrollProgress]);

  // Refresh ScrollTrigger on resize / orientation change / mobile viewport changes
  useEffect(() => {
    let refreshTimer;
    const debouncedRefresh = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        ScrollTrigger.refresh();
        updateScrollProgress();
      }, 200);
    };

    window.addEventListener('resize', debouncedRefresh, { passive: true });
    window.addEventListener('orientationchange', debouncedRefresh);

    // Handle mobile browser UI changes (address bar show/hide)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', debouncedRefresh);
    }

    return () => {
      clearTimeout(refreshTimer);
      window.removeEventListener('resize', debouncedRefresh);
      window.removeEventListener('orientationchange', debouncedRefresh);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', debouncedRefresh);
      }
    };
  }, [updateScrollProgress]);

  const handleEnvelopeComplete = useCallback(() => {
    setEnvelopeOpened(true);
    // Refresh ScrollTrigger so all subsequent scenes calibrate
    requestAnimationFrame(() => {
      setTimeout(() => {
        ScrollTrigger.refresh();
        updateScrollProgress();
      }, 100);
    });
  }, [updateScrollProgress]);

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
      <WorldCanvas scrollProgress={scrollProgress} />

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
