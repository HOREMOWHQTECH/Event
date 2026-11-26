import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Search,
  Download,
  QrCode,
  User,
  Users,
  AlertCircle,
  Loader2,
  Printer,
  ArrowLeft,
} from 'lucide-react';
import { CONFERENCE_INFO } from '../data/conferenceData';

interface FindTicketsPageProps {
  onNavigate: (path: string) => void;
}

interface LookupTicket {
  id: string;
  kind: 'individual' | 'group';
  name: string;
  reference: string;
  identifier: string;
  note: string;
  qrToken: string;
}

function TicketCard({ entry }: { entry: LookupTicket }) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrErr, setQrErr] = useState(false);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(entry.qrToken || entry.reference || entry.identifier, {
      width: 320,
      margin: 2,
      color: { dark: '#111827', light: '#ffffff' },
    })
      .then((url) => {
        if (active) setQrUrl(url);
      })
      .catch(() => {
        if (active) setQrErr(true);
      });
    return () => {
      active = false;
    };
  }, [entry.qrToken, entry.reference, entry.identifier]);

  const isGroup = entry.kind === 'group';
  const filename = isGroup
    ? `IHGC-2026-group-ticket-${entry.reference}.png`
    : `IHGC-2026-ticket-${entry.identifier}.png`;

  return (
    <article className="card bg-white p-5 sm:p-6 flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="mx-auto flex h-28 w-28 shrink-0 items-center justify-center rounded-xl border border-[#e5e7eb] bg-white p-2 sm:mx-0">
        {qrUrl ? (
          <img
            src={qrUrl}
            alt={`Check-in QR code for ${entry.name}`}
            className="h-full w-full object-contain"
          />
        ) : qrErr ? (
          <QrCode className="h-8 w-8 text-[#9ca3af]" />
        ) : (
          <Loader2 className="h-6 w-6 animate-spin text-[#9ca3af]" />
        )}
      </div>

      <div className="min-w-0 flex-1 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:justify-start">
          <span className="inline-flex items-center gap-1.5 font-medium text-[#0e7a6e]">
            {isGroup ? <Users className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
            <span>{isGroup ? 'Group Pass' : 'Individual Pass'}</span>
          </span>
          <span aria-hidden="true" className="text-[#d1d5db]">·</span>
          <span className="font-mono text-[#6b7280]">{entry.reference}</span>
        </div>

        <h3 className="mt-1.5 truncate text-lg font-medium text-[#111827]">{entry.name}</h3>
        <p className="mt-1 text-sm text-[#4b5563]">
          <span className="font-mono text-[#0e7a6e]">{entry.identifier}</span>
          {entry.note ? ` · ${entry.note}` : ''}
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-2.5 sm:justify-start">
          {qrUrl && (
            <a
              href={qrUrl}
              download={filename}
              className="btn btn-primary !min-h-[40px] !px-4 !py-2 !text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download QR Image</span>
            </a>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-outline !min-h-[40px] !px-4 !py-2 !text-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Pass</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export function FindTicketsPage({ onNavigate }: FindTicketsPageProps) {
  const [phone, setPhone] = useState('+234 ');
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<LookupTicket[] | null>(null);
  const [searchedPhone, setSearchedPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.trim();
    if (!cleaned || cleaned.replace(/\D/g, '').length < 7) {
      setError('Enter the phone number you registered with (including country code).');
      return;
    }

    setLoading(true);
    setError(null);
    setTickets(null);
    setSearchedPhone(cleaned);

    try {
      const res = await fetch('/api/tickets/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleaned }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Could not look up tickets right now.');
      }
      setTickets(Array.isArray(data.tickets) ? data.tickets : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not look up tickets right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen bg-[#f8f9fa] pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div aria-hidden="true" className="bg-ticks pointer-events-none absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="glow absolute -top-[340px] left-1/2 -z-10 h-[720px] w-[1400px] -translate-x-1/2 [--glow-strength:0.2]"
      />

      <div className="container-site max-w-[780px]">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#4b5563] hover:text-[#111827] cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to landing page</span>
        </button>

        <div className="card bg-white p-6 sm:p-10 shadow-sm">
          <div className="text-center">
            <p className="text-sm font-medium tracking-wide text-[#0e7a6e]">
              Ticket Desk · IHGC 2026
            </p>
            <h1 className="h-section mt-2">Find My Tickets</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#4b5563] sm:text-base">
              Enter the phone number you registered with to retrieve and download every QR code
              tied to it — individual tickets and group passes alike.
            </p>
          </div>

          <form onSubmit={handleLookup} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 801 234 5678"
                aria-label="Registered phone number"
                className="h-13 w-full rounded-xl border border-[#d1d5db] bg-white pl-11 pr-4 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:border-[#0e7a6e] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary !min-h-[52px] shrink-0 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Searching…</span>
                </>
              ) : (
                <span>Find My QR Codes</span>
              )}
            </button>
          </form>

          {error && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {tickets !== null && (
            <div className="mt-8 space-y-4">
              {tickets.length === 0 ? (
                <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-6 text-center space-y-3">
                  <p className="text-base font-medium text-[#111827]">
                    No paid tickets found for {searchedPhone}
                  </p>
                  <p className="text-sm text-[#4b5563]">
                    Double-check the phone number you used during registration, or contact our
                    helpline at{' '}
                    <a
                      href={CONFERENCE_INFO.contact.phoneTel}
                      className="font-medium text-[#0e7a6e] hover:underline"
                    >
                      {CONFERENCE_INFO.contact.phone}
                    </a>{' '}
                    if you already completed payment.
                  </p>
                </div>
              ) : (
                tickets.map((ticket) => <TicketCard key={ticket.id} entry={ticket} />)
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
