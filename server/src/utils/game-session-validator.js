export function isSessionActive(session) {
  if (!session) return false;
  return session.status === "active" && !session.endedAt;
}
