export function validateRequiredEnvVars(required = []) {
  const missing = required.filter((key) => !process.env[key]);
  return {
    valid: missing.length === 0,
    missing,
  };
}
