export function formatLogMessage(level, message, meta = {}) {
  return JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...meta });
}
