import { Phone, MessageCircle, MapPin, ArrowRight } from 'lucide-react';
import { CONFERENCE_INFO, MINISTERS } from '../data/conferenceData';
import { FaqAccordion } from '../components/FaqAccordion';

interface PageNavProps {
  onNavigate: (path: string) => void;
}

export function MinistersPage({ onNavigate }: PageNavProps) {
  return (
    <div className="relative isolate min-h-screen bg-white pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div aria-hidden="true" className="bg-ticks pointer-events-none absolute inset-x-0 top-0 h-[420px] -z-10" />
      <div
        aria-hidden="true"
        className="glow absolute -top-[340px] left-1/2 -z-10 h-[720px] w-[1400px] -translate-x-1/2 [--glow-strength:0.22]"
      />

      <div className="container-site space-y-12">
        <div className="max-w-[740px] space-y-4">
          <p className="text-sm font-medium tracking-wide text-[#0e7a6e]">Servants of God</p>
          <h1 className="h-hero text-[#111827]">Featured Ministers</h1>
          <p className="text-base leading-relaxed text-[#4b5563] sm:text-lg">
            Pastor Paul Rika and Evang. Linda Paul Rika are the featured ministers named for
            International Holiness General Conference 2026.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {MINISTERS.map((m) => (
            <article key={m.name} className="card bg-white overflow-hidden flex flex-col shadow-xs">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#f3f4f6]">
                <img
                  src={m.image}
                  alt={m.alt}
                  className="h-full w-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-5">
                <div>
                  <p className="text-xs font-medium text-[#0e7a6e]">{m.role}</p>
                  <h2 className="mt-1.5 h-card text-[#111827]">{m.name}</h2>
                  <p className="mt-3 text-base leading-relaxed text-[#4b5563]">{m.bio}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 border-t border-[#e5e7eb] pt-5 text-sm">
                  <a
                    href={CONFERENCE_INFO.contact.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#0e7a6e] hover:underline"
                  >
                    YouTube
                  </a>
                  <a
                    href={CONFERENCE_INFO.contact.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#0e7a6e] hover:underline"
                  >
                    Facebook
                  </a>
                  <a
                    href={CONFERENCE_INFO.contact.x}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#0e7a6e] hover:underline"
                  >
                    X
                  </a>
                  <span className="text-xs text-[#6b7280]">· Official HOREMOW channels</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="card p-6 sm:p-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="h-card text-[#111827]">Join us at Holiness Campground, Kwali</h2>
            <p className="mt-1 text-sm text-[#4b5563]">
              {CONFERENCE_INFO.dates} · {CONFERENCE_INFO.openingDate}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/register')}
            className="btn btn-primary shrink-0"
          >
            Register Now
          </button>
        </div>
      </div>
    </div>
  );
}

export function CampInfoPage({ onNavigate }: PageNavProps) {
  return (
    <div className="relative isolate min-h-screen bg-white pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div aria-hidden="true" className="bg-ticks pointer-events-none absolute inset-x-0 top-0 h-[420px] -z-10" />
      <div className="container-site space-y-12">
        <div className="max-w-[780px] space-y-4">
          <p className="text-sm font-medium tracking-wide text-[#0e7a6e]">
            Campground &amp; Travel Advisory
          </p>
          <h1 className="h-hero text-[#111827]">Camp Information</h1>
          <p className="text-base leading-relaxed text-[#4b5563] sm:text-lg">
            Essential venue directions and arrival guidance for participants travelling to Kwali,
            Abuja for IHGC 2026.
          </p>
        </div>

        <div className="card bg-white overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-xs">
          <div className="lg:col-span-6 p-6 sm:p-10 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-[#0e7a6e]">
              <MapPin className="h-4 w-4" />
              <span>Confirmed Conference Venue</span>
            </div>
            <h2 className="h-card text-[#111827]">{CONFERENCE_INFO.venue}</h2>
            <p className="text-base leading-relaxed text-[#4b5563]">
              Landmark: {CONFERENCE_INFO.landmark}
            </p>
            <div className="rounded-xl border border-[#e5e7eb] bg-[#f4f5f7] p-5 space-y-2">
              <p className="text-sm font-medium text-[#0e7a6e]">
                Accommodation and meals are not included
              </p>
              <p className="text-sm leading-relaxed text-[#4b5563]">
                Participants must arrange their own accommodation and food. The organizers have not
                provided lodging or meal details.
              </p>
            </div>
          </div>
          <div className="lg:col-span-6 min-h-[280px]">
            <img
              src={CONFERENCE_INFO.assets.campground}
              alt="Holiness Campground, Behind FGC, Kwali, Abuja"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              num: '01',
              title: 'Before You Travel',
              body: 'Keep your ticket QR code or unique reference code (HGC-XXXXXX) available at arrival for gate check-in.',
            },
            {
              num: '02',
              title: 'Lodging & Meals',
              body: 'Arrange your own accommodation and food ahead of arrival in Kwali, Abuja.',
            },
            {
              num: '03',
              title: 'Opening Day',
              body: 'The conference opens Tuesday, 8 December 2026 at 4:00 PM WAT. Full printed programmes are available at the venue.',
            },
          ].map((c) => (
            <div key={c.num} className="card bg-white p-6 sm:p-8 space-y-3">
              <span className="font-mono text-xs text-[#0e7a6e]">{c.num}.</span>
              <h3 className="text-lg font-medium text-[#111827]">{c.title}</h3>
              <p className="text-sm leading-relaxed text-[#4b5563]">{c.body}</p>
            </div>
          ))}
        </div>

        <div className="card p-6 sm:p-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="h-card text-[#111827]">Conference Helpline</h2>
            <p className="mt-1 text-sm text-[#4b5563]">
              Call or message for event and arrival information: {CONFERENCE_INFO.contact.phone}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={CONFERENCE_INFO.contact.phoneTel} className="btn btn-outline">
              <Phone className="h-4 w-4" />
              <span>Call Helpline</span>
            </a>
            <button
              type="button"
              onClick={() => onNavigate('/find-my-tickets')}
              className="btn btn-primary"
            >
              Find My Tickets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FaqPage({ onNavigate }: PageNavProps) {
  return (
    <div className="relative isolate min-h-screen bg-white pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div aria-hidden="true" className="bg-ticks pointer-events-none absolute inset-x-0 top-0 h-[420px] -z-10" />
      <div className="container-site mb-4 text-center">
        <p className="text-sm font-medium tracking-wide text-[#0e7a6e]">
          Frequently Asked Questions
        </p>
        <h1 className="h-hero mt-2 text-[#111827]">Questions &amp; Answers</h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-[#4b5563]">
          Find confirmed information about registration, event dates, group passes, and tickets.
        </p>
      </div>
      <FaqAccordion showHeading={false} onNavigate={onNavigate} />
    </div>
  );
}

export function ContactPage({ onNavigate }: PageNavProps) {
  return (
    <div className="relative isolate min-h-screen bg-white pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div aria-hidden="true" className="bg-ticks pointer-events-none absolute inset-x-0 top-0 h-[420px] -z-10" />
      <div className="container-site space-y-12">
        <div className="max-w-[740px] space-y-4">
          <p className="text-sm font-medium tracking-wide text-[#0e7a6e]">Get In Touch</p>
          <h1 className="h-hero text-[#111827]">Contact the Conference</h1>
          <p className="text-base leading-relaxed text-[#4b5563] sm:text-lg">
            Have an inquiry regarding registration, arrival at Kwali Campground, or group bookings?
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="card bg-white p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <Phone className="h-5 w-5 text-[#0e7a6e]" />
              <h2 className="mt-4 h-card text-[#111827]">Telephone Helpline</h2>
              <p className="mt-2 text-sm text-[#4b5563]">
                For conference registration and venue information.
              </p>
            </div>
            <a
              href={CONFERENCE_INFO.contact.phoneTel}
              className="btn btn-primary w-full sm:w-auto"
            >
              <span>{CONFERENCE_INFO.contact.phone}</span>
            </a>
          </div>

          <div className="card bg-white p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <MessageCircle className="h-5 w-5 text-[#0e7a6e]" />
              <h2 className="mt-4 h-card text-[#111827]">WhatsApp Support</h2>
              <p className="mt-2 text-sm text-[#4b5563]">
                Send conference inquiries directly via WhatsApp.
              </p>
            </div>
            <a
              href={CONFERENCE_INFO.contact.whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline w-full sm:w-auto"
            >
              <span>Chat on WhatsApp</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="card bg-white p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <MapPin className="h-5 w-5 text-[#0e7a6e]" />
              <h2 className="mt-4 h-card text-[#111827]">Campground Venue</h2>
              <p className="mt-2 text-sm text-[#4b5563]">{CONFERENCE_INFO.venue}</p>
              <p className="mt-1 text-xs text-[#6b7280]">WAT Timezone (UTC+1)</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/camp-info')}
              className="link-arrow text-base font-medium text-[#111827] cursor-pointer"
            >
              <span>Location &amp; Travel Directions</span>
              <ArrowRight className="h-4 w-4 text-[#0e7a6e]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LegalPage({
  mode,
  onNavigate,
}: {
  mode: 'terms' | 'privacy';
  onNavigate: (path: string) => void;
}) {
  const isTerms = mode === 'terms';
  return (
    <div className="relative isolate min-h-screen bg-white pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div aria-hidden="true" className="bg-ticks pointer-events-none absolute inset-x-0 top-0 h-[420px] -z-10" />
      <div className="container-site max-w-[780px] space-y-8">
        <div>
          <p className="text-sm font-medium tracking-wide text-[#0e7a6e]">
            {isTerms ? 'Legal & Info' : 'Data Protection'}
          </p>
          <h1 className="h-hero mt-2 text-[#111827]">
            {isTerms ? 'Terms & Refund Policy (Draft)' : 'Privacy Notice (Draft)'}
          </h1>
        </div>

        <div className="card bg-white p-6 sm:p-10 space-y-5 text-base leading-relaxed text-[#4b5563]">
          {isTerms ? (
            <>
              <p>
                Registration for the {CONFERENCE_INFO.title} is a flat rate of{' '}
                {CONFERENCE_INFO.feeSummary}. Accommodation and meals are not included;
                participants arrange their own accommodation and food.
              </p>
              <p>
                This interim refund and substitution policy is a draft pending final organizer
                review. Registration fees are generally non-refundable once payment is confirmed and
                a QR entry pass is issued.
              </p>
              <p>
                If funds were deducted from your account without an immediate ticket display, do not
                pay again immediately — use the Ticket Recovery page or contact our helpline at{' '}
                {CONFERENCE_INFO.contact.phone}.
              </p>
            </>
          ) : (
            <>
              <p>
                Holiness Revival Movement Worldwide (HOREMOW) collects registration contact details
                (name, phone number, email address, location, and attendance preferences) solely to
                issue conference tickets, process payment receipts via Paystack or Flutterwave, and
                enable gate check-in and ticket recovery.
              </p>
              <p>
                Your phone number and unique reference code are used to look up your individual
                tickets or group passes via the Find My Tickets desk.
              </p>
            </>
          )}

          <div className="pt-4 border-t border-[#e5e7eb]">
            <button
              type="button"
              onClick={() => onNavigate('/register')}
              className="btn btn-primary"
            >
              Return to Registration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
