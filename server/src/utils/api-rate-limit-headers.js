export function buildRateLimitHeaders(limit = 100, remaining = 99, resetSeconds = 60) {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(resetSeconds),
  };
}
