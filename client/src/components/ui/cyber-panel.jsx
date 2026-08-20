import React from "react";

export function CyberPanel({ children, title }) {
  return (
    <div className="cyber-panel">
      {title && <div className="cyber-panel-header">{title}</div>}
      <div className="cyber-panel-body">{children}</div>
    </div>
  );
}
