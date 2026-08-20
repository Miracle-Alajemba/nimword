import React from "react";
import { getNimiqAvatar } from "../../utils/nimiq-identicon.js";

/**
 * AvatarCircle — Generates an identicon avatar from a Nimiq wallet address using identicon.js.
 * @param {{ address: string, size?: number, className?: string }} props
 */
export function AvatarCircle({ address = "", size = 36, className = "" }) {
  const avatarUrl = React.useMemo(() => {
    return getNimiqAvatar(address);
  }, [address]);

  const initials = address ? address.replace(/\s+/g, "").slice(0, 4).toUpperCase() : "NQ";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`Avatar for ${address}`}
        className={`avatar-circle ${className}`.trim()}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: "2px solid rgba(0, 180, 216, 0.4)",
          boxShadow: "0 4px 12px rgba(0, 180, 216, 0.25)",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <span
      className={`avatar-circle ${className}`.trim()}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #00B4D8, #0077B6)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 800,
        color: "#fff",
        textShadow: "0 1px 2px rgba(0,0,0,0.3)",
        flexShrink: 0,
        letterSpacing: "0.02em",
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

