import { useEffect, useMemo, useRef, useState } from 'react';

interface UseInViewOptions extends IntersectionObserverInit {
  once?: boolean;
}

/**
 * Custom hook to detect when an element is visible in the viewport
 * Uses Intersection Observer API for efficient viewport detection
 */
export function useInView(options?: UseInViewOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasEnteredView, setHasEnteredView] = useState(false);

  const { once, observerOptions } = useMemo(() => {
    const { once: shouldRunOnce = true, ...rest } = options ?? {};
    return {
      once: shouldRunOnce,
      observerOptions: {
        threshold: 0.1,
        rootMargin: '100px',
        ...rest,
      } as IntersectionObserverInit,
    };
  }, [options]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        setHasEnteredView(true);
        if (once) {
          observer.unobserve(element);
        }
      } else if (!once) {
        setIsInView(false);
      }
    }, observerOptions);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [observerOptions, once]);

  return { ref, isInView, hasEnteredView };
}
