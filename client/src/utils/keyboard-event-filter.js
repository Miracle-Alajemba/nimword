export function isSpecialNavKey(key = "") {
  return ["Tab", "Meta", "Control", "Alt", "CapsLock", "Shift"].includes(key);
}
