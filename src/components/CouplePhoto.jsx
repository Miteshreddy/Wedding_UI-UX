import { useState } from 'react';

// Renders a real couple photo when the file exists in /public/photos,
// otherwise renders the provided fallback (illustration).
export default function CouplePhoto({ src, alt, className = '', fallback = null }) {
  const [failed, setFailed] = useState(!src);
  if (failed) return fallback;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
