export function isMaintenanceActive() {
  return process.env.MAINTENANCE_MODE === "true";
}
