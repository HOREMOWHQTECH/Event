import mongoose from 'mongoose';

import { ATTENDANCE_MODES, CURRENCIES, GENDERS, PARTICIPANT_STATUSES } from '../constants/enums.ts';

// TICKET TYPE

const ticketTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 128,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    prices: [
      {
        currency: {
          type: String,
          enum: { values: CURRENCIES },
          required: true,
        },
        amountMinor: {
          type: Number,
          required: true,
          min: 0,
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'ticket_types' }
);

ticketTypeSchema.path('prices').validate(function (prices) {
  const seen = new Set();
  for (const price of prices) {
    if (seen.has(price.currency)) return false;
    seen.add(price.currency);
  }
  return true;
}, 'Duplicate currency in ticket prices');

ticketTypeSchema.pre('save', function () {
  if (Array.isArray(this.prices)) {
    this.prices.forEach((price) => {
      if (price.isModified && price.isModified('amountMinor')) {
        price.updatedAt = new Date();
      }
    });
  }
});

// GROUP

const groupSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    chapterZoneName: {
      type: String,
      required: true,
      maxlength: 255,
      trim: true,
    },
    leaderName: {
      type: String,
      required: true,
      maxlength: 255,
      trim: true,
    },
    leaderPhoneE164: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true,
    },
    leaderEmail: {
      type: String,
      maxlength: 255,
      trim: true,
      lowercase: true,
    },
    country: {
      type: String,
      maxlength: 64,
      trim: true,
    },
    state: {
      type: String,
      maxlength: 128,
      trim: true,
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },
    attendanceCounts: {
      physically: { type: Number, min: 0, default: 0 },
      online: { type: Number, min: 0, default: 0 },
      not_sure: { type: Number, min: 0, default: 0 },
    },
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
    claimedSeats: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    checkedInAt: { type: Date, default: null },
    managementToken: {
      type: String,
      required: true,
      maxlength: 64,
      unique: true,
      trim: true,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'groups' }
);

groupSchema.pre('save', function () {
  this.updatedAt = new Date();
});

// PARTICIPANT

const participantSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      default: null,
    },
    ticketTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TicketType',
      required: true,
    },
    refCode: {
      type: String,
      required: true,
      maxlength: 16,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 255,
      trim: true,
    },
    phoneE164: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true,
    },
    email: {
      type: String,
      maxlength: 255,
      trim: true,
      lowercase: true,
    },
    country: {
      type: String,
      required: true,
      maxlength: 64,
      default: 'Nigeria',
      trim: true,
    },
    state: {
      type: String,
      maxlength: 128,
      trim: true,
    },
    chapterZone: {
      type: String,
      maxlength: 255,
      trim: true,
    },
    attendanceMode: {
      type: String,
      enum: { values: ATTENDANCE_MODES },
      required: true,
      default: 'not_sure',
    },
    gender: {
      type: String,
      enum: { values: GENDERS },
      default: null,
    },
    firstTime: {
      type: Boolean,
      default: false,
    },
    isChild: {
      type: Boolean,
      required: true,
      default: false,
    },
    isMinor: {
      type: Boolean,
      required: true,
      default: false,
    },
    guardianName: {
      type: String,
      maxlength: 255,
      trim: true,
    },
    guardianPhoneE164: {
      type: String,
      maxlength: 32,
      trim: true,
    },
    status: {
      type: String,
      enum: { values: PARTICIPANT_STATUSES },
      required: true,
      default: 'unconfirmed',
    },
    qrTokenHash: {
      type: String,
      required: true,
      maxlength: 64,
      unique: true,
      trim: true,
    },
    checkedInAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
  },
  { collection: 'participants' }
);

participantSchema.pre('save', function () {
  this.updatedAt = new Date();
});

// GROUP SEAT

const groupSeatSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    inviteCode: {
      type: String,
      required: true,
      maxlength: 32,
      unique: true,
      trim: true,
    },
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant',
      default: null,
    },
    isClaimed: {
      type: Boolean,
      required: true,
      default: false,
    },
    claimedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'group_seats' }
);

// INDEXES

ticketTypeSchema.index({ isActive: 1 });
ticketTypeSchema.index({ 'prices.currency': 1 });

groupSchema.index({ orderId: 1 });

participantSchema.index({ phoneE164: 1 });
participantSchema.index({ email: 1 });
participantSchema.index({ orderId: 1 });
participantSchema.index({ groupId: 1 });
participantSchema.index({ status: 1 });
participantSchema.index(
  { deletedAt: 1 },
  { partialFilterExpression: { deletedAt: { $type: 'date' } } }
);

groupSeatSchema.index({ groupId: 1 });
groupSeatSchema.index({ participantId: 1 });

// EXPORTS

export const TicketType = (mongoose.models.TicketType || mongoose.model('TicketType', ticketTypeSchema)) as mongoose.Model<any>;
export const Group = (mongoose.models.Group || mongoose.model('Group', groupSchema)) as mongoose.Model<any>;
export const Participant = (mongoose.models.Participant || mongoose.model('Participant', participantSchema)) as mongoose.Model<any>;
export const GroupSeat = (mongoose.models.GroupSeat || mongoose.model('GroupSeat', groupSeatSchema)) as mongoose.Model<any>;
