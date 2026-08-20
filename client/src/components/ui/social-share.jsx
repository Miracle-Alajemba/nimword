import React, { useState } from "react";

export function SocialShareBar({ roomId, score, wordCount, className = "" }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = roomId
    ? `${window.location.origin}/?room=${roomId}`
    : window.location.href;

  const shareText = score
    ? `🎮 I just scored ${score} points (${wordCount || 0} words) on WordPot! Race me on Celo: ${shareUrl}`
    : `🏆 Join my WordPot game room on Celo and test your vocabulary speed! Play here: ${shareUrl}`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div className={`social-share-bar ${className}`} style={{ display: "flex", gap: "8px", flexWrap: "wrap", margin: "12px 0" }}>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="social-btn social-btn--whatsapp"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 14px",
          borderRadius: "8px",
          background: "#25D366",
          color: "#fff",
          fontWeight: "600",
          fontSize: "13px",
          textDecoration: "none",
        }}
      >
        <span>💬</span> WhatsApp
      </a>

      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="social-btn social-btn--telegram"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 14px",
          borderRadius: "8px",
          background: "#0088cc",
          color: "#fff",
          fontWeight: "600",
          fontSize: "13px",
          textDecoration: "none",
        }}
      >
        <span>✈️</span> Telegram
      </a>

      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="social-btn social-btn--twitter"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 14px",
          borderRadius: "8px",
          background: "#1DA1F2",
          color: "#fff",
          fontWeight: "600",
          fontSize: "13px",
          textDecoration: "none",
        }}
      >
        <span>🐦</span> X / Twitter
      </a>

      <button
        type="button"
        onClick={handleCopy}
        className="social-btn social-btn--copy"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 14px",
          borderRadius: "8px",
          background: "rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "#fff",
          fontWeight: "600",
          fontSize: "13px",
          cursor: "pointer",
        }}
      >
        <span>{copied ? "✓" : "🔗"}</span> {copied ? "Copied!" : "Copy Link"}
      </button>
    </div>
  );
}
