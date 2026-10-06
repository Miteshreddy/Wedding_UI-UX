import { useEffect, useState } from 'react';

// Phones (and phones held sideways) get simple, flowing layouts instead of the
// scroll-locked cinematic scenes, which don't place reliably on mobile browsers.
const QUERY = '(max-width: 767px), (max-height: 500px)';

export function useCompactLayout() {
  const [compact, setCompact] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = (e) => setCompact(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return compact;
}
