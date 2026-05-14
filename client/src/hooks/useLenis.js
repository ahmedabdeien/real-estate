import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

let lenisInstance = null;

export function useLenis() {
  useEffect(() => {
    // Prevent duplicate instances (HMR)
    if (lenisInstance) {
      lenisInstance.destroy();
      lenisInstance = null;
    }

    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      if (lenisInstance) {
        lenisInstance.destroy();
        lenisInstance = null;
      }
    };
  }, []);
}
