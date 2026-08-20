import React from "react";

/**
 * StatCard — Metric showcase card with trend indicator.
 * @param {{ title: string, value: string|number, trend?: string, trendUp?: boolean, icon?: string }} props
 */
export function StatCard({ title, value, trend, trendUp = true, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-card-title">{title}</span>
        {icon && <span className="stat-card-icon">{icon}</span>}
      </div>
      <div className="stat-card-value">{value}</div>
      {trend && (
        <div className={`stat-card-trend ${trendUp ? "stat-card-trend--up" : "stat-card-trend--down"}`}>
          {trendUp ? "▲" : "▼"} {trend}
        </div>
      )}
    </div>
  );
}
