import './FloatingCandles.css';

// Great Hall floating candles: a fixed, decorative layer behind every section.
const CANDLES = [
  { x: 4, y: 16, s: 1.0, d: 0.0 }, { x: 12, y: 36, s: 0.7, d: 1.6 }, { x: 20, y: 10, s: 0.85, d: 3.1 },
  { x: 80, y: 9, s: 1.0, d: 0.4 }, { x: 89, y: 30, s: 0.75, d: 2.9 }, { x: 96, y: 14, s: 0.6, d: 1.2 },
  { x: 6, y: 66, s: 0.6, d: 2.0 }, { x: 94, y: 62, s: 0.6, d: 0.6 },
  { x: 28, y: 22, s: 0.55, d: 0.8 }, { x: 72, y: 24, s: 0.55, d: 2.3 },
];

export default function FloatingCandles() {
  return (
    <div className="floating-candles" aria-hidden="true">
      {CANDLES.map((c, i) => (
        <span
          key={i}
          className={`fc-candle ${i > 7 ? 'fc-candle--wide' : ''}`}
          style={{ left: `${c.x}%`, top: `${c.y}%`, '--s': c.s, animationDelay: `-${c.d}s` }}
        >
          <span className="fc-flame" style={{ animationDelay: `-${c.d * 0.7}s` }} />
          <span className="fc-wax" />
        </span>
      ))}
    </div>
  );
}
