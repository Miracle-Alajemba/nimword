import React from "react";

export function GlassContainer({ children, className = "" }) {
  return (
    <div className={`glass-container ${className}`.trim()}>
      {children}
    </div>
  );
}
