import React from "react";
import { BadgeDisplay } from "./badge-display.jsx";

/**
 * BadgeGrid — Displays a grid of user badges.
 * @param {{ badges: Array<{ id: string, name: string, icon: string, unlocked: boolean }> }} props
 */
export function BadgeGrid({ badges = [] }) {
  return (
    <div className="badge-grid">
      {badges.map((badge) => (
        <BadgeDisplay
          key={badge.id}
          badge={badge}
        />
      ))}
    </div>
  );
}
