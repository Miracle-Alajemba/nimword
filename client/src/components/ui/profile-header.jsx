import React from "react";
import { AvatarCircle } from "./avatar-circle.jsx";

export function ProfileHeader({ address, username, level = 1 }) {
  return (
    <div className="profile-header">
      <AvatarCircle address={address} size={64} />
      <div className="profile-header-meta">
        <h2 className="profile-header-name">{username || "Anonymous Player"}</h2>
        <span className="profile-header-level">Level {level}</span>
      </div>
    </div>
  );
}
