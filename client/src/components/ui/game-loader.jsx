import { useEffect, useRef } from "react";
import gsap from "gsap";

export function GameLoader({ label = "Loading...", letters = "WORDPOT" }) {
  const containerRef = useRef(null);
  const lettersRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Build timeline using GSAP context for proper memory cleanup on unmount
    const ctx = gsap.context(() => {
      // 1. Staggered drop and flip of tiles on mount
      gsap.fromTo(
        lettersRef.current,
        {
          y: -100,
          rotationY: -180,
          opacity: 0,
          scale: 0.5,
        },
        {
          y: 0,
          rotationY: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.5)",
          stagger: 0.08,
          onComplete: () => {
            // Once initial bounce completes, transition to a gentle wave loop
            gsap.to(lettersRef.current, {
              y: -12,
              duration: 0.4,
              ease: "sine.inOut",
              stagger: {
                each: 0.06,
                repeat: -1,
                yoyo: true,
              },
            });
          },
        }
      );
    }, containerRef);

    return () => ctx.revert(); // clean up all GSAP animations
  }, [letters]);

  const letterArray = String(letters).toUpperCase().split("");

  // Calculate dynamic sizing to avoid wrapping on mobile viewports
  const len = letterArray.length;
  const tileSize = len > 10 ? "1.8rem" : len > 8 ? "2.2rem" : len > 6 ? "2.7rem" : "3.4rem";
  const fontSize = len > 10 ? "0.85rem" : len > 8 ? "1.05rem" : len > 6 ? "1.25rem" : "1.5rem";
  const borderRadius = len > 8 ? "8px" : "12px";
  const gap = len > 10 ? "0.25rem" : len > 8 ? "0.35rem" : "0.5rem";

  return (
    <div className="game-loader-container" ref={containerRef}>
      <div className="game-loader-rack" style={{ gap, flexWrap: "nowrap", justifyContent: "center" }}>
        {letterArray.map((char, index) => (
          <div
            key={index}
            className="letter-tile letter-tile--play game-loader-tile"
            style={{
              width: tileSize,
              height: tileSize,
              minWidth: tileSize,
              fontSize: fontSize,
              borderRadius: borderRadius,
            }}
            ref={(el) => {
              if (el) lettersRef.current[index] = el;
            }}
          >
            {char}
          </div>
        ))}
      </div>
      <p className="game-loader-label">{label}</p>
    </div>
  );
}

