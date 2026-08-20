import React from "react";

export function NotificationItem({ title, description, time, icon = "🔔" }) {
  return (
    <div className="notification-item">
      <span className="notification-item-icon">{icon}</span>
      <div className="notification-item-content">
        <h5 className="notification-item-title">{title}</h5>
        <p className="notification-item-desc">{description}</p>
        <span className="notification-item-time">{time}</span>
      </div>
    </div>
  );
}
