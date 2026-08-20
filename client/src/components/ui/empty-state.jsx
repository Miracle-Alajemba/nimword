import React from "react";

/**
 * EmptyState — Friendly empty state placeholder with icon, title, and description.
 * @param {{ icon?: string, title?: string, description?: string, action?: React.ReactNode }} props
 */
export function EmptyState({ icon = "🎮", title = "Nothing here yet", description = "", action = null }) {
  return (
    <div className="empty-state" role="status">
      <span className="empty-state-icon" aria-hidden="true">{icon}</span>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-desc">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
