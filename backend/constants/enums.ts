// constants/enums.ts
//
// Single source of truth for all enum-like string values.
// Imported by Mongoose models, validators, routes and services.

// ─────────────────────────────────────────────────────────────────────────────
// ORDER
// ─────────────────────────────────────────────────────────────────────────────

export const ORDER_STATUSES = [
  'draft',
  'pending_payment',
  'paid',
  'expired',
  'failed',
  'refunded',
  'partially_refunded',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT
// ─────────────────────────────────────────────────────────────────────────────

export const PAYMENT_STATUSES = [
  'initiated',
  'pending',
  'completed',
  'declined',
  'refunded',
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_PROVIDERS = [
  'paystack',
  'flutterwave',
] as const;

export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export const FEE_POLICIES = [
  'organizer_absorbs',
  'pass_to_customer',
] as const;

export type FeePolicy = (typeof FEE_POLICIES)[number];

// ─────────────────────────────────────────────────────────────────────────────
// CURRENCY
// ─────────────────────────────────────────────────────────────────────────────

export const CURRENCIES = [
  'NGN',
  'USD',
  'EUR',
  'GBP',
] as const;

export type Currency = (typeof CURRENCIES)[number];

// ─────────────────────────────────────────────────────────────────────────────
// CURRENCY → PROVIDER ROUTING
//
// Single source of truth for which payment provider handles which currency.
//   - NGN            → Paystack
//   - USD / EUR / GBP → Flutterwave (all "other" currencies)
//
// Using `satisfies Record<Currency, PaymentProvider>` means adding a new
// currency to CURRENCIES will fail type-checking until a mapping is added.
// ─────────────────────────────────────────────────────────────────────────────

export const CURRENCY_PROVIDER_MAP = {
  NGN: 'paystack',
  USD: 'flutterwave',
  EUR: 'flutterwave',
  GBP: 'flutterwave',
} as const satisfies Record<Currency, PaymentProvider>;

/**
 * Returns the payment provider that must be used for a given currency.
 * Throws if the currency is not in CURRENCIES (defensive against bad input
 * from untrusted sources such as request bodies).
 */
export function providerForCurrency(currency: string): PaymentProvider {
  if (!(currency in CURRENCY_PROVIDER_MAP)) {
    throw new Error(`Unsupported currency: ${currency}`);
  }
  return CURRENCY_PROVIDER_MAP[currency as Currency];
}

/**
 * True if the given provider is the correct one for the given currency.
 * Useful for guarding payment-initiation payloads.
 */
export function isProviderValidForCurrency(
  provider: string,
  currency: string,
): boolean {
  if (!(currency in CURRENCY_PROVIDER_MAP)) return false;
  return CURRENCY_PROVIDER_MAP[currency as Currency] === provider;
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTICIPANT
// ─────────────────────────────────────────────────────────────────────────────

export const ATTENDANCE_MODES = [
  'physically',
  'online',
  'not_sure',
] as const;

export type AttendanceMode = (typeof ATTENDANCE_MODES)[number];

export const GENDERS = [
  'male',
  'female',
] as const;

export type Gender = (typeof GENDERS)[number];

export const PARTICIPANT_STATUSES = [
  'unconfirmed',
  'confirmed',
  'checked_in',
] as const;

export type ParticipantStatus = (typeof PARTICIPANT_STATUSES)[number];

// ─────────────────────────────────────────────────────────────────────────────
// SCAN
// ─────────────────────────────────────────────────────────────────────────────

export const SCAN_TYPES = [
  'arrival',
  'daily_attendance',
  'custom',
] as const;

export type ScanType = (typeof SCAN_TYPES)[number];

export const SCAN_RESULTS = [
  'valid',
  'already_checked_in',
  'invalid_signature',
  'forged',
  'conflict',
] as const;

export type ScanResult = (typeof SCAN_RESULTS)[number];

// ─────────────────────────────────────────────────────────────────────────────
// STAFF
// ─────────────────────────────────────────────────────────────────────────────

export const STAFF_ROLES = ['staff', 'admin'] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];