import React, { useState } from "react";
import { generateReferralCode } from "../../utils/referral-helpers.js";

export function ReferralBanner({ walletAddress, className = "" }) {
  const [copied, setCopied] = useState(false);

  if (!walletAddress) return null;

  const code = generateReferralCode(walletAddress);
  if (!code) return null;

  const shareUrl = `${window.location.origin}/?ref=${code}`;
  const shareText = `🎁 Join NimWord with my invite code ${code} and race me in Nimiq word matches! Play here: ${shareUrl}`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div
      className={`referral-banner ${className}`}
      style={{
        background: "var(--surface-sunk)",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--rule)",
        borderRadius: "14px",
        padding: "16px 20px",
        margin: "16px 0",
        color: "var(--ink)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "700", color: "var(--interactive-ink)" }}>
            🤝 Referral & Affiliate Code
          </h4>
          <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", color: "var(--ink-muted)" }}>
            Earn 20% of treasury fees when friends join rooms using your code!
          </p>
        </div>
        <div
          style={{
            background: "oklch(0.5849 0.1438 244.29 / 0.15)",
            border: "1px dashed oklch(0.5849 0.1438 244.29 / 0.5)",
            borderRadius: "8px",
            padding: "4px 10px",
            fontFamily: "monospace",
            fontWeight: "700",
            fontSize: "1.1rem",
            letterSpacing: "1px",
            color: "var(--interactive-ink)",
          }}
        >
          {code}
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={handleCopyCode}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            borderRadius: "8px",
            background: copied ? "var(--good)" : "var(--interactive-ink)",
            color: "var(--ink)",
            fontWeight: "600",
            fontSize: "12px",
            border: "none",
            cursor: "pointer",
            transition: "background 0.2s ease",
          }}
        >
          <span>{copied ? "✓" : "📋"}</span> {copied ? "Code Copied!" : "Copy Code"}
        </button>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            borderRadius: "8px",
            background: "#25D366",
            color: "var(--ink)",
            fontWeight: "600",
            fontSize: "12px",
            textDecoration: "none",
          }}
        >
          <span>💬</span> Share WhatsApp
        </a>

        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            borderRadius: "8px",
            background: "#0088cc",
            color: "var(--ink)",
            fontWeight: "600",
            fontSize: "12px",
            textDecoration: "none",
          }}
        >
          <span>✈️</span> Share Telegram
        </a>
      </div>
    </div>
  );
}
