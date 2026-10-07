// src/lib/points.js
//
// Royal Points (pts) is a display-layer abstraction over USD.
// Internally, all wallet balances, transactions, and payments are USD.
// Users see points everywhere. Admins see USD.
//
// 1 pt = 1 USD

export const POINT_NAME = "Royal Points";
export const POINT_NAME_SINGULAR = "Royal Point";
export const POINT_ABBR = "pts";
export const POINT_RATE_USD = 1; // 1 pt = 1 USD

/**
 * Format a USD amount as a Points string.
 *   formatPoints(10)    → "10.00 pts"
 *   formatPoints(0.5)   → "0.50 pts"
 *   formatPoints(1500)  → "1500.00 pts"
 */
export function formatPoints(amount) {
  const value = Number(amount ?? 0);
  const safe = Number.isFinite(value) ? value : 0;
  return `${safe.toFixed(2)} ${POINT_ABBR}`;
}

/**
 * Format with no trailing decimals when the value is a whole number.
 *   formatPointsCompact(10)   → "10 pts"
 *   formatPointsCompact(10.5) → "10.50 pts"
 */
export function formatPointsCompact(amount) {
  const value = Number(amount ?? 0);
  const safe = Number.isFinite(value) ? value : 0;
  const isWhole = Math.abs(safe - Math.round(safe)) < 0.001;
  return `${isWhole ? safe.toFixed(0) : safe.toFixed(2)} ${POINT_ABBR}`;
}

/**
 * Just the number, no abbreviation. Useful for rendering the "pts"
 * as separate styled markup (e.g. smaller text next to a big number).
 *   pointNumber(10) → "10.00"
 */
export function pointNumber(amount) {
  const value = Number(amount ?? 0);
  const safe = Number.isFinite(value) ? value : 0;
  return safe.toFixed(2);
}