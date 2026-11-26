import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/marketing/footer";
import { Header } from "@/components/marketing/header";
import { TicketLookup } from "@/components/marketing/ticket-lookup";
import { CONFERENCE_INFO } from "@/data/conference";

/**
 * Shared ticket-desk page body. Next.js and the SPA both render this so the
 * standalone lookup stays identical in either deployment.
 */
export function FindMyTicketsPage() {
  return (
    <div className="relative isolate min-h-screen bg-white">
      <Header />

      <section className="relative isolate overflow-hidden border-b border-[#e5e7eb] px-5 py-16 sm:px-8 sm:py-24">
        <div aria-hidden="true" className="bg-ticks pointer-events-none absolute inset-0 -z-10" />
        <div
          aria-hidden="true"
          className="glow absolute -top-[300px] left-1/2 -z-10 h-[640px] w-[1200px] -translate-x-1/2 [--glow-strength:0.22]"
        />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#0e7a6e]/30 bg-[#0e7a6e]/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#0e7a6e]">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.8} />
            Ticket desk
          </span>
          <h1 className="h-hero mt-6 text-[#111827]">
            Your QR codes,
            <br />
            <span className="text-[#0e7a6e]">one easy lookup.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[#4b5563] sm:text-base">
            Enter the phone number you registered with to retrieve individual tickets and group
            passes for {CONFERENCE_INFO.title}.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-5 py-2.5 text-xs font-semibold text-[#111827] transition-colors hover:border-[#0e7a6e] hover:text-[#0e7a6e]"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
            Back to the landing page
          </Link>
        </div>
      </section>

      <div className="relative z-10 flex-1 bg-[#f4f5f7]">
        <TicketLookup />
      </div>

      <Footer />
    </div>
  );
}
