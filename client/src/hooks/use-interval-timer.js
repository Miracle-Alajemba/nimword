import { useEffect, useRef } from "react";

/**
 * Custom hook to execute a callback function at a specified interval
 * @param {function} callback
 * @param {number|null} delay Delay in milliseconds (null to pause)
 */
export function useIntervalTimer(callback, delay) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null || delay === undefined) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

export default useIntervalTimer;
