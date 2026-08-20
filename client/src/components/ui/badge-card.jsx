import React from "react";

export function BadgeCard({ name, description, icon, unlocked = false }) {
  return (
    <div className={`badge-card ${unlocked ? "badge-card--unlocked" : "badge-card--locked"}`}>
      <span className="badge-card-icon">{icon}</span>
      <h4 className="badge-card-name">{name}</h4>
      <p className="badge-card-desc">{description}</p>
    </div>
  );
}
