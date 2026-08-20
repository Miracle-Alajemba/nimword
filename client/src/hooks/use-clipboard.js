import { useState, useCallback } from "react";

/**
 * useClipboard — React hook for copying text to clipboard with feedback state.
 * @param {number} [resetMs=2000] - How long to keep the "copied" state.
 * @returns {{ copy: (text: string) => Promise<void>, copied: boolean }}
 */
export function useClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), resetMs);
    } catch (err) {
      console.warn("Clipboard copy failed:", err);
      // Fallback for older browsers
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), resetMs);
      } catch (fallbackErr) {
        console.error("Fallback clipboard copy failed:", fallbackErr);
      }
    }
  }, [resetMs]);

  return { copy, copied };
}
