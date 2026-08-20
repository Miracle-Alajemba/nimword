import React from "react";

/**
 * TabBar — Accessible horizontal tab selection bar.
 * @param {{ tabs: Array<{ id: string, label: string, icon?: string }>, activeTab: string, onChange: (id: string) => void }} props
 */
export function TabBar({ tabs = [], activeTab, onChange }) {
  return (
    <div className="tab-bar" role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            className={`tab-item ${isActive ? "tab-item--active" : ""}`}
            onClick={() => onChange(tab.id)}
            type="button"
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            <span className="tab-label">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
