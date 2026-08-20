import { useEffect } from "react";

/**
 * Custom hook to dynamically update document title
 * @param {string} title
 * @param {boolean} [resetOnUnmount=false]
 */
export function useDocumentTitle(title, resetOnUnmount = false) {
  useEffect(() => {
    if (typeof document === "undefined" || !title) return;
    const previousTitle = document.title;
    document.title = title;

    return () => {
      if (resetOnUnmount) {
        document.title = previousTitle;
      }
    };
  }, [title, resetOnUnmount]);
}

export default useDocumentTitle;
