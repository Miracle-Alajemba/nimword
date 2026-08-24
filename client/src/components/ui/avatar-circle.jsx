import { useEffect, useState } from "react";
import { getNimiqAvatar, getNimiqAvatarAsync } from "../../utils/nimiq-identicon.js";

/**
 * AvatarCircle — Generates an official Nimiq Identicon from a Nimiq wallet address
 * using @nimiq/identicons (same hash -> same hexagon face / features).
 * @param {{ address: string, size?: number, className?: string }} props
 */
export function AvatarCircle({ address = "", size = 36, className = "" }) {
  const [avatarUrl, setAvatarUrl] = useState(() => getNimiqAvatar(address));

  useEffect(() => {
    let active = true;
    if (!address) {
      setAvatarUrl("");
      return;
    }

    const cached = getNimiqAvatar(address);
    if (cached) {
      setAvatarUrl(cached);
      return;
    }

    getNimiqAvatarAsync(address).then((url) => {
      if (active && url) {
        setAvatarUrl(url);
      }
    });

    return () => {
      active = false;
    };
  }, [address]);

  const initials = address ? address.replace(/\s+/g, "").slice(0, 4).toUpperCase() : "NQ";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`Nimiq Identicon for ${address}`}
        className={`avatar-circle ${className}`.trim()}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: "2px solid oklch(0.7924 0.1593 85.61 / 0.5)",
          boxShadow: "0 4px 12px oklch(0.2737 0.068 276.29 / 0.12)",
          objectFit: "contain",
          flexShrink: 0,
          background: "var(--surface-sunk)",
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
        background: "linear-gradient(135deg, var(--nq-blue), var(--nq-blue-deep))",
        border: "2px solid oklch(0.5849 0.1438 244.29 / 0.35)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 800,
        color: "var(--ink)",
        textShadow: "0 1px 2px oklch(0.2737 0.068 276.29 / 0.1)",
        flexShrink: 0,
        letterSpacing: "0.02em",
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
