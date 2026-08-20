import React from "react";

/**
 * KeyboardKey — Visual representation of a key for hotkey hints.
 * @param {{ kbdKey: string, size?: "sm"|"md"|"lg" }} props
 */
export function KeyboardKey({ kbdKey, size = "md" }) {
  return (
    <kbd className={`keyboard-key keyboard-key--${size}`}>
      {kbdKey}
    </kbd>
  );
}
