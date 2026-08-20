import React from "react";

export function GameHeader({ title, subtitle, backAction }) {
  return (
    <header className="game-header">
      {backAction && (
        <button type="button" className="game-header-back" onClick={backAction}>
          ←
        </button>
      )}
      <div className="game-header-titles">
        <h1 className="game-header-title">{title}</h1>
        {subtitle && <p className="game-header-subtitle">{subtitle}</p>}
      </div>
    </header>
  );
}
