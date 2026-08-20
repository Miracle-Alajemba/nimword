import { useEffect, useRef, useState } from "react";

/**
 * useOnScreen — Intersection Observer hook to detect when an element is visible.
 * @param {{ threshold?: number, rootMargin?: string }} [options]
 * @returns {[React.RefObject<HTMLElement>, boolean]}
 */
export function useOnScreen(options = {}) {
  const ref = useRef(null);
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      { threshold: options.threshold || 0.1, rootMargin: options.rootMargin || "0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return [ref, isIntersecting];
}
