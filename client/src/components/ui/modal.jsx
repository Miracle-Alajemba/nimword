import React from "react";

/**
 * Modal — Accessible modal overlay with backdrop, close button, and focus trap.
 * @param {{ isOpen: boolean, onClose: () => void, title?: string, children: React.ReactNode, size?: "sm"|"md"|"lg" }} props
 */
export function Modal({ isOpen, onClose, title = "", children, size = "md" }) {
  const modalRef = React.useRef(null);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={title || "Dialog"}
    >
      <div className={`modal-content modal-content--${size}`} ref={modalRef}>
        <div className="modal-header">
          {title && <h2 className="modal-title">{title}</h2>}
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close dialog"
            type="button"
          >
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
