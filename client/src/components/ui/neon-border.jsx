import React from "react";

export function NeonBorder({ children, color = "#63f4ca" }) {
  return (
    <div className="neon-border-wrapper" style={{ "--neon-color": color }}>
      {children}
    </div>
  );
}
