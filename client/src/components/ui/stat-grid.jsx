import React from "react";
import { MetricCard } from "./game-ui.jsx";

/**
 * StatGrid — Responsive grid layout for metric cards.
 * @param {{ stats: Array<{ label: string, value: string|number, helper?: string, badge?: string, icon?: string }>, columns?: 2|3|4 }} props
 */
export function StatGrid({ stats = [], columns = 3 }) {
  return (
    <div className={`stat-grid stat-grid--cols-${columns}`}>
      {stats.map((stat, idx) => (
        <MetricCard
          key={idx}
          label={stat.label}
          value={stat.value}
          helper={stat.helper}
          badge={stat.badge}
          icon={stat.icon}
        />
      ))}
    </div>
  );
}
