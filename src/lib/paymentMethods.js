// src/lib/paymentMethods.js

/**
 * Normalize a payment method string into a clean, consistent identifier.
 * Handles casing, spaces, dashes, and common gateway aliases.
 *
 * Accepts any raw string the gateway sends, returns a lowercase
 * snake_case identifier matching the DB constraint
 * ^[a-z][a-z0-9_]{0,39}$
 */
export function normalizePaymentMethod(raw, fallback = "unknown") {
  if (!raw) return fallback;

  let m = String(raw)
    .toLowerCase()
    .trim()
    .replace(/[\s\-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

  m = m.replace(/_+/g, "_").replace(/^_|_$/g, "");

  if (!m) return fallback;
  if (!/^[a-z]/.test(m)) m = "m_" + m;

  const aliases = {
    // Card family
    credit_card: "card",
    debit_card: "card",
    mastercard: "card",
    visa: "card",
    verve: "card",
    // Digital wallets
    apple_pay: "applepay",
    applepay: "applepay",
    google_pay: "googlepay",
    googlepay: "googlepay",
    // Bank transfer
    transfer: "bank_transfer",
    bank: "bank_transfer",
    wire: "bank_transfer",
    // Mobile money
    mobile_money: "mobilemoney",
    momo: "mobilemoney",
    mpesa: "mpesa",
    // Others
    qr_code: "qr",
    crypto_currency: "crypto",
  };

  return aliases[m] || m;
}