export function anonymizeIp(ip = "") {
  if (!ip) return "0.0.0.0";
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.0.0`;
  return ip;
}
