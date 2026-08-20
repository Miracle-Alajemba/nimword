import React from "react";

/**
 * Accessible Badge Pill Component
 * @param {object} props
 * @param {string} props.label
 * @param {string} [props.icon]
 * @param {"emerald" | "amber" | "cyan" | "rose" | "purple" | "slate"} [props.variant="emerald"]
 * @param {string} [props.className]
 */
export function BadgePill({ label, icon, variant = "emerald", className = "" }) {
  if (!label) return null;

  const variantStyles = {
    emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    cyan: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    rose: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    purple: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    slate: "bg-slate-800/80 text-slate-300 border-slate-700/50",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-semibold select-none ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="text-xs">{icon}</span>}
      <span>{label}</span>
    </span>
  );
}

export default BadgePill;
