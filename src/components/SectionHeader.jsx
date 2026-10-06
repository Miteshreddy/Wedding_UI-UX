import DeathlyHallows from './DeathlyHallows';

// Shared heading used by every content section so the site reads as one book.
export default function SectionHeader({ kicker, title, subtitle, id, className = '' }) {
  return (
    <header className={`section-header ${className}`}>
      {kicker && <p className="section-kicker t-display">{kicker}</p>}
      <h2 id={id} className="section-title t-display">{title}</h2>
      <div className="section-divider" aria-hidden="true">
        <span className="section-divider-line" />
        <DeathlyHallows size={22} strokeWidth={3} />
        <span className="section-divider-line" />
      </div>
      {subtitle && <p className="section-subtitle t-ink">{subtitle}</p>}
    </header>
  );
}
