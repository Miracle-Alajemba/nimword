export function scrollToTop(smooth = true) {
  window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
}

export function copyElementText(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    navigator.clipboard.writeText(el.innerText);
  }
}
