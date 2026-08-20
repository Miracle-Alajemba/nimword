import React from "react";

/**
 * WordListDisplay — List of claimed words with point chips.
 * @param {{ words: Array<{ word: string, score: number }> }} props
 */
export function WordListDisplay({ words = [] }) {
  if (!words.length) {
    return <div className="word-list-empty">No words submitted yet.</div>;
  }

  return (
    <div className="word-list-container">
      {words.map((item, idx) => (
        <div key={idx} className="word-list-item">
          <span className="word-list-text">{item.word.toUpperCase()}</span>
          <span className="word-list-score">+{item.score}</span>
        </div>
      ))}
    </div>
  );
}
