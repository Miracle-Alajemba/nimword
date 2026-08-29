import { useEffect, useRef, useLayoutEffect } from "react";
import gsap from "gsap";

export function GameLoader({ label = "Loading...", letters = "NIMWORD" }) {
  const containerRef = useRef(null);
  const lettersRef = useRef([]);

  const letterArray = String(letters).toUpperCase().split("");

  // Reset refs array before each render so stale entries don't linger
  lettersRef.current = [];

  useEffect(() => {
    if (!containerRef.current) return;
    // Wait a tick for all refs to populate
    const raf = requestAnimationFrame(() => {
      const tiles = lettersRef.current.filter(Boolean);
      if (!tiles.length) return;

      const ctx = gsap.context(() => {
        gsap.fromTo(
          tiles,
          {
            y: -80,
            rotationY: -180,
            opacity: 0,
            scale: 0.5,
          },
          {
            y: 0,
            rotationY: 0,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.5)",
            stagger: 0.07,
            onComplete: () => {
              gsap.to(tiles, {
                y: -10,
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

      // Store cleanup in ref so we can call it in effect cleanup
      containerRef._gsapCtx = ctx;
    });

    return () => {
      cancelAnimationFrame(raf);
      if (containerRef._gsapCtx) {
        containerRef._gsapCtx.revert();
        containerRef._gsapCtx = null;
      }
    };
  }, [letters]);

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
            key={`${letters}-${index}`}
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

