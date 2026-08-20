import React from "react";

/**
 * Breadcrumbs — Accessible navigation path breadcrumb list.
 * @param {{ items: Array<{ label: string, onClick?: () => void, href?: string }> }} props
 */
export function Breadcrumbs({ items = [] }) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs-nav">
      <ol className="breadcrumbs-list">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;

          return (
            <li key={idx} className="breadcrumbs-item">
              {isLast ? (
                <span className="breadcrumbs-current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <>
                  {item.onClick ? (
                    <button
                      type="button"
                      className="breadcrumbs-link"
                      onClick={item.onClick}
                    >
                      {item.label}
                    </button>
                  ) : item.href ? (
                    <a href={item.href} className="breadcrumbs-link">
                      {item.label}
                    </a>
                  ) : (
                    <span className="breadcrumbs-text">{item.label}</span>
                  )}
                  <span className="breadcrumbs-separator" aria-hidden="true">
                    /
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
