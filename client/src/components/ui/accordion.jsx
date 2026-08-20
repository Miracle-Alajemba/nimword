import React, { useState } from "react";

/**
 * Accordion — Accessible collapsible content container.
 * @param {{ items: Array<{ id: string, title: string, content: React.ReactNode }>, defaultOpenId?: string }} props
 */
export function Accordion({ items = [], defaultOpenId = null }) {
  const [openId, setOpenId] = useState(defaultOpenId);

  const toggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="accordion-group" role="tablist">
      {items.map((item) => {
        const isOpen = openId === item.id;
        const buttonId = `accordion-btn-${item.id}`;
        const panelId = `accordion-panel-${item.id}`;

        return (
          <div key={item.id} className={`accordion-item ${isOpen ? "accordion-item--open" : ""}`}>
            <button
              id={buttonId}
              className="accordion-trigger"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              type="button"
            >
              <span className="accordion-title">{item.title}</span>
              <span className="accordion-icon" aria-hidden="true">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen && (
              <div
                id={panelId}
                className="accordion-panel"
                role="region"
                aria-labelledby={buttonId}
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
