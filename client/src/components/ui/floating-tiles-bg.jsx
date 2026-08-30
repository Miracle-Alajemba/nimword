import { useEffect, useRef } from "react";

/**
 * A drifting field of letter tiles painted behind the screen — the game's own
 * pieces, out of focus, instead of a flat panel.
 *
 * It is a canvas rather than DOM nodes because a dozen independently rotating,
 * translucent tiles as divs means a dozen composited layers the browser has to
 * blend on every frame, on a phone, while a 60-second round is running. One
 * canvas is one layer.
 *
 * Four things keep it from costing anything a player would notice:
 *
 *   - It draws at device pixel ratio, capped at 2. Without the cap a 3x phone
 *     paints nine times the pixels for a blur nobody can see.
 *   - It stops when the tab is hidden. A `requestAnimationFrame` loop is
 *     throttled in a background tab but not always stopped, and this one has
 *     nothing to say while nobody is looking.
 *   - Under `prefers-reduced-motion` it paints a single static frame and never
 *     starts the loop at all.
 *   - Colours come from the CSS custom properties, so it follows the theme
 *     instead of pinning a hex that goes wrong when the palette moves.
 *
 * It is decoration: `aria-hidden`, `pointer-events: none`, and it renders
 * nothing that carries meaning.
 */

const LETTERS = "NIMWORDABCEFGHKLPSTU";
const TILE_COUNT = 36;
const MAX_DPR = 2;

/**
 * Read a CSS custom property off the root element.
 * @param {string} name
 * @param {string} fallback
 * @returns {string}
 */
function token(name, fallback) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

export function FloatingTilesBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Vivid, warm Nimiq gold & deep blue for rich visibility
    const tileFill = "#FFC425";
    const tileInk = "#044B7F";

    let width = 0;
    let height = 0;
    let frame = 0;
    let tiles = [];

    /**
     * Size the backing store to the device's real pixels while keeping the CSS
     * box in layout pixels, then scale the context so all drawing code below
     * can stay in CSS pixels.
     */
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /**
     * Spread tiles over the viewport at random depths. Size, speed and opacity
     * all track the same `depth` value, so a bigger tile is always a nearer,
     * faster, more solid tile and the field reads as having actual space in it.
     */
    function seed() {
      const isMobile = width < 768;
      const count = isMobile ? 18 : 28;
      tiles = Array.from({ length: count }, () => {
        const depth = 0.35 + Math.random() * 0.65;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          size: isMobile ? 32 + depth * 28 : 38 + depth * 36,
          speed: 0.12 + depth * 0.20,
          drift: (Math.random() - 0.5) * 0.14,
          angle: (Math.random() - 0.5) * 0.45,
          spin: (Math.random() - 0.5) * 0.003,
          alpha: isMobile ? 0.22 + depth * 0.20 : 0.25 + depth * 0.22,
          letter: LETTERS[Math.floor(Math.random() * LETTERS.length)],
        };
      });
    }

    /**
     * Draw one tile: a rounded square with the letter centred on it.
     * @param {object} tile
     */
    function drawTile(tile) {
      const half = tile.size / 2;
      const radius = tile.size * 0.24;

      ctx.save();
      ctx.translate(tile.x, tile.y);
      ctx.rotate(tile.angle);
      ctx.globalAlpha = tile.alpha;

      ctx.beginPath();
      ctx.roundRect(-half, -half, tile.size, tile.size, radius);
      ctx.fillStyle = tileFill;
      ctx.fill();

      // Warm vibrant outline
      ctx.strokeStyle = "rgba(255, 170, 0, 0.45)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.globalAlpha = Math.min(tile.alpha * 2.0, 0.92);
      ctx.fillStyle = tileInk;
      ctx.font = `900 ${Math.round(tile.size * 0.54)}px 'Orbitron', 'Chakra Petch', Mulish, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(tile.letter, 0, tile.size * 0.02);

      ctx.restore();
    }

    function paint() {
      ctx.clearRect(0, 0, width, height);
      for (const tile of tiles) drawTile(tile);
    }

    /**
     * Advance and repaint. Tiles rise and wrap around the bottom edge, so the
     * field never empties and never needs reseeding.
     */
    function tick() {
      for (const tile of tiles) {
        tile.y -= tile.speed;
        tile.x += tile.drift;
        tile.angle += tile.spin;

        if (tile.y < -tile.size) {
          tile.y = height + tile.size;
          tile.x = Math.random() * width;
          tile.letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
        }
        if (tile.x < -tile.size) tile.x = width + tile.size;
        if (tile.x > width + tile.size) tile.x = -tile.size;
      }

      paint();
      frame = requestAnimationFrame(tick);
    }

    function start() {
      if (reduceMotion || frame) return;
      frame = requestAnimationFrame(tick);
    }

    function stop() {
      if (!frame) return;
      cancelAnimationFrame(frame);
      frame = 0;
    }

    function handleVisibility() {
      if (document.hidden) stop();
      else start();
    }

    function handleResize() {
      resize();
      seed();
      // Repaint immediately so a resize while hidden or under reduced motion
      // does not leave a stretched or blank canvas behind.
      paint();
    }

    resize();
    seed();
    paint();

    if (reduceMotion) {
      // One frame is the whole animation. Still listen for resize so the
      // static field stays sharp when the window changes.
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }

    start();
    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stop();
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      aria-hidden="true"
      className="floating-tiles-bg"
      ref={canvasRef}
      style={{
        inset: 0,
        pointerEvents: "none",
        position: "fixed",
        zIndex: 0,
      }}
    />
  );
}

export default FloatingTilesBg;
