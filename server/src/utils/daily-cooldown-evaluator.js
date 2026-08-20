export function getRemainingCooldownSeconds(nextAvailableIso) {
  if (!nextAvailableIso) return 0;
  const diffMs = new Date(nextAvailableIso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / 1000));
}
