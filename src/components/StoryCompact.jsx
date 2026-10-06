import { useEffect, useRef } from 'react';
import { MILESTONES } from './LoveConstellation';
import SectionHeader from './SectionHeader';
import DeathlyHallows from './DeathlyHallows';
import CouplePhoto from './CouplePhoto';
import { WEDDING } from '../data/weddingData';
import './StoryCompact.css';

// Phone version of "Written in the Stars": no scroll-locking, nothing floating
// over anything else. Each moment fades in when it reaches the screen.
export default function StoryCompact() {
  const listRef = useRef(null);

  useEffect(() => {
    const items = listRef.current?.querySelectorAll('.sc-item, .sc-portrait');
    if (!items?.length) return;
    if (typeof IntersectionObserver === 'undefined') {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }),
      { rootMargin: '0px 0px -12% 0px' }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const { person1, person2 } = WEDDING.couple;

  return (
    <section id="story" className="story-compact scene" aria-label="Our story">
      <SectionHeader
        kicker="Chapter One"
        title="Written in the Stars"
        subtitle="Two stars, two paths, one sky."
      />

      <div ref={listRef} className="sc-body">
        <ol className="sc-timeline">
          {MILESTONES.slice(0, 3).map((m) => (
            <li key={m.id} className="sc-item">
              <span className="sc-star" aria-hidden="true" />
              <article className="sc-card">
                <p className="sc-date t-display">{m.storyDate}</p>
                <h3 className="sc-title t-display">{m.title}</h3>
                <p className="sc-sub t-serif">{m.sub}</p>
                <p className="sc-lines t-ink">{m.storyLines.join(' ')}</p>
              </article>
            </li>
          ))}
        </ol>

        <figure className="sc-portrait">
          <div className="sc-portrait-frame">
            <DeathlyHallows className="sc-hallows" size="100%" strokeWidth={0.9} />
            <CouplePhoto
              src="/photos/couple.jpg"
              alt={`${person1} and ${person2}`}
              className="sc-photo"
              fallback={<span className="sc-photo sc-photo--empty" aria-hidden="true" />}
            />
          </div>
          <figcaption>
            <p className="sc-date t-display">{MILESTONES[3].storyDate}</p>
            <h3 className="sc-forever t-display">Two Worlds Entwined</h3>
            <p className="sc-lines t-ink">{MILESTONES[3].storyLines.join(' ')}</p>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
