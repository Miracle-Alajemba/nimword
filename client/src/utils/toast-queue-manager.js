export function addToastToQueue(queue = [], newToast = {}, maxToasts = 3) {
  const updated = [...queue, newToast];
  if (updated.length > maxToasts) updated.shift();
  return updated;
}
