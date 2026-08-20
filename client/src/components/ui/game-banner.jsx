import React from "react";

/**
 * GameBanner — Full-width announcement banner with variant colors.
 * @param {{ title: string, subtitle?: string, variant?: "info"|"warning"|"success"|"danger", action?: React.ReactNode }} props
 */
export function GameBanner({ title, subtitle, variant = "info", action }) {
  return (
    <div className={`game-banner game-banner--${variant}`} role="banner">
      <div className="game-banner-content">
        <h4 className="game-banner-title">{title}</h4>
        {subtitle && <p className="game-banner-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="game-banner-action">{action}</div>}
    </div>
  );
}
