export function throttleRaf(fn) {
  let queued = false;
  return (...args) => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(() => {
        fn(...args);
        queued = false;
      });
    }
  };
}
