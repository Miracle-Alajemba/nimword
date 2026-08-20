export function measureExecutionTime(fn) {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  return { result, duration };
}
