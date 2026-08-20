import { useState, useEffect } from "react";

/**
 * Custom hook to observe container element dimensions using ResizeObserver
 * @param {React.RefObject<HTMLElement>} elementRef
 * @returns {{ width: number, height: number }}
 */
export function useElementSize(elementRef) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = elementRef?.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      if (entries && entries[0]) {
        const { width, height } = entries[0].contentRect;
        setSize({ width: Math.round(width), height: Math.round(height) });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [elementRef]);

  return size;
}

export default useElementSize;
