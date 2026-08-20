import React, { useEffect } from "react";

/**
 * NotificationToast — Temporary toast popup notification.
 * @param {{ message: string, type?: "info"|"success"|"error"|"warning", onClose: () => void, duration?: number }} props
 */
export function NotificationToast({ message, type = "info", onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`notification-toast notification-toast--${type}`} role="alert">
      <span className="notification-toast-msg">{message}</span>
      <button type="button" className="notification-toast-close" onClick={onClose}>
        ✕
      </button>
    </div>
  );
}
