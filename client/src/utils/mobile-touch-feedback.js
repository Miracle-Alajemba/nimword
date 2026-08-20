export function applyTileTapEffect(el) {
  if (el && el.classList) {
    el.classList.add("tile-tap-active");
    setTimeout(() => el.classList.remove("tile-tap-active"), 150);
  }
}
