// routes/scans.ts
import express from 'express';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';

import { Device, ScanEvent } from '../schema/scans.ts';
import { SCAN_TYPES } from '../constants/enums.ts';
import { authenticateStaff, requireRole } from './auth.ts';
import { recordGateScan } from '../lib/gate-scan.ts';

const router = express.Router();

interface AuthRequest extends Request {
  staff?: mongoose.Document & {
    _id: mongoose.Types.ObjectId;
    role: string;
    isActive: boolean;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/scans — record an arrival scan
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  '/scans',
  authenticateStaff,
  requireRole('staff'),
  async (req: AuthRequest, res: Response) => {
    try {
      const body = req.body || {};
      if (!body.qrToken || typeof body.qrToken !== 'string') {
        return res.status(400).json({ error: 'qrToken is required' });
      }
      if (!body.scanType || !SCAN_TYPES.includes(body.scanType)) {
        return res.status(400).json({ error: `scanType must be one of: ${SCAN_TYPES.join(', ')}` });
      }
      if (!body.standId || typeof body.standId !== 'string') {
        return res.status(400).json({ error: 'standId is required' });
      }
      if (!body.clientTimestamp) {
        return res.status(400).json({ error: 'clientTimestamp is required' });
      }
      if (!body.idempotencyKey || typeof body.idempotencyKey !== 'string') {
        return res.status(400).json({ error: 'idempotencyKey is required' });
      }

      let device: any = null;
      if (body.deviceFingerprint) {
        device = await Device.findOne({ deviceFingerprint: body.deviceFingerprint }).lean();
        if (device?.isRevoked) {
          return res.status(200).json({ result: 'forged', error: 'Device is revoked' });
        }
      }

      const response = await recordGateScan({
        qrToken: body.qrToken,
        scanType: body.scanType,
        standId: body.standId,
        staffId: req.staff!._id,
        deviceId: device?._id,
        clientTimestamp: body.clientTimestamp,
        idempotencyKey: body.idempotencyKey,
        notes: body.notes,
      });

      if (response.result === 'forged') return res.status(200).json(response);
      if (response.result === 'already_checked_in') return res.status(200).json(response);
      return res.status(200).json(response);
    } catch (err: any) {
      console.error('[POST /scans]', err);
      return res.status(400).json({ error: err?.message || 'Failed to record scan' });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/scans/participant/:id
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  '/scans/participant/:id',
  authenticateStaff,
  requireRole('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid participant id' });
      }
      const scans = await ScanEvent.find({ participantId: req.params.id })
        .sort({ clientTimestamp: -1 })
        .limit(50)
        .lean();
      return res.json({ scans });
    } catch (err) {
      console.error('[GET /scans/participant/:id]', err);
      return res.status(500).json({ error: 'Failed to load scans' });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/scans/stand/:standId/today
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  '/scans/stand/:standId/today',
  authenticateStaff,
  requireRole('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const scans = await ScanEvent.find({
        standId: req.params.standId,
        clientTimestamp: { $gte: startOfDay },
      })
        .sort({ clientTimestamp: -1 })
        .limit(200)
        .lean();
      return res.json({ scans });
    } catch (err) {
      console.error('[GET /scans/stand/:standId/today]', err);
      return res.status(500).json({ error: 'Failed to load scans' });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/scans/conflicts
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  '/scans/conflicts',
  authenticateStaff,
  requireRole('admin'),
  async (_req: AuthRequest, res: Response) => {
    try {
      const conflicts = await ScanEvent.find({
        result: { $in: ['conflict', 'already_checked_in', 'invalid_signature', 'forged'] },
      })
        .sort({ serverTimestamp: -1 })
        .limit(100)
        .lean();
      return res.json({
        conflicts: conflicts.map((event: any) => ({
          id: String(event._id),
          result: event.result,
          standId: event.standId,
          clientTimestamp: event.clientTimestamp,
          serverTimestamp: event.serverTimestamp,
          seats: event.seats || 1,
          isGroupScan: !!event.isGroupScan,
          notes: event.notes || null,
        })),
      });
    } catch (err) {
      console.error('[GET /scans/conflicts]', err);
      return res.status(500).json({ error: 'Failed to load scan conflicts' });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/scans/stats
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  '/scans/stats',
  authenticateStaff,
  requireRole('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const match: Record<string, unknown> = {};
      if (req.query.standId) match.standId = String(req.query.standId);
      if (req.query.since) {
        const since = new Date(String(req.query.since));
        if (!isNaN(since.getTime())) match.clientTimestamp = { $gte: since };
      }
      const groups = await ScanEvent.aggregate([
        { $match: match },
        {
          $group: {
            _id: { scanType: '$scanType', result: '$result' },
            scans: { $sum: 1 },
            seats: { $sum: { $ifNull: ['$seats', 1] } },
          },
        },
        { $sort: { '_id.scanType': 1, '_id.result': 1 } },
      ]);
      return res.json({ stats: groups });
    } catch (err) {
      console.error('[GET /scans/stats]', err);
      return res.status(500).json({ error: 'Failed to load stats' });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/devices/heartbeat
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  '/devices/heartbeat',
  authenticateStaff,
  async (req: AuthRequest, res: Response) => {
    try {
      const { deviceFingerprint } = req.body || {};
      if (!deviceFingerprint) {
        return res.status(400).json({ error: 'deviceFingerprint is required' });
      }
      const device = await Device.findOneAndUpdate(
        { deviceFingerprint },
        { $set: { lastSyncAt: new Date() } },
        { new: true }
      ).lean();
      if (!device) return res.status(404).json({ error: 'Device not registered' });
      return res.json({ device });
    } catch (err) {
      console.error('[POST /devices/heartbeat]', err);
      return res.status(500).json({ error: 'Failed to record heartbeat' });
    }
  }
);

export default router;
