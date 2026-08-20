import React from "react";

/**
 * Announcement / Alert Notification Banner Component
 * @param {object} props
 * @param {string} props.message
 * @param {"info" | "success" | "warning" | "error"} [props.variant="info"]
 * @param {function} [props.onClose]
 */
export function NotificationBanner({ message, variant = "info", onClose }) {
  if (!message) return null;

  const variantStyles = {
    info: "bg-sky-500/15 border-sky-500/30 text-sky-300",
    success: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
    warning: "bg-amber-500/15 border-amber-500/30 text-amber-300",
    error: "bg-rose-500/15 border-rose-500/30 text-rose-300",
  };

  const icons = {
    info: "ℹ️",
    success: "🎉",
    warning: "⚠️",
    error: "🚨",
  };

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${variantStyles[variant]}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-base">{icons[variant]}</span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss banner"
          className="text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default NotificationBanner;
