import { WEDDING } from '../data/weddingData';
import DeathlyHallows from './DeathlyHallows';
import './WeddingDetails.css';

export default function WeddingDetails() {
  const { venue, dressCode, registry } = WEDDING.details;

  return (
    <section className="details-section scene" aria-labelledby="details-title">
      <header className="details-header">
        <DeathlyHallows size={34} strokeWidth={2.4} className="details-sigil" />
        <h2 id="details-title" className="details-title t-display">The Particulars</h2>
        <p className="details-sub t-ink">Everything a guest needs to know before stepping through the portal</p>
      </header>

      <div className="details-grid">
        <article className="details-card">
          <figure className="details-photo">
            <img src={venue.photo} alt={`${venue.name} interior`} loading="lazy" decoding="async" />
            <figcaption>
              <a href={venue.photoCredit.url} target="_blank" rel="noopener noreferrer">Photo: {venue.photoCredit.text}</a>
            </figcaption>
          </figure>
          <h3 className="details-card-title t-display">The Venue</h3>
          <p className="details-lead t-serif">{venue.name}</p>
          <p className="details-text t-ink">{venue.address}</p>
          <ul className="details-list t-serif">
            {venue.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <a className="details-link t-display" href={venue.mapUrl} target="_blank" rel="noopener noreferrer">
            Open the map
          </a>
        </article>

        <article className="details-card">
          <span className="details-icon" aria-hidden="true">✧</span>
          <h3 className="details-card-title t-display">Dress Code</h3>
          <p className="details-lead t-serif">{dressCode.title}</p>
          <p className="details-text t-ink">{dressCode.description}</p>
          <ul className="details-houses" aria-label="House colours">
            {dressCode.houses.map((h) => (
              <li key={h.name}>
                <span
                  className="house-swatch"
                  style={{ background: `linear-gradient(135deg, ${h.colors[0]} 50%, ${h.colors[1]} 50%)` }}
                  aria-hidden="true"
                />
                <span className="t-serif">{h.name}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="details-card">
          <span className="details-icon" aria-hidden="true">⚿</span>
          <h3 className="details-card-title t-display">Registry</h3>
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
      </div>
    </section>
  );
}
