// routes/auth.ts
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { hashPassword, verifyPassword, getHasherName } from "../lib/password.ts";
import mongoose from 'mongoose';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { authenticator } = require('otplib');

import { StaffUser, Session, AuditLog } from '../schema/auth.ts';
import { STAFF_ROLES } from '../constants/enums.ts';

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface AuthRequest extends Request {
  staff?: mongoose.Document & {
    _id: mongoose.Types.ObjectId;
    role: (typeof STAFF_ROLES)[number];
    isActive: boolean;
    username: string;
    fullName: string;
    email?: string | null;
    totpEnabled?: boolean;
    createdAt?: Date;
  };
}

const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE (re-exported so other routers can import it)
// ─────────────────────────────────────────────────────────────────────────────

export function authenticateStaff(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  (async () => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthenticated' });

    const session = await Session.findById(token).populate('userId').lean();
    if (!session || session.revoked || session.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
    
    const staff = session.userId as any;
    if (!staff || !staff.isActive) {
      return res.status(403).json({ error: 'Account disabled' });
    }
    
    req.staff = staff;
    next();
  })().catch(next);
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.staff) {
      res.status(401).json({ error: 'Unauthenticated' });
      return;
    }
    // Admin is a superuser: every staff-protected route stays available.
    if (req.staff.role !== 'admin' && !roles.includes(req.staff.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function generateSessionToken(): string {
  return crypto.randomBytes(64).toString('hex'); // 128 hex chars
}

async function logAudit(entry: {
  staffId: mongoose.Types.ObjectId | null;
  action: string;
  entityType: string;
  entityId: string;
  oldState?: unknown;
  newState?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  try {
    await AuditLog.create({
      staffId: entry.staffId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      oldState: entry.oldState ?? null,
      newState: entry.newState ?? null,
      ipAddress: entry.ipAddress ?? null,
      userAgent: entry.userAgent ?? null,
    });
  } catch (err) {
    // Audit failures must never break the request.
    console.error('[auditLog]', err);
  }
}

function clientContext(req: Request) {
  return {
    ipAddress:
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      null,
    userAgent: req.headers['user-agent'] || null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────

router.post('/auth/login', async (req: Request, res: Response) => {
  const { username, password, totpCode } = req.body || {};
  const ctx = clientContext(req);

  try {
    // ── 1. Basic validation ────────────────────────────────────────────────
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    // ── 2. Load staff, including the sensitive hash fields ────────────────
    const staff = await StaffUser.findOne({
      username: String(username).trim().toLowerCase(),
    }).select('+passwordHash +totpSecret');

    if (!staff) {
      await logAudit({
        staffId: null,
        action: 'staff_login_failed',
        entityType: 'StaffUser',
        entityId: String(username),
        newState: { reason: 'unknown_username' },
        ...ctx,
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!staff.isActive) {
      await logAudit({
        staffId: staff._id,
        action: 'staff_login_failed',
        entityType: 'StaffUser',
        entityId: String(staff._id),
        newState: { reason: 'inactive' },
        ...ctx,
      });
      return res.status(403).json({ error: 'Account is inactive' });
    }

    // ── 3. Verify password ────────────────────────────────────────────────
    const passwordOk = await verifyPassword(staff.passwordHash, password);
    if (!passwordOk) {
      await logAudit({
        staffId: staff._id,
        action: 'staff_login_failed',
        entityType: 'StaffUser',
        entityId: String(staff._id),
        newState: { reason: 'bad_password' },
        ...ctx,
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // ── 4. TOTP if enabled ────────────────────────────────────────────────
    if (staff.totpEnabled) {
      if (!totpCode) {
        return res.status(401).json({
          error: 'TOTP code required',
          requiresTotp: true,
        });
      }
      const ok = authenticator.check(String(totpCode), staff.totpSecret!);
      if (!ok) {
        await logAudit({
          staffId: staff._id,
          action: 'staff_login_failed',
          entityType: 'StaffUser',
          entityId: String(staff._id),
          newState: { reason: 'bad_totp' },
          ...ctx,
        });
        return res.status(401).json({ error: 'Invalid TOTP code' });
      }
    }

    // ── 5. Create session ─────────────────────────────────────────────────
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await Session.create({
      _id: token,
      userId: staff._id,
      expiresAt,
      revoked: false,
    });

    await logAudit({
      staffId: staff._id,
      action: 'staff_login_success',
      entityType: 'StaffUser',
      entityId: String(staff._id),
      newState: { role: staff.role, totp: !!staff.totpEnabled },
      ...ctx,
    });

    return res.json({
      session: { token, expiresAt },
      staff: {
        id: staff._id,
        username: staff.username,
        fullName: staff.fullName,
        role: staff.role,
        totpEnabled: staff.totpEnabled,
      },
    });
  } catch (err) {
    console.error('[POST /auth/login]', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/logout — revoke the current session
// ─────────────────────────────────────────────────────────────────────────────

router.post(
  '/auth/logout',
  authenticateStaff,
  async (req: AuthRequest, res: Response) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        await Session.updateOne({ _id: token }, { $set: { revoked: true } });
      }
      await logAudit({
        staffId: req.staff!._id,
        action: 'staff_logout',
        entityType: 'Session',
        entityId: token || 'unknown',
        ...clientContext(req),
      });
      return res.status(204).send();
    } catch (err) {
      console.error('[POST /auth/logout]', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me — current staff profile
// ─────────────────────────────────────────────────────────────────────────────

router.get('/auth/me', authenticateStaff, async (req: AuthRequest, res: Response) => {
  const staff = req.staff!;
  
  return res.json({
    staff: {
      id: staff._id,
      username: staff.username,
      fullName: staff.fullName,
      email: staff.email || null,
      role: staff.role,
      totpEnabled: !!staff.totpEnabled,
      isActive: staff.isActive,
      createdAt: staff.createdAt,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/password — change own password
// ─────────────────────────────────────────────────────────────────────────────

router.post(
  '/auth/password',
  authenticateStaff,
  async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body || {};
    const ctx = clientContext(req);

    try {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'currentPassword and newPassword are required' });
      }
      if (String(newPassword).length < 12) {
        return res.status(400).json({ error: 'newPassword must be at least 12 characters' });
      }

      const staff = await StaffUser.findById(req.staff!._id).select('+passwordHash');
      if (!staff) return res.status(404).json({ error: 'Staff not found' });

      const ok = await verifyPassword(staff.passwordHash, currentPassword);
      if (!ok) {
        await logAudit({
          staffId: staff._id,
          action: 'staff_password_change_failed',
          entityType: 'StaffUser',
          entityId: String(staff._id),
          newState: { reason: 'bad_current_password' },
          ...ctx,
        });
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      const newHash = await hashPassword(newPassword);

      staff.passwordHash = newHash;
      await staff.save();

      // Revoke all other sessions on password change
      const token = req.headers.authorization?.replace('Bearer ', '');
      await Session.updateMany(
        { userId: staff._id, _id: { $ne: token } },
        { $set: { revoked: true } }
      );

      await logAudit({
        staffId: staff._id,
        action: 'staff_password_changed',
        entityType: 'StaffUser',
        entityId: String(staff._id),
        ...ctx,
      });

      return res.status(204).send();
    } catch (err) {
      console.error('[POST /auth/password]', err);
      return res.status(500).json({ error: 'Password change failed' });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// STAFF MANAGEMENT (admin only)
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/auth/staff — create a new staff account
router.post(
  '/auth/staff',
  authenticateStaff,
  requireRole('admin'),
  async (req: AuthRequest, res: Response) => {
    const { fullName, username, email, password, role } = req.body || {};
    const ctx = clientContext(req);

    try {
      if (!fullName || !username || !password) {
        return res.status(400).json({ error: 'fullName, username and password are required' });
      }
      if (String(password).length < 12) {
        return res.status(400).json({ error: 'password must be at least 12 characters' });
      }
      if (role && !STAFF_ROLES.includes(role)) {
        return res.status(400).json({ error: `role must be one of: ${STAFF_ROLES.join(', ')}` });
      }

      const passwordHash = await hashPassword(password);

      const staff = await StaffUser.create({
        fullName: String(fullName).trim(),
        username: String(username).trim().toLowerCase(),
        email: email ? String(email).trim().toLowerCase() : null,
        passwordHash,
        role: role || 'staff',
        isActive: true,
      });

      await logAudit({
        staffId: req.staff!._id,
        action: 'staff_created',
        entityType: 'StaffUser',
        entityId: String(staff._id),
        newState: { username: staff.username, role: staff.role },
        ...ctx,
      });

      // Return without passwordHash (schema excludes it by default).
      return res.status(201).json({
        staff: {
          id: staff._id,
          fullName: staff.fullName,
          username: staff.username,
          email: staff.email || null,
          role: staff.role,
          isActive: staff.isActive,
          createdAt: staff.createdAt,
        },
      });
    } catch (err: any) {
      if (err?.code === 11000) {
        return res.status(409).json({ error: 'Username or email already exists' });
      }
      if (err?.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
      }
      console.error('[POST /auth/staff]', err);
      return res.status(500).json({ error: 'Failed to create staff' });
    }
  }
);

// GET /api/auth/staff — list staff (admin)
router.get(
  '/auth/staff',
  authenticateStaff,
  requireRole('admin'),
  async (_req: AuthRequest, res: Response) => {
    try {
      const staff = await StaffUser.find()
        .sort({ createdAt: -1 })
        .select('-passwordHash -totpSecret')
        .lean();
      return res.json({ staff });
    } catch (err) {
      console.error('[GET /auth/staff]', err);
      return res.status(500).json({ error: 'Failed to list staff' });
    }
  }
);

// PATCH /api/auth/staff/:id — update role / active state (admin)
router.patch(
  '/auth/staff/:id',
  authenticateStaff,
  requireRole('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid staff id' });
      }

      // Prevent self-demotion to avoid locking out the last admin.
      if (String(req.staff!._id) === req.params.id && req.body.role && req.body.role !== 'admin') {
        return res.status(400).json({ error: 'You cannot change your own role' });
      }

      const patch: Record<string, unknown> = {};
      
      if (req.body.role !== undefined) {
        if (!STAFF_ROLES.includes(req.body.role)) {
          return res.status(400).json({ error: `role must be one of: ${STAFF_ROLES.join(', ')}` });
        }
        patch.role = req.body.role;
      }
      if (req.body.isActive !== undefined) {
        patch.isActive = !!req.body.isActive;
      }
      if (req.body.fullName !== undefined) {
        patch.fullName = req.body.fullName;
      }
      if (req.body.email !== undefined) {
        patch.email = req.body.email ? String(req.body.email).trim().toLowerCase() : null;
      }

      if (Object.keys(patch).length === 0) {
        return res.status(400).json({ error: 'No updatable fields supplied' });
      }

      const staff = await StaffUser.findByIdAndUpdate(
        req.params.id,
        { $set: patch },
        { new: true, runValidators: true }
      );

      if (!staff) return res.status(404).json({ error: 'Staff not found' });

      // If deactivating a user, revoke their sessions immediately.
      if (patch.isActive === false) {
        await Session.updateMany({ userId: staff._id }, { $set: { revoked: true } });
      }

      await logAudit({
        staffId: req.staff!._id,
        action: 'staff_updated',
        entityType: 'StaffUser',
        entityId: String(staff._id),
        newState: patch,
        ...clientContext(req),
      });

      return res.json({
        staff: {
          id: staff._id,
          fullName: staff.fullName,
          username: staff.username,
          email: staff.email || null,
          role: staff.role,
          isActive: staff.isActive,
        },
      });
    } catch (err: any) {
      if (err?.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
      }
      console.error('[PATCH /auth/staff/:id]', err);
      return res.status(500).json({ error: 'Failed to update staff' });
    }
  }
);

// DELETE /api/auth/staff/:id — soft disable (admin). Doesn't hard-delete
// so audit history stays intact.
router.delete(
  '/auth/staff/:id',
  authenticateStaff,
  requireRole('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid staff id' });
      }
      if (String(req.staff!._id) === req.params.id) {
        return res.status(400).json({ error: 'You cannot delete your own account' });
      }

      const staff = await StaffUser.findByIdAndUpdate(
        req.params.id,
        { $set: { isActive: false } },
        { new: true }
      );
      
      if (!staff) return res.status(404).json({ error: 'Staff not found' });

      await Session.updateMany({ userId: staff._id }, { $set: { revoked: true } });

      await logAudit({
        staffId: req.staff!._id,
        action: 'staff_disabled',
        entityType: 'StaffUser',
        entityId: String(staff._id),
        ...clientContext(req),
      });

      return res.status(204).send();
    } catch (err) {
      console.error('[DELETE /auth/staff/:id]', err);
      return res.status(500).json({ error: 'Failed to disable staff' });
    }
  }
);

export default router;