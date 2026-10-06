// lib/currency.js
import { TL } from "tz-geo-currency";

// Currencies Flutterwave supports for card charges [citation:16]
const FLW_SUPPORTED = new Set([
  "GBP", "CAD", "XAF", "COP", "EGP", "EUR",
  "GHS", "KES", "NGN", "RWF", "SLL", "ZAR",
  "TZS", "UGX", "USD", "XOF", "ZMW",
]);

/**
 * Returns the user's most likely currency based on their timezone,
 * restricted to currencies Flutterwave supports. Falls back to USD.
 */
export function getUserCurrency() {
  try {
    const currencies = TL.getCurrencies(); // e.g. ["NGN"] or ["GHS"]
    if (currencies && currencies.length > 0) {
      const c = currencies[0];
      if (FLW_SUPPORTED.has(c)) return c;
    }
  } catch {
    // ignore
  }
  return "USD";
}