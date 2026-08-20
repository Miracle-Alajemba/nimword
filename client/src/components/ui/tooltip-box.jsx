import React, { useState } from "react";

/**
 * Accessible Hover/Touch Tooltip Container Component
 * @param {object} props
 * @param {string} props.text
 * @param {React.ReactNode} props.children
 * @param {"top" | "bottom" | "left" | "right"} [props.position="top"]
 */
export function TooltipBox({ text, children, position = "top" }) {
  const [visible, setVisible] = useState(false);

  if (!text) return <>{children}</>;

  const positionClasses = {
    top: "-top-10 left-1/2 -translate-x-1/2 mb-2",
    bottom: "-bottom-10 left-1/2 -translate-x-1/2 mt-2",
    left: "top-1/2 -translate-y-1/2 right-full mr-2",
    right: "top-1/2 -translate-y-1/2 left-full ml-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={`absolute z-50 px-2.5 py-1 rounded-lg bg-slate-900/95 text-slate-100 text-xs font-medium border border-slate-700/80 shadow-xl whitespace-nowrap pointer-events-none transition-opacity duration-150 ${positionClasses[position]}`}
        >
          {text}
        </div>
      )}
    </div>
  );
}

export default TooltipBox;
