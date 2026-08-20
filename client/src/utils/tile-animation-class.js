export function getTileAnimationClass(isSelected = false, isPop = false) {
  if (isPop) return "tile-pop-active";
  if (isSelected) return "tile-selected-active";
  return "";
}
