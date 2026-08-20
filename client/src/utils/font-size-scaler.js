export function getResponsiveFontSize(baseRem = 1, userLargeText = false) {
  return userLargeText ? `${baseRem * 1.2}rem` : `${baseRem}rem`;
}
