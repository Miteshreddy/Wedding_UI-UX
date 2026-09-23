import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollTrigger(callback, deps = []) {
  const stRef = useRef(null);

  useEffect(() => {
    stRef.current = callback();
    return () => {
      if (stRef.current) {
        if (Array.isArray(stRef.current)) {
          stRef.current.forEach((st) => st?.kill?.());
        } else {
          stRef.current.kill?.();
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return stRef;
}
