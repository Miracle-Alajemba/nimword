export function getToastDismissTimeout(type = "info") {
  if (type === "error") return 5000;
  if (type === "success") return 3000;
  return 4000;
}
