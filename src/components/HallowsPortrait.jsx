import DeathlyHallows from './DeathlyHallows';
import CouplePhoto from './CouplePhoto';
import { WEDDING } from '../data/weddingData';
import './HallowsPortrait.css';

// The couple's photo set inside the Resurrection Stone circle of the Deathly Hallows.
export default function HallowsPortrait({ className = '', src = '/photos/couple.jpg' }) {
  const { person1, person2 } = WEDDING.couple;
  return (
    <div className={`hallows-portrait ${className}`}>
      <CouplePhoto
        src={src}
        alt={`${person1} and ${person2}`}
        className="hp-photo"
        fallback={<span className="hp-photo hp-photo--empty" aria-hidden="true" />}
      />
      <DeathlyHallows className="hp-symbol" size="100%" strokeWidth={1.1} />
    </div>
  );
}
