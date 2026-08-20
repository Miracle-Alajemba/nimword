export function isElementInViewport(el) {
  if (!el || typeof window === "undefined") return false;
  const rect = el.getBoundingClientRect();
  return rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
}
