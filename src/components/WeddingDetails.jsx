import { WEDDING } from '../data/weddingData';
import SectionHeader from './SectionHeader';
import './WeddingDetails.css';

// Venue: one real photo, the essentials, and a clear "Get Directions" button
export function Venue() {
  const { venue } = WEDDING.details;
  return (
    <section id="venue" className="details-section venue-section scene" aria-labelledby="venue-title">
      <SectionHeader id="venue-title" kicker="The venue" title={venue.name} subtitle={venue.address} />
      <article className="venue-card">
        <figure className="venue-photo">
          <img src={venue.photo} alt={`${venue.name}, interior`} loading="lazy" decoding="async" />
          <figcaption>
            <a href={venue.photoCredit.url} target="_blank" rel="noopener noreferrer">Photo: {venue.photoCredit.text}</a>
          </figcaption>
        </figure>
        <div className="venue-body">
          <ul className="details-list t-serif">
            {venue.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <a className="venue-directions t-display" href={venue.mapUrl} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
              <circle cx="12" cy="9.5" r="2.5" />
            </svg>
            Get Directions
          </a>
        </div>
      </article>
    </section>
  );
}

export function DressCode() {
  const { dressCode } = WEDDING.details;
  return (
    <section id="dress-code" className="details-section details-section--tight scene" aria-labelledby="dress-title">
      <SectionHeader id="dress-title" kicker="What to wear" title="Dress Code" />
      <article className="details-card details-card--wide">
        <p className="details-lead t-serif">{dressCode.title}</p>
        <p className="details-text t-ink">{dressCode.description}</p>
        <ul className="details-houses" aria-label="House colours">
          {dressCode.houses.map((h) => (
            <li key={h.name}>
              <span className="house-swatch" style={{ background: `linear-gradient(135deg, ${h.colors[0]} 50%, ${h.colors[1]} 50%)` }} aria-hidden="true" />
              <span className="t-serif">{h.name}</span>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}

export function Registry() {
  const { registry } = WEDDING.details;
  return (
    <section id="registry" className="details-section details-section--tight scene" aria-labelledby="registry-title">
      <SectionHeader id="registry-title" kicker="Gifts" title="Registry" />
      <article className="details-card details-card--wide">
        <p className="details-lead t-serif">{registry.title}</p>
        <p className="details-text t-ink">{registry.description}</p>
        <div className="details-actions">
          {registry.links.map((l) => (
            <a key={l.label} className="details-link t-display" href={l.url}>
              {l.label}
            </a>
          ))}
        </div>
      </article>
    </section>
  );
}

export default Venue;
