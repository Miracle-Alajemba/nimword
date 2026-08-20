import { useState, useEffect, useRef } from "react";

/**
 * useCountdown — React hook for countdown timer with pause/resume support.
 * @param {number} initialSeconds - Starting seconds.
 * @param {{ autoStart?: boolean, onComplete?: () => void }} [options]
 * @returns {{ seconds: number, isRunning: boolean, start: () => void, pause: () => void, reset: () => void, percentRemaining: number }}
 */
export function useCountdown(initialSeconds, options = {}) {
  const { autoStart = false, onComplete } = options;
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isRunning || seconds <= 0) return;

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          onCompleteRef.current?.();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, seconds]);

  const start = () => setIsRunning(true);
  const pause = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
  };
  const reset = () => {
    pause();
    setSeconds(initialSeconds);
  };

  const percentRemaining = initialSeconds > 0 ? (seconds / initialSeconds) * 100 : 0;

  return { seconds, isRunning, start, pause, reset, percentRemaining };
}
