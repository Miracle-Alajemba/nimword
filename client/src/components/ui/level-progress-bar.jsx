import React from "react";
import { ProgressBar } from "./progress-bar.jsx";

export function LevelProgressBar({ currentXp, nextLevelXp, level }) {
  return (
    <div className="level-progress-group">
      <div className="level-progress-header">
        <span>Level {level}</span>
        <span>{currentXp} / {nextLevelXp} XP</span>
      </div>
      <ProgressBar value={currentXp} max={nextLevelXp} color="#ff7a18" height={10} />
    </div>
  );
}
