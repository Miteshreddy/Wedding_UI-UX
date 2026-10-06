// Deathly Hallows motif: triangle (cloak), circle (stone), vertical line (wand).
export default function DeathlyHallows({ className = '', size = 120, strokeWidth = 1.6, color = 'currentColor', title }) {
  return (
    <svg
      className={`deathly-hallows ${className}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
      aria-label={title}
    >
      <path className="dh-cloak" d="M50 6 L94 84 L6 84 Z" pathLength="1" />
      <circle className="dh-stone" cx="50" cy="58.7" r="25.3" pathLength="1" />
      <path className="dh-wand" d="M50 6 L50 84" pathLength="1" />
    </svg>
  );
}
