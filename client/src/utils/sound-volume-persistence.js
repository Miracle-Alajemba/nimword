export function saveVolumeSetting(volume = 80) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("nimword_volume", String(volume));
  }
}
