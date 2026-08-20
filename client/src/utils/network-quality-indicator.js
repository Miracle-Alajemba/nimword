export function getPingQualityBadge(pingMs = 0) {
  if (pingMs <= 60) return { status: "Excellent", color: "#10b981" };
  if (pingMs <= 150) return { status: "Good", color: "#f59e0b" };
  return { status: "Laggy", color: "#ef4444" };
}
