export function sanitizeRoomCodeInput(code = "") {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
}
