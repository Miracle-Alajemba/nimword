import React from "react";

/**
 * NotificationBell — Animated bell icon with unread count badge.
 * @param {{ count?: number, onClick?: () => void }} props
 */
export function NotificationBell({ count = 0, onClick }) {
  return (
    <button
      className={`notification-bell ${count > 0 ? "notification-bell--active" : ""}`}
      onClick={onClick}
      aria-label={count > 0 ? `${count} new notifications` : "No new notifications"}
      type="button"
    >
      <span className="notification-bell-icon" role="img" aria-hidden="true">🔔</span>
      {count > 0 && (
        <span className="notification-bell-badge" aria-hidden="true">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
