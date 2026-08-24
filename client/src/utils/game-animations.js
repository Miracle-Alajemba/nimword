/**
 * GSAP animations for the moments the game already knows about: a screen
 * arriving, a tile being tapped, a word landing or bouncing, and the clock
 * running out.
 *
 * Two rules hold this file together.
 *
 * One engine per property. CSS keeps the transforms it can fire and forget
 * (the tile deal-in, the button lift). GSAP takes the ones that get
 * interrupted — a tile tapped twice in 200ms, a word submitted while the last
 * flash is still fading. A @keyframes rule and a tween writing the same
 * transform will stutter, because whichever runs second wins mid-flight.
 *
 * Every function leaves the element exactly as it found it. Tweens clear their
 * own inline styles on completion, so the CSS cascade owns the resting state
 * and nothing accumulates over a 60-second round.
 *
 * These are presentation only. They read the game's state; they never change
 * it, and none of them can fail in a way that blocks a submit.
 */

import { gsap } from "gsap";

/**
 * Whether the viewer has asked the OS for less motion. Read per call, not
 * once at import — someone can flip the setting while the tab is open.
 * @returns {boolean}
 */
function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Resolve a CSS custom property to the value actually in effect, so the
 * animations follow the theme instead of hardcoding a hex that goes wrong the
 * moment the palette moves.
 * @param {string} name - Custom property name, including the leading dashes.
 * @param {string} [fallback=""] - Returned when the property is unset.
 * @returns {string}
 */
function token(name, fallback = "") {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

/**
 * True when there is nothing safe to animate — no element, or the element has
 * been unmounted since the effect that captured it ran.
 * @param {Element|null|undefined} el
 * @returns {boolean}
 */
function unusable(el) {
  return !el || !el.isConnected;
}

/**
 * Fade and lift a screen in on mount. Called from a `useEffect` with an empty
 * dependency array, on the screen's outermost `.page-shell` ref.
 *
 * Under reduced motion the element is snapped to its final state rather than
 * left at `opacity: 0`, which is what would happen if we simply returned.
 *
 * @param {HTMLElement|null} el - The screen root.
 * @returns {gsap.core.Tween|null}
 */
export function animateScreenIn(el) {
  if (unusable(el)) return null;

  if (prefersReducedMotion()) {
    gsap.set(el, { clearProps: "opacity,transform" });
    return null;
  }

  return gsap.fromTo(
    el,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: "power3.out",
      // Hand the resting state back to CSS the moment we are done, or the
      // inline transform sits on the shell and blocks anything later.
      onComplete: () => gsap.set(el, { clearProps: "opacity,transform" }),
    },
  );
}

/**
 * Pop a letter tile on tap. Overwrites its own previous tween so a fast
 * double-tap restarts cleanly instead of queueing.
 *
 * @param {HTMLElement|null} el - The tapped tile.
 * @returns {gsap.core.Tween|null}
 */
export function animateTileTap(el) {
  if (unusable(el) || prefersReducedMotion()) return null;

  return gsap.to(el, {
    scale: 1.15,
    duration: 0.12,
    ease: "back.out(3)",
    overwrite: "auto",
    repeat: 1,
    yoyo: true,
    onComplete: () => gsap.set(el, { clearProps: "transform" }),
  });
}

/**
 * Flash the live score when a word is accepted: a scale punch plus a green
 * beat, then a smooth return to the theme's ink colour.
 *
 * Fired when `myScore` rises, on the `.live-score` element.
 *
 * @param {HTMLElement|null} el - The score readout.
 * @returns {gsap.core.Timeline|null}
 */
export function animateWordAccepted(el) {
  if (unusable(el)) return null;

  if (prefersReducedMotion()) return null;

  const restingColour = token("--ink", "#1F2348");
  const successColour = token("--nq-green", "#21BCA5");

  const tl = gsap.timeline({
    onComplete: () => gsap.set(el, { clearProps: "transform,color" }),
  });

  tl.set(el, { color: successColour })
    .fromTo(
      el,
      { scale: 0.8 },
      { scale: 1.3, duration: 0.25, ease: "back.out(2)" },
    )
    .to(el, { scale: 1, duration: 0.2, ease: "power2.out" })
    // Ease the colour back rather than snapping, so the flash reads as a pulse
    // and not a repaint.
    .to(el, { color: restingColour, duration: 0.25 }, "-=0.12");

  return tl;
}

/**
 * Shake the screen when a word is rejected. Small on purpose: enough to feel
 * like a "no" through the thumb, not enough to make the layout look broken.
 *
 * Fired when a rejected entry arrives, on the `.page-shell` ref.
 *
 * @param {HTMLElement|null} el - The screen root.
 * @returns {gsap.core.Tween|null}
 */
export function animateWordRejected(el) {
  if (unusable(el) || prefersReducedMotion()) return null;

  return gsap.to(el, {
    x: 8,
    duration: 0.06,
    ease: "power1.inOut",
    overwrite: "auto",
    repeat: 5,
    yoyo: true,
    onComplete: () => gsap.set(el, { clearProps: "transform" }),
  });
}

/**
 * Pulse the countdown red in the last ten seconds. Repeats indefinitely, so it
 * must be stopped — see `stopTimerUrgency`.
 *
 * Fired when `timeLeft` drops to 10 and is still above 0, on the
 * `.timer-tone` element.
 *
 * @param {HTMLElement|null} el - The countdown readout.
 * @returns {gsap.core.Tween|null}
 */
export function startTimerUrgency(el) {
  if (unusable(el) || prefersReducedMotion()) return null;

  return gsap.to(el, {
    scale: 1.1,
    color: token("--nq-red", "#D94432"),
    duration: 0.4,
    ease: "power1.inOut",
    overwrite: "auto",
    repeat: -1,
    yoyo: true,
  });
}

/**
 * Stop the countdown pulse and hand the timer back to CSS.
 *
 * `repeat: -1` never ends on its own, so without this the pulse would outlive
 * the round: the clock would keep throbbing red through the results screen and
 * the tween would keep running against a detached node. Call it when
 * `timeLeft` leaves the danger window, and again from the effect's cleanup.
 *
 * @param {HTMLElement|null} el - The countdown readout.
 * @returns {void}
 */
export function stopTimerUrgency(el) {
  if (!el) return;
  gsap.killTweensOf(el);
  // Kill leaves the last interpolated frame in place, so clear it explicitly
  // or the timer stays mid-pulse at whatever size it happened to be.
  gsap.set(el, { clearProps: "transform,color" });
}
