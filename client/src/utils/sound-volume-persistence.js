export function saveVolumeSetting(volume = 80) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("wordpot_volume", String(volume));
  }
}
