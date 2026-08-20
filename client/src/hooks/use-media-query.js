import { useState, useEffect } from "react";

/**
 * useMediaQuery — React hook that tracks a CSS media query match state.
 * @param {string} query - CSS media query string, e.g. "(max-width: 768px)"
 * @returns {boolean} Whether the media query currently matches.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);

    mql.addEventListener("change", handler);
    setMatches(mql.matches);

    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
