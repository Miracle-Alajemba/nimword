/**
 * Time and Countdown Formatting Utility
 */

/**
 * Formats seconds into MM:SS display string (e.g. 125 -> "02:05").
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatCountdownTime(totalSeconds = 0) {
  const sec = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const mins = Math.floor(sec / 60);
  const remSec = sec % 60;
  return `${String(mins).padStart(2, "0")}:${String(remSec).padStart(2, "0")}`;
}

/**
 * Returns formatted relative time string (e.g. "2 mins ago").
 * @param {string|Date|number} timestamp
 * @returns {string}
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return "just now";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "just now";

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 10) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMins = Math.floor(diffSec / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
