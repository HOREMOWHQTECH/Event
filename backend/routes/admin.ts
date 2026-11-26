import crypto from 'crypto';
import express from 'express';
import type { Request, Response } from 'express';

import { Order } from '../schema/orders.ts';
import { Participant, Group } from '../schema/participants.ts';
import { ScanEvent } from '../schema/scans.ts';
import { CURRENCIES } from '../constants/enums.ts';
import { authenticateStaff, requireRole } from './auth.ts';
import { listPaidPayments, recordGateScan } from '../lib/gate-scan.ts';

const router = express.Router();

function accessTokenFor(orderId: unknown): string {
  const secret = process.env.QR_TOKEN_SECRET;
  if (!secret || secret.length < 16) return '';
  return tokenDigest('order-access:' + String(orderId), secret);
}

function qrTokenFor(participantId: unknown): string {
  const secret = process.env.QR_TOKEN_SECRET;
  if (!secret || secret.length < 16) return '';
  return tokenDigest('participant:' + String(participantId), secret);
}

function tokenDigest(value: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url').slice(0, 32);
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/dashboard-stats — paid-only attendance/KPI aggregation
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  '/admin/dashboard-stats',
  authenticateStaff,
  requireRole('admin'),
  async (_req: Request, res: Response) => {
    try {
      const empty = {
        totalPaidParticipants: 0,
        attendanceTotals: { physically: 0, online: 0, not_sure: 0 },
        genderTotals: { male: 0, female: 0 },
        firstTimeTotals: { yes: 0, no: 0 },
        children: 0,
        qrScans: 0,
        scannedParticipants: 0,
        checkedInParticipants: 0,
        byState: [] as Array<{ name: string; total: number }>,
        byNation: [] as Array<{ name: string; total: number }>,
        financeByCurrency: [] as Array<{
          currency: string;
          orders: number;
          seats: number;
          grossMinor: number;
          feeMinor: number;
          netMinor: number;
        }>,
      };

      const [kpiRows, scanRows, locationRows, financeRows] = await Promise.all([
        Order.aggregate([
          { $match: { status: 'paid' } },
          {
            $project: {
              seats: { $ifNull: ['$seats', 0] },
              isGroup: { $eq: ['$isGroup', true] },
              attendanceMode: { $ifNull: ['$attendanceMode', 'not_sure'] },
              attendanceCounts: { $ifNull: ['$attendanceCounts', {}] },
              gender: { $ifNull: ['$gender', null] },
              genderCounts: { $ifNull: ['$genderCounts', {}] },
              firstTime: { $eq: ['$firstTime', true] },
              firstTimeCounts: { $ifNull: ['$firstTimeCounts', {}] },
              isMinor: { $eq: ['$isMinor', true] },
              hasChildren: { $eq: ['$hasChildren', true] },
              childCount: { $ifNull: ['$childCount', 0] },
              country: { $ifNull: ['$country', 'Unknown'] },
              state: { $ifNull: ['$state', null] },
            },
          },
          {
            $group: {
              _id: null,
              totalPaidParticipants: { $sum: '$seats' },
              physically: {
                $sum: {
                  $cond: [
                    '$isGroup',
                    { $ifNull: ['$attendanceCounts.physically', 0] },
                    { $cond: [{ $eq: ['$attendanceMode', 'physically'] }, '$seats', 0] },
                  ],
                },
              },
              online: {
                $sum: {
                  $cond: [
                    '$isGroup',
                    { $ifNull: ['$attendanceCounts.online', 0] },
                    { $cond: [{ $eq: ['$attendanceMode', 'online'] }, '$seats', 0] },
                  ],
                },
              },
              not_sure: {
                $sum: {
                  $cond: [
                    '$isGroup',
                    { $ifNull: ['$attendanceCounts.not_sure', 0] },
                    { $cond: [{ $eq: ['$attendanceMode', 'not_sure'] }, '$seats', 0] },
                  ],
                },
              },
              male: {
                $sum: {
                  $cond: [
                    '$isGroup',
                    { $ifNull: ['$genderCounts.male', 0] },
                    { $cond: [{ $eq: ['$gender', 'male'] }, '$seats', 0] },
                  ],
                },
              },
              female: {
                $sum: {
                  $cond: [
                    '$isGroup',
                    { $ifNull: ['$genderCounts.female', 0] },
                    { $cond: [{ $eq: ['$gender', 'female'] }, '$seats', 0] },
                  ],
                },
              },
              firstYes: {
                $sum: {
                  $cond: [
                    '$isGroup',
                    { $ifNull: ['$firstTimeCounts.yes', 0] },
                    { $cond: ['$firstTime', '$seats', 0] },
                  ],
                },
              },
              firstNo: {
                $sum: {
                  $cond: [
                    '$isGroup',
                    { $ifNull: ['$firstTimeCounts.no', 0] },
                    { $cond: ['$firstTime', 0, '$seats'] },
                  ],
                },
              },
              children: {
                $sum: {
                  $cond: [
                    '$isGroup',
                    { $cond: ['$hasChildren', '$childCount', 0] },
                    { $cond: ['$isMinor', '$seats', 0] },
                  ],
                },
              },
            },
          },
        ]),
        ScanEvent.aggregate([
          { $match: { result: 'valid' } },
          {
            $group: {
              _id: null,
              qrScans: { $sum: 1 },
              scannedParticipants: { $sum: { $ifNull: ['$seats', 1] } },
            },
          },
        ]),
        Order.aggregate([
          { $match: { status: 'paid' } },
          {
            $project: {
              seats: { $ifNull: ['$seats', 0] },
              nation: {
                $cond: [
                  { $in: [{ $ifNull: ['$country', ''] }, ['', null]] },
                  'Unknown',
                  '$country',
                ],
              },
              state: {
                $cond: [
                  { $in: [{ $ifNull: ['$state', ''] }, ['', null]] },
                  null,
                  '$state',
                ],
              },
            },
          },
          {
            $facet: {
              states: [
                { $match: { state: { $ne: null } } },
                {
                  $group: {
                    _id: { nation: '$nation', state: '$state' },
                    total: { $sum: '$seats' },
                  },
                },
                { $sort: { total: -1, '_id.state': 1 } },
                { $limit: 12 },
                {
                  $project: {
                    name: {
                      $cond: [
                        { $eq: ['$_id.nation', 'Nigeria'] },
                        '$_id.state',
                        { $concat: ['$_id.state', ' · ', '$_id.nation'] },
                      ],
                    },
                    total: 1,
                    _id: 0,
                  },
                },
              ],
              nations: [
                { $group: { _id: '$nation', total: { $sum: '$seats' } } },
                { $sort: { total: -1, _id: 1 } },
                { $limit: 12 },
                { $project: { name: '$_id', total: 1, _id: 0 } },
              ],
            },
          },
        ]),
        // Verified money in, grouped by currency. Every supported currency is
        // returned even when it has no paid orders yet.
        Order.aggregate([
          { $match: { status: 'paid' } },
          {
            $group: {
              _id: { $ifNull: ['$currency', 'NGN'] },
              orders: { $sum: 1 },
              seats: { $sum: { $ifNull: ['$seats', 0] } },
              grossMinor: { $sum: { $ifNull: ['$totalMinor', 0] } },
              feeMinor: { $sum: { $ifNull: ['$feeMinor', 0] } },
            },
          },
          {
            $project: {
              _id: 0,
              currency: '$_id',
              orders: 1,
              seats: 1,
              grossMinor: 1,
              feeMinor: 1,
              netMinor: { $subtract: ['$grossMinor', '$feeMinor'] },
            },
          },
          { $sort: { currency: 1 } },
        ]),
      ]);

      const kpi = (kpiRows[0] as any) || {};
      const scans = (scanRows[0] as any) || {};
      const locations = (locationRows[0] as any) || {};

      const financeByCurrency = CURRENCIES.map((currency) => {
        const row = (financeRows as any[]).find((item) => item.currency === currency);
        return {
          currency,
          orders: Number(row?.orders) || 0,
          seats: Number(row?.seats) || 0,
          grossMinor: Number(row?.grossMinor) || 0,
          feeMinor: Number(row?.feeMinor) || 0,
          netMinor: Number(row?.netMinor) || 0,
        };
      });

      const checkedInCount = await Participant.countDocuments({
        status: 'checked_in',
        deletedAt: null,
      });

      return res.json({
        ...empty,
        totalPaidParticipants: Number(kpi.totalPaidParticipants) || 0,
        attendanceTotals: {
          physically: Number(kpi.physically) || 0,
          online: Number(kpi.online) || 0,
          not_sure: Number(kpi.not_sure) || 0,
        },
        genderTotals: {
          male: Number(kpi.male) || 0,
          female: Number(kpi.female) || 0,
        },
        firstTimeTotals: {
          yes: Number(kpi.firstYes) || 0,
          no: Number(kpi.firstNo) || 0,
        },
        children: Number(kpi.children) || 0,
        qrScans: Number(scans.qrScans) || 0,
        scannedParticipants: Number(scans.scannedParticipants) || 0,
        checkedInParticipants: Number(scans.scannedParticipants) || checkedInCount || 0,
        byState: Array.isArray(locations.states) ? locations.states : [],
        byNation: Array.isArray(locations.nations) ? locations.nations : [],
        financeByCurrency,
      });
    } catch (err) {
      console.error('[GET /admin/dashboard-stats] error:', err);
      return res.status(500).json({ error: 'Failed to load dashboard statistics' });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/participants
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  '/admin/participants',
  authenticateStaff,
  requireRole('staff'),
  async (_req: Request, res: Response) => {
    try {
      const participants = await Participant.find({ deletedAt: null })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
      return res.json({
        participants: participants.map((att: any) => ({ ...att, id: String(att._id) })),
      });
    } catch (err) {
      console.error('[GET /admin/participants] error:', err);
      return res.status(500).json({ error: 'Failed to load participants' });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/payments (and legacy /api/admin/orders alias)
// ─────────────────────────────────────────────────────────────────────────────
async function paymentsHandler(_req: Request, res: Response) {
  try {
    const payments = await listPaidPayments(200);
    return res.json({ payments, orders: payments });
  } catch (err) {
    console.error('[GET /admin/payments] error:', err);
    return res.status(500).json({ error: 'Failed to load payments' });
  }
}

router.get('/admin/payments', authenticateStaff, requireRole('admin'), paymentsHandler);
router.get('/admin/orders', authenticateStaff, requireRole('admin'), paymentsHandler);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/tickets/:reference
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  '/admin/tickets/:reference',
  authenticateStaff,
  requireRole('admin'),
  async (req: Request, res: Response) => {
    try {
      const order: any = await Order.findOne({ reference: req.params.reference, status: 'paid' }).lean();
      if (!order) return res.status(404).json({ error: 'Paid order not found' });

      const participants: any[] = await Participant.find({ orderId: order._id, deletedAt: null }).lean();
      const group: any = order.isGroup ? await Group.findOne({ orderId: order._id }).lean() : null;

      return res.json({
        order: {
          id: String(order._id),
          reference: order.reference,
          status: order.status,
          isGroup: order.isGroup,
          totalMinor: order.totalMinor,
          currency: order.currency,
        },
        participants: participants.map((att) => ({
          id: String(att._id),
          refCode: att.refCode,
          name: att.name,
          chapterZone: att.chapterZone,
          status: att.status,
          qrToken: qrTokenFor(att._id),
        })),
        group: group
          ? {
              id: String(group._id),
              managementToken: group.managementToken,
              totalSeats: group.totalSeats,
              claimedSeats: group.claimedSeats,
              qrToken: `HGCGROUP.${String(order._id)}.${accessTokenFor(order._id)}`,
            }
          : null,
      });
    } catch (err) {
      console.error('[GET /admin/tickets/:reference] error:', err);
      return res.status(500).json({ error: 'Failed to load ticket data' });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/scan — gate check-in (individual or whole group)
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  '/admin/scan',
  authenticateStaff,
  requireRole('staff'),
  async (req: Request, res: Response) => {
    try {
      const response = await recordGateScan({
        qrToken: req.body?.qrToken,
        standId: req.body?.standId,
        staffId: (req as any).staff?._id,
        scanType: req.body?.scanType || 'arrival',
        clientTimestamp: req.body?.clientTimestamp,
        idempotencyKey: req.body?.idempotencyKey,
      });
      if (response.result === 'forged') return res.status(404).json(response);
      if (response.result === 'already_checked_in') return res.status(409).json(response);
      return res.json(response);
    } catch (err: any) {
      console.error('[POST /admin/scan] error:', err);
      return res.status(400).json({ error: err?.message || 'Scan processing failed' });
    }
  }
);

export default router;
