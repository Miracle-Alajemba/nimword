import React, { useState, useEffect } from "react";

export function CountUpText({ target, suffix = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(target, 10);
    if (start === end) return;
    const duration = 1000;
    const incrementTime = (duration / end) * 5;

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, Math.max(incrementTime, 20));

    return () => clearInterval(timer);
  }, [target]);

  return <span className="count-up-text">{count}{suffix}</span>;
}
