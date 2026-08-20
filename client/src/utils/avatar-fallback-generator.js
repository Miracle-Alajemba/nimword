export function getAvatarColor(name = "Player") {
  const colors = ["#63f4ca", "#6366f1", "#ec4899", "#f59e0b", "#10b981"];
  let charCodeSum = 0;
  for (let i = 0; i < name.length; i++) charCodeSum += name.charCodeAt(i);
  return colors[charCodeSum % colors.length];
}
