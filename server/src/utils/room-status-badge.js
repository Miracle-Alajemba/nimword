export function getRoomStatusBadge(room) {
  if (room?.settled) return { label: "Completed", color: "#64748b" };
  if (room?.cancelled) return { label: "Cancelled", color: "#ef4444" };
  if (room?.playerCount >= 4) return { label: "Full", color: "#f59e0b" };
  return { label: "Open", color: "#10b981" };
}
