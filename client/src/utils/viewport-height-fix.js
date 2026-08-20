export function setDynamicVhProperty() {
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }
}
