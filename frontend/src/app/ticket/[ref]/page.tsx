import { notFound } from "next/navigation";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";
import { QrView } from "@/components/ticket/qr-view";
import { BookletDownload } from "@/components/ticket/booklet-download";
import { GroupTicketCard } from "@/components/ticket/group-ticket-card";
import { TicketPdfButton } from "@/components/ticket/ticket-pdf-button";
import { SITE_CONFIG } from "@/config/site";
import { Calendar, MapPin, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "My Conference Ticket | IHGC 2026",
  description: "Official participant admission ticket and cryptographic QR pass.",
};

export const dynamic = "force-dynamic";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");

export default async function TicketPage({
  params,
  searchParams,
}: {
  params: Promise<{ ref: string }>;
  searchParams: Promise<{ access?: string; ck?: string; token?: string }>;
}) {
  const { ref } = await params;
  const { access, ck, token } = await searchParams;

  // Fetch data from Express backend
  let data;
  try {
    // If you are an admin viewing this, you might be using a staff_token instead of access
    // For public users, they pass `access` from the URL.
    const res = await fetch(`${API_BASE}/api/checkout/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reference: ref,
        access,
        checkoutToken: ck,
        providerRef: token,
      }),
      cache: 'no-store'
    });

    if (!res.ok) {
       return notFound();
    }
    data = await res.json();
    
    if (data.status !== 'paid' || !data.tickets) {
       return notFound();
    }
  } catch (err) {
    console.error(err);
    return notFound();
  }

  const { order, participants } = data.tickets;
  const group = data.tickets.group;

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6]">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6">
        <div className="max-w-[800px] mx-auto space-y-8">
          
          {/* Top Banner Alert */}
          <div className="bg-[#EAF9F7] border border-[#CDEFEA] rounded-[18px] p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#8EE3D6] text-[#0E1020] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs sm:text-sm text-[#0E7A6E]">
                <strong>Admission Ticket Confirmed</strong> — Showing this screen at the gate is your primary admission pass.
              </div>
            </div>
          </div>

          {/* Group pass — one scan checks in every paid participant, with PDF download. */}
          {group?.qrToken && <GroupTicketCard group={group} order={order} />}

          {/* Render individual tickets only when there is no group capability. */}
          {!group?.qrToken && participants.map((ticket: any, index: number) => (
            <div
              key={ticket.id}
              className="bg-white rounded-[24px] shadow-[0_4px_25px_rgba(0,0,0,0.06)] border border-gray-200/80 overflow-hidden print:shadow-none print:border-black"
            >
              {/* Ticket Top Dark Header */}
              <div className="bg-[#0E1020] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8EE3D6]">
                    Official Admission Pass • {order.isGroup ? `Seat ${index + 1} of ${participants.length}` : "Individual"}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                    {SITE_CONFIG.eventTitle}
                  </h1>
                  <p className="text-xs text-gray-300">
                    Theme: &ldquo;{SITE_CONFIG.theme}&rdquo;
                  </p>
                </div>

                <div className="inline-block bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 text-center shrink-0 self-start sm:self-auto">
                  <div className="text-[9px] uppercase tracking-widest text-gray-300">Ref Code</div>
                  <div className="text-base font-black tracking-wider text-white font-mono">
                    {ticket.refCode}
                  </div>
                </div>
              </div>

              {/* Ticket Center: QR & Details */}
              <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* QR Section */}
                <div className="md:col-span-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6">
                  <QrView
                    value={ticket.qrToken}
                    refCode={ticket.refCode}
                    participantName={ticket.name}
                  />
                  <div className="text-[11px] text-gray-400 text-center mt-2 font-mono">
                    ID: {ticket.refCode} • Cryptographically Signed
                  </div>
                  <div className="w-full max-w-[260px] mt-4 print:hidden">
                    <TicketPdfButton ticket={ticket} />
                  </div>
                </div>

                {/* Participant & Event Metadata */}
                <div className="md:col-span-6 space-y-5 text-sm">
                  <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                      Participant Name
                    </div>
                    <div className="text-xl font-bold text-[#111320] mt-0.5">
                      {ticket.name}
                    </div>
                    {ticket.chapterZone && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {ticket.chapterZone}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-2 border-t border-gray-100 text-xs">
                    <div className="flex items-start gap-2.5">
                      <Calendar className="w-4 h-4 text-[#0E7A6E] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-[#111320]">{SITE_CONFIG.datesText}</div>
                        <div className="text-gray-500">Opens Tuesday 4:00 PM WAT</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#0E7A6E] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-[#111320]">{SITE_CONFIG.venue.name}</div>
                        <div className="text-gray-500">{SITE_CONFIG.venue.landmark}, {SITE_CONFIG.venue.location}</div>
                      </div>
                    </div>
                  </div>

                  {/* Stand instructions */}
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-[11px] text-gray-600 leading-relaxed">
                    <strong>Check-in Procedure:</strong> Present this QR code at the Kwali Campground gate on arrival. Keep your screen brightness up so the scanner can read it quickly.
                  </div>
                </div>
              </div>

              {/* Ticket Footer Bar */}
              <div className="bg-[#F8FAFC] border-t border-gray-100 px-6 py-3 flex items-center justify-between text-xs text-gray-500">
                <div>Order Ref: <span className="font-mono text-black font-semibold">{order.reference}</span></div>
                <div className="text-[#0E7A6E] font-semibold">Status: Confirmed</div>
              </div>
            </div>
          ))}

          {/* Programme booklet is available for every paid order. */}
          <div className="bg-white rounded-[20px] border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
            <div>
              <div className="text-sm font-bold text-[#111320]">Programme Booklet</div>
              <div className="text-xs text-gray-500">
                Download the full IHGC 2026 programme as a PDF for offline reading.
              </div>
            </div>
            <div className="w-full sm:w-[280px] shrink-0">
              <BookletDownload compact />
            </div>
          </div>

          {/* Group leader dashboard link */}
          {group && (
            <div className="bg-white rounded-[20px] border border-gray-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-[#111320]">Group Management</div>
                <div className="text-xs text-gray-500">
                  Track claimed participants and share invite links with your group members.
                </div>
              </div>
              <a
                href={`/group/dashboard/${group.managementToken}`}
                className="px-5 py-2.5 rounded-full bg-[#0E1020] hover:bg-[#1A1D36] text-white text-xs font-bold transition-colors shrink-0"
              >
                Open Leader Dashboard →
              </a>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}