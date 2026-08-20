import React from "react";

/**
 * Animated Status Dot Component (Online, Offline, Busy)
 * @param {object} props
 * @param {"online" | "offline" | "busy"} [props.status="online"]
 * @param {string} [props.className]
 */
export function StatusDot({ status = "online", className = "" }) {
  const statusColors = {
    online: "bg-emerald-500 shadow-emerald-500/50 animate-pulse",
    offline: "bg-slate-500 shadow-slate-500/30",
    busy: "bg-amber-500 shadow-amber-500/50 animate-pulse",
  };

  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full shadow-sm ${statusColors[status]} ${className}`}
      title={`Status: ${status}`}
    />
  );
}

export default StatusDot;
