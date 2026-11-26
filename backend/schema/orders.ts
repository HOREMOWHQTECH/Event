import mongoose from 'mongoose';

import {
  ATTENDANCE_MODES,
  CURRENCIES,
  GENDERS,
  ORDER_STATUSES,
  PAYMENT_PROVIDERS,
  PAYMENT_STATUSES,
} from '../constants/enums.ts';

// ─────────────────────────────────────────────────────────────────────────────
// ORDER
// ─────────────────────────────────────────────────────────────────────────────

export interface OrderDoc extends mongoose.Document {
  reference: string;
  status: (typeof ORDER_STATUSES)[number];
  disputed: boolean;
  currency: (typeof CURRENCIES)[number];
  totalMinor: number;
  feeMinor: number;
  payerName: string;
  payerPhoneE164: string;
  payerEmail?: string | null;
  country?: string | null;
  state?: string | null;
  isGroup: boolean;
  groupName?: string | null;
  attendanceCounts: {
    physically: number;
    online: number;
    not_sure: number;
  };
  attendanceMode: (typeof ATTENDANCE_MODES)[number];
  gender?: (typeof GENDERS)[number] | null;
  firstTime: boolean;
  isMinor: boolean;
  genderCounts: { male: number; female: number };
  firstTimeCounts: { yes: number; no: number };
  inviteeCount: number;
  hasChildren: boolean;
  childCount: number;
  seats: number | null;
  ticketTypeId: mongoose.Types.ObjectId | null;
  paidAt: Date | null;
  idempotencyKey: string;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new mongoose.Schema<OrderDoc>(
  {
    reference: {
      type: String,
      required: true,
      maxlength: 16,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      required: true,
      default: 'draft',
    },
    disputed: {
      type: Boolean,
      required: true,
      default: false,
    },
    currency: {
      type: String,
      enum: CURRENCIES,
      required: true,
    },
    totalMinor: {
      type: Number,
      required: true,
      min: 0,
    },
    // Fee the customer saw / was charged per fee policy (organizer_absorbs vs
    // pass_to_customer). The actual provider fee is stored on Payment.providerFeeMinor.
    feeMinor: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    payerName: {
      type: String,
      required: true,
      maxlength: 255,
      trim: true,
    },
    payerPhoneE164: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true,
    },
    payerEmail: {
      type: String,
      maxlength: 255,
      trim: true,
      lowercase: true,
      default: null,
    },
    country: {
      type: String,
      maxlength: 64,
      trim: true,
      default: null,
    },
    state: {
      type: String,
      maxlength: 128,
      trim: true,
      default: null,
    },
    isGroup: {
      type: Boolean,
      required: true,
      default: false,
    },
    groupName: {
      type: String,
      maxlength: 255,
      trim: true,
      default: null,
    },
    attendanceCounts: {
      physically: { type: Number, min: 0, default: 0 },
      online: { type: Number, min: 0, default: 0 },
      not_sure: { type: Number, min: 0, default: 0 },
    },
    attendanceMode: {
      type: String,
      enum: ATTENDANCE_MODES,
      required: true,
      default: 'not_sure',
    },
    // Individual KPI data.
    gender: {
      type: String,
      enum: GENDERS,
      default: null,
    },
    firstTime: {
      type: Boolean,
      default: false,
    },
    isMinor: {
      type: Boolean,
      default: false,
    },
    // Group KPI data. Counts cover every paid participant, including children.
    genderCounts: {
      male: { type: Number, min: 0, default: 0 },
      female: { type: Number, min: 0, default: 0 },
    },
    firstTimeCounts: {
      yes: { type: Number, min: 0, default: 0 },
      no: { type: Number, min: 0, default: 0 },
    },
    inviteeCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    hasChildren: {
      type: Boolean,
      default: false,
    },
    childCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    // Number of paid participants this order holds; powers the per-ticket-type cap.
    seats: {
      type: Number,
      min: 0,
      default: null,
    },
    ticketTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TicketType',
      default: null,
    },
    paidAt: { type: Date, default: null },
    idempotencyKey: {
      type: String,
      required: true,
      maxlength: 128,
      unique: true,
      trim: true,
    },
    expiresAt: { type: Date, default: null },
  },
  { collection: 'orders', timestamps: true },
);

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT
// ─────────────────────────────────────────────────────────────────────────────

export interface PaymentDoc extends mongoose.Document {
  orderId: mongoose.Types.ObjectId;
  provider: (typeof PAYMENT_PROVIDERS)[number];
  providerRef: string | null;
  providerChargeId?: string | null;
  status: (typeof PAYMENT_STATUSES)[number];
  currency: (typeof CURRENCIES)[number];
  amountMinor: number;
  providerFeeMinor?: number | null;
  rawPayloadHash?: string | null;
  rawPayload?: unknown;
  webhookEventId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new mongoose.Schema<PaymentDoc>(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    provider: {
      type: String,
      enum: PAYMENT_PROVIDERS,
      required: true,
    },
    // Null at `initiated`; populated from provider init/webhook response.
    providerRef: {
      type: String,
      maxlength: 255,
      trim: true,
      default: null,
    },
    // Provider-side charge/capture id (Paystack reference / Flutterwave flw_ref).
    providerChargeId: {
      type: String,
      maxlength: 255,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      required: true,
      default: 'initiated',
    },
    currency: {
      type: String,
      enum: CURRENCIES,
      required: true,
    },
    amountMinor: {
      type: Number,
      required: true,
      min: 0,
    },
    // Actual fee charged by the provider, learned from webhook.
    providerFeeMinor: {
      type: Number,
      min: 0,
      default: null,
    },
    rawPayloadHash: {
      type: String,
      maxlength: 64,
      trim: true,
      default: null,
    },
    // Full webhook body, stored as-is for replay / reconciliation.
    rawPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    // Paystack: event.id; Flutterwave: webhook id / data.id. Used for idempotency.
    webhookEventId: {
      type: String,
      maxlength: 255,
      trim: true,
      default: null,
    },
  },
  { collection: 'payments', timestamps: true },
);

// ─────────────────────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────────────────────

orderSchema.index({ status: 1, paidAt: -1 });
orderSchema.index({ status: 1, expiresAt: 1 });
orderSchema.index({ payerPhoneE164: 1 });
orderSchema.index({ payerEmail: 1 });
orderSchema.index({ ticketTypeId: 1, status: 1 });
orderSchema.index({ country: 1 });
orderSchema.index({ state: 1 });

paymentSchema.index({ orderId: 1, status: 1 });
paymentSchema.index({ provider: 1, providerRef: 1 }, { unique: true, sparse: true });
paymentSchema.index({ provider: 1, webhookEventId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ provider: 1, status: 1 });

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export const Order =
  (mongoose.models.Order as mongoose.Model<OrderDoc>) ||
  mongoose.model<OrderDoc>('Order', orderSchema);

export const Payment =
  (mongoose.models.Payment as mongoose.Model<PaymentDoc>) ||
  mongoose.model<PaymentDoc>('Payment', paymentSchema);