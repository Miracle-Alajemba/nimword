export function formatPingLatency(ms = 0) {
  if (ms < 50) return { label: "Excellent", color: "#10b981" };
  if (ms < 150) return { label: "Good", color: "#f59e0b" };
  return { label: "Poor", color: "#ef4444" };
}
