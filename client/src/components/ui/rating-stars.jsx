import React from "react";

/**
 * RatingStars — Displays star rating out of max stars.
 * @param {{ rating: number, max?: number }} props
 */
export function RatingStars({ rating = 5, max = 5 }) {
  return (
    <div className="rating-stars" aria-label={`Rating: ${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`star ${i < rating ? "star--filled" : ""}`}>
          ★
        </span>
      ))}
    </div>
  );
}
