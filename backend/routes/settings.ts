// routes/settings.ts
import express from 'express';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';

// Point these to your exact schema files (based on your project structure)
import { EventSettings, ProviderRoute, Minister, ProgrammeItem } from '../schema/settings.ts';
import { TicketType } from '../schema/participants.ts';
import { CURRENCIES, PAYMENT_PROVIDERS, FEE_POLICIES } from '../constants/enums.ts'; 

import { authenticateStaff, requireRole } from './auth.ts';

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface AuthRequest extends Request {
  staff?: mongoose.Document & {
    _id: mongoose.Types.ObjectId;
    role: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Load the singleton settings doc, creating it with defaults if missing.
 * Safe under concurrency — `upsert` + `$setOnInsert` means the loser sees
 * the winner's document, not a duplicate-key error.
 */
async function getEventSettings() {
  return EventSettings.findOneAndUpdate(
    { singleton: 'event' },
    { $setOnInsert: { singleton: 'event' } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

/**
 * Drop `undefined` keys so `$set` doesn't accidentally null out fields the
 * caller didn't mention. PATCH semantics for a body that might omit fields.
 */
function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) (out as any)[k] = v;
  }
  return out;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const EVENT_FIELDS = [
  'eventName',
  'theme',
  'datesText',
  'heroDatesLabel',
  'openingTimeLabel',
  'registrationFeeLabel',
  'whyAttendIntro',
  'flyerDescription',
  'startsAt',
  'endsAt',
  'registrationDeadline',
  'venueName',
  'venueAddress',
  'venueMapUrl',
  'contactPhone',
  'contactEmail',
  'capacityLimit',
  'capacityAlertThresholds',
] as const;

function buildEventPatch(body: any): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  for (const key of EVENT_FIELDS) {
    if (body?.[key] !== undefined) patch[key] = body[key];
  }
  if (typeof patch.capacityAlertThresholds === 'string') {
    patch.capacityAlertThresholds = String(patch.capacityAlertThresholds)
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((v) => Number.isFinite(v));
  }
  return patch;
}

function eventPatchError(patch: Record<string, unknown>): string | null {
  if (patch.startsAt && patch.endsAt) {
    if (new Date(String(patch.startsAt)) >= new Date(String(patch.endsAt))) {
      return 'startsAt must be before endsAt';
    }
  }
  if (patch.registrationDeadline && patch.startsAt) {
    if (new Date(String(patch.registrationDeadline)) > new Date(String(patch.startsAt))) {
      return 'registrationDeadline must not be after startsAt';
    }
  }
  return null;
}

function routePatchError(patch: Record<string, unknown>): string | null {
  if (patch.primaryProvider && !PAYMENT_PROVIDERS.includes(patch.primaryProvider as any)) {
    return `primaryProvider must be one of: ${PAYMENT_PROVIDERS.join(', ')}`;
  }
  if (patch.fallbackProvider && !PAYMENT_PROVIDERS.includes(patch.fallbackProvider as any)) {
    return `fallbackProvider must be one of: ${PAYMENT_PROVIDERS.join(', ')}`;
  }
  if (patch.feePolicy && !FEE_POLICIES.includes(patch.feePolicy as any)) {
    return `feePolicy must be one of: ${FEE_POLICIES.join(', ')}`;
  }
  return null;
}

async function getStandardTicketType() {
  const pinned = process.env.STANDARD_TICKET_TYPE_ID;
  if (pinned && mongoose.isValidObjectId(pinned)) {
    const byId = await TicketType.findById(pinned);
    if (byId) return byId;
  }
  return (
    (await TicketType.findOne({ isActive: true, name: /standard/i }).sort({ createdAt: 1 })) ||
    (await TicketType.findOne({ isActive: true }).sort({ createdAt: 1 }))
  );
}

/** Upsert the payment routes submitted by the aggregate admin settings form. */
async function saveProviderRoutes(routes: any[]) {
  for (const r of routes) {
    if (!r || !CURRENCIES.includes(r.currency)) continue;
    const error = routePatchError(r);
    if (error) throw new Error(error);

    await ProviderRoute.findByIdAndUpdate(
      r.currency,
      {
        $set: compact({
          primaryProvider: r.primaryProvider,
          fallbackProvider: r.fallbackProvider,
          isEnabled: r.isEnabled,
          feePolicy: r.feePolicy,
        }),
        $setOnInsert: { _id: r.currency },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
  }
}

/** Replace the prices on the standard ticket type with the submitted values. */
async function saveTicketPrices(prices: any[]) {
  const clean = (prices || [])
    .filter(
      (p) =>
        p &&
        CURRENCIES.includes(p.currency) &&
        Number.isFinite(Number(p.amountMinor)) &&
        Number(p.amountMinor) >= 0
    )
    .map((p) => ({
      currency: p.currency as string,
      amountMinor: Math.round(Number(p.amountMinor)),
    }));
  if (clean.length === 0) return;

  let ticketType = await getStandardTicketType();
  if (!ticketType) {
    await TicketType.create({
      name: 'Standard',
      description: 'Standard conference registration',
      isActive: true,
      prices: clean,
    });
    return;
  }

  const existing = new Map<string, any>();
  for (const p of ticketType.prices || []) existing.set(String(p.currency), p);

  ticketType.prices = clean.map((p) => {
    const old = existing.get(p.currency);
    return {
      currency: p.currency,
      amountMinor: p.amountMinor,
      createdAt: old?.createdAt || new Date(),
      updatedAt: new Date(),
    };
  });
  await ticketType.save();
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — GET /api/settings/public
// ─────────────────────────────────────────────────────────────────────────────

router.get('/settings/public', async (_req: Request, res: Response) => {
  try {
    const [settings, ministers, programme, routes] = await Promise.all([
      getEventSettings(),
      Minister.find({ isActive: true }).sort({ sortOrder: 1 }).lean(),
      ProgrammeItem.find().sort({ eventDate: 1, startTime: 1, sortOrder: 1 }).lean(),
      ProviderRoute.find({ isEnabled: true }).lean(),
    ]);

    if (!settings) {
      return res.status(500).json({ error: 'Settings unavailable' });
    }

    return res.json({
      event: {
        name: settings.eventName,
        theme: settings.theme,
        datesText: settings.datesText,
        heroDatesLabel: settings.heroDatesLabel,
        openingTimeLabel: settings.openingTimeLabel,
        registrationFeeLabel: settings.registrationFeeLabel,
        whyAttendIntro: settings.whyAttendIntro,
        flyerDescription: settings.flyerDescription,
        startsAt: settings.startsAt,
        endsAt: settings.endsAt,
        registrationDeadline: settings.registrationDeadline,
        venue: {
          name: settings.venueName,
          address: settings.venueAddress,
          mapUrl: settings.venueMapUrl || null,
        },
        contact: {
          phone: settings.contactPhone,
          email: settings.contactEmail || null,
        },
        capacity: {
          limit: settings.capacityLimit,
        },
      },
      ministers: ministers.map((m: any) => ({
        id: m._id,
        fullName: m.fullName,
        titleOrRole: m.titleOrRole,
        photoUrl: m.photoUrl || null,
        biography: m.biography || null,
        sortOrder: m.sortOrder,
      })),
      programme: programme.map((p: any) => ({
        id: p._id,
        date: p.eventDate,
        startTime: p.startTime,
        endTime: p.endTime || null,
        title: p.title,
        speakerOrLeader: p.speakerOrLeader || null,
        description: p.description || null,
      })),
      paymentRoutes: routes.reduce<Record<string, unknown>>((acc, r: any) => {
        acc[r._id] = {
          primary: r.primaryProvider,
          fallback: r.fallbackProvider,
          feePolicy: r.feePolicy,
        };
        return acc;
      }, {}),
    });
  } catch (err) {
    console.error('[GET /settings/public]', err);
    return res.status(500).json({ error: 'Failed to load settings' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// STAFF — GET /api/settings
// ─────────────────────────────────────────────────────────────────────────────

router.get(
  '/settings',
  authenticateStaff,
  requireRole('admin'),
  async (_req: AuthRequest, res: Response) => {
    try {
      const [settings, ministers, programme, routes] = await Promise.all([
        getEventSettings(),
        Minister.find().sort({ sortOrder: 1 }).lean(),
        ProgrammeItem.find().sort({ eventDate: 1, startTime: 1, sortOrder: 1 }).lean(),
        ProviderRoute.find().lean(),
      ]);

      if (!settings) {
        return res.status(500).json({ error: 'Settings unavailable' });
      }

      return res.json({
        event: settings.toObject ? settings.toObject() : settings,
        ministers,
        programme,
        providerRoutes: routes,
      });
    } catch (err) {
      console.error('[GET /settings]', err);
      return res.status(500).json({ error: 'Failed to load settings' });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — GET /api/admin/settings
// Aggregate payload used by the admin settings screen (event + routes + prices
// + programme) so the whole form can be loaded in a single request.
// ─────────────────────────────────────────────────────────────────────────────

router.get(
  '/admin/settings',
  authenticateStaff,
  requireRole('admin'),
  async (_req: AuthRequest, res: Response) => {
    try {
      const [settings, routes, ticketType, programme] = await Promise.all([
        getEventSettings(),
        ProviderRoute.find().lean(),
        getStandardTicketType(),
        ProgrammeItem.find()
          .sort({ eventDate: 1, startTime: 1, sortOrder: 1 })
          .lean(),
      ]);

      if (!settings) {
        return res.status(500).json({ error: 'Settings unavailable' });
      }

      return res.json({
        settings: settings.toObject ? settings.toObject() : settings,
        routes: routes.map((r: any) => ({
          currency: String(r._id),
          primaryProvider: r.primaryProvider,
          fallbackProvider: r.fallbackProvider || undefined,
          isEnabled: r.isEnabled,
          feePolicy: r.feePolicy,
        })),
        prices: (ticketType?.prices || []).map((p: any) => ({
          currency: p.currency,
          amountMinor: p.amountMinor,
        })),
        programme: programme.map((p: any) => ({
          id: String(p._id),
          eventDate: p.eventDate,
          startTime: p.startTime,
          endTime: p.endTime || '',
          title: p.title,
          speakerOrLeader: p.speakerOrLeader || '',
          description: p.description || '',
          sortOrder: p.sortOrder,
        })),
      });
    } catch (err) {
      console.error('[GET /admin/settings]', err);
      return res.status(500).json({ error: 'Failed to load settings' });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — PUT /api/admin/settings
// Persist the whole settings form. Each section is optional so partial saves
// are safe; validation errors are returned before anything is written where
// possible.
// ─────────────────────────────────────────────────────────────────────────────

router.put(
  '/admin/settings',
  authenticateStaff,
  requireRole('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const body = req.body || {};
      const patch = buildEventPatch(body.settings);
      const error = eventPatchError(patch);
      if (error) return res.status(400).json({ error });

      if (Array.isArray(body.routes)) await saveProviderRoutes(body.routes);
      if (Array.isArray(body.prices)) await saveTicketPrices(body.prices);

      let settings: unknown;
      if (Object.keys(patch).length > 0) {
        settings = await EventSettings.findOneAndUpdate(
          { singleton: 'event' },
          { $set: patch, $setOnInsert: { singleton: 'event' } },
          {
            upsert: true,
            new: true,
            runValidators: true,
            setDefaultsOnInsert: true,
          }
        );
      } else {
        settings = await getEventSettings();
      }

      return res.json({ success: true, settings });
    } catch (err: any) {
      if (err?.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
      }
      if (typeof err?.message === 'string' && err.message) {
        return res.status(400).json({ error: err.message });
      }
      console.error('[PUT /admin/settings]', err);
      return res.status(500).json({ error: 'Failed to save settings' });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// STAFF — PUT /api/settings/event
// ─────────────────────────────────────────────────────────────────────────────

router.put(
  '/settings/event',
  authenticateStaff,
  requireRole('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const patch = buildEventPatch(req.body || {});

      if (Object.keys(patch).length === 0) {
        return res.status(400).json({ error: 'No updatable fields supplied' });
      }

      const error = eventPatchError(patch);
      if (error) return res.status(400).json({ error });

      const updated = await EventSettings.findOneAndUpdate(
        { singleton: 'event' },
        { $set: patch, $setOnInsert: { singleton: 'event' } },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      return res.json({ event: updated });
    } catch (err: any) {
      if (err?.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
      }
      console.error('[PUT /settings/event]', err);
      return res.status(500).json({ error: 'Failed to update event settings' });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// STAFF — PUT /api/settings/provider-routes/:currency
// ─────────────────────────────────────────────────────────────────────────────

router.put(
  '/settings/provider-routes/:currency',
  authenticateStaff,
  requireRole('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { currency } = req.params;

      if (!CURRENCIES.includes(currency as any)) {
        return res.status(400).json({
          error: `currency must be one of: ${CURRENCIES.join(', ')}`,
        });
      }

      const patch = compact({
        primaryProvider: req.body?.primaryProvider,
        fallbackProvider: req.body?.fallbackProvider,
        isEnabled: req.body?.isEnabled,
        feePolicy: req.body?.feePolicy,
      });

      if (Object.keys(patch).length === 0) {
        return res.status(400).json({ error: 'No updatable fields supplied' });
      }

      const error = routePatchError(patch);
      if (error) return res.status(400).json({ error });

      const route = await ProviderRoute.findByIdAndUpdate(
        currency,
        {
          $set: patch,
          $setOnInsert: { _id: currency },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      return res.json({ providerRoute: route });
    } catch (err: any) {
      if (err?.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
      }
      console.error('[PUT /settings/provider-routes/:currency]', err);
      return res.status(500).json({ error: 'Failed to update provider route' });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// STAFF — MINISTERS  (POST / PUT / DELETE)
// ─────────────────────────────────────────────────────────────────────────────

router.post(
  '/settings/ministers',
  authenticateStaff,
  requireRole('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { fullName, titleOrRole, photoUrl, biography, sortOrder, isActive } =
        req.body || {};

      if (!fullName || !titleOrRole) {
        return res
          .status(400)
          .json({ error: 'fullName and titleOrRole are required' });
      }

      const doc = await Minister.create({
        fullName,
        titleOrRole,
        photoUrl: photoUrl || null,
        biography: biography || null,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
        isActive: isActive !== false,
      });

      return res.status(201).json({ minister: doc });
    } catch (err: any) {
      if (err?.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
      }
      console.error('[POST /settings/ministers]', err);
      return res.status(500).json({ error: 'Failed to create minister' });
    }
  }
);

router.put(
  '/settings/ministers/:id',
  authenticateStaff,
  requireRole('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid minister id' });
      }

      const patch = compact({
        fullName: req.body?.fullName,
        titleOrRole: req.body?.titleOrRole,
        photoUrl: req.body?.photoUrl,
        biography: req.body?.biography,
        sortOrder: req.body?.sortOrder,
        isActive: req.body?.isActive,
      });

      if (Object.keys(patch).length === 0) {
        return res.status(400).json({ error: 'No updatable fields supplied' });
      }

      const doc = await Minister.findByIdAndUpdate(
        req.params.id,
        { $set: patch },
        { new: true, runValidators: true }
      );

      if (!doc) return res.status(404).json({ error: 'Minister not found' });
      return res.json({ minister: doc });
    } catch (err: any) {
      if (err?.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
      }
      console.error('[PUT /settings/ministers/:id]', err);
      return res.status(500).json({ error: 'Failed to update minister' });
    }
  }
);

router.delete(
  '/settings/ministers/:id',
  authenticateStaff,
  requireRole('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid minister id' });
      }
      const doc = await Minister.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ error: 'Minister not found' });
      return res.status(204).send();
    } catch (err) {
      console.error('[DELETE /settings/ministers/:id]', err);
      return res.status(500).json({ error: 'Failed to delete minister' });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// STAFF — PROGRAMME ITEMS  (POST / PUT / DELETE)
// ─────────────────────────────────────────────────────────────────────────────

router.post(
  '/settings/programme',
  authenticateStaff,
  requireRole('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        eventDate,
        startTime,
        endTime,
        title,
        speakerOrLeader,
        description,
        sortOrder,
      } = req.body || {};

      if (!eventDate || !DATE_RE.test(String(eventDate))) {
        return res.status(400).json({ error: 'eventDate must be YYYY-MM-DD' });
      }
      if (!startTime || !TIME_RE.test(String(startTime))) {
        return res.status(400).json({ error: 'startTime must be HH:mm (24h)' });
      }
      if (endTime && !TIME_RE.test(String(endTime))) {
        return res.status(400).json({ error: 'endTime must be HH:mm (24h)' });
      }
      if (endTime && String(endTime) <= String(startTime)) {
        return res.status(400).json({ error: 'endTime must be after startTime' });
      }
      if (!title) return res.status(400).json({ error: 'title is required' });

      const doc = await ProgrammeItem.create({
        eventDate: String(eventDate),
        startTime: String(startTime),
        endTime: endTime ? String(endTime) : null,
        title,
        speakerOrLeader: speakerOrLeader || null,
        description: description || null,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      });

      return res.status(201).json({ programmeItem: doc });
    } catch (err: any) {
      if (err?.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
      }
      console.error('[POST /settings/programme]', err);
      return res.status(500).json({ error: 'Failed to create programme item' });
    }
  }
);

router.put(
  '/settings/programme/:id',
  authenticateStaff,
  requireRole('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid programme item id' });
      }

      const patch = compact({
        eventDate: req.body?.eventDate,
        startTime: req.body?.startTime,
        endTime: req.body?.endTime,
        title: req.body?.title,
        speakerOrLeader: req.body?.speakerOrLeader,
        description: req.body?.description,
        sortOrder: req.body?.sortOrder,
      });

      if (Object.keys(patch).length === 0) {
        return res.status(400).json({ error: 'No updatable fields supplied' });
      }
      if (patch.eventDate && !DATE_RE.test(String(patch.eventDate))) {
        return res.status(400).json({ error: 'eventDate must be YYYY-MM-DD' });
      }
      if (patch.startTime && !TIME_RE.test(String(patch.startTime))) {
        return res.status(400).json({ error: 'startTime must be HH:mm (24h)' });
      }
      if (patch.endTime && !TIME_RE.test(String(patch.endTime))) {
        return res.status(400).json({ error: 'endTime must be HH:mm (24h)' });
      }

      const doc = await ProgrammeItem.findByIdAndUpdate(
        req.params.id,
        { $set: patch },
        { new: true, runValidators: true }
      );

      if (!doc) return res.status(404).json({ error: 'Programme item not found' });
      return res.json({ programmeItem: doc });
    } catch (err: any) {
      if (err?.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
      }
      console.error('[PUT /settings/programme/:id]', err);
      return res.status(500).json({ error: 'Failed to update programme item' });
    }
  }
);

router.delete(
  '/settings/programme/:id',
  authenticateStaff,
  requireRole('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid programme item id' });
      }
      const doc = await ProgrammeItem.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ error: 'Programme item not found' });
      return res.status(204).send();
    } catch (err) {
      console.error('[DELETE /settings/programme/:id]', err);
      return res.status(500).json({ error: 'Failed to delete programme item' });
    }
  }
);

export default router;