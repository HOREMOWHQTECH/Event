import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Download, Calendar, MapPin, Ticket, ArrowRight } from "lucide-react";
import { CONFERENCE_INFO } from "@/data/conference";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "IHC26 Conference Overview | IHGC 2026",
  description:
    "Conference facts for International Holiness General Conference 2026: dates, venue, theme, registration fee, and official flyer.",
};

export default function ConferencePage() {
  return (
    <div className="relative isolate min-h-screen bg-white pt-28 pb-20 sm:pt-36 sm:pb-28">
      <Header />
      <div aria-hidden="true" className="bg-ticks pointer-events-none absolute inset-x-0 top-0 h-[420px] -z-10" />
      <div
        aria-hidden="true"
        className="glow absolute -top-[340px] left-1/2 -z-10 h-[720px] w-[1400px] -translate-x-1/2 [--glow-strength:0.22]"
      />

      <div className="container-site space-y-12">
        <div className="max-w-[780px] space-y-4">
          <p className="text-sm font-medium tracking-wide text-[#0e7a6e]">
            Conference Facts · IHC26
          </p>
          <h1 className="h-hero text-[#111827]">{CONFERENCE_INFO.title}</h1>
          <p className="text-lg text-[#0e7a6e] font-medium">
            Theme: “{CONFERENCE_INFO.themeTitleCase}”
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="card bg-white p-6 sm:p-8 space-y-3">
            <Calendar className="h-5 w-5 text-[#0e7a6e]" />
            <h2 className="text-lg font-medium text-[#111827]">Dates &amp; Opening</h2>
            <p className="text-base text-[#0e7a6e] font-medium">{CONFERENCE_INFO.dates}</p>
            <p className="text-sm text-[#4b5563]">Opening: {CONFERENCE_INFO.openingDate}</p>
          </div>

          <div className="card bg-white p-6 sm:p-8 space-y-3">
            <MapPin className="h-5 w-5 text-[#0e7a6e]" />
            <h2 className="text-lg font-medium text-[#111827]">Camp Venue</h2>
            <p className="text-base text-[#111827] font-medium">{CONFERENCE_INFO.venueShort}</p>
            <p className="text-sm text-[#4b5563]">{CONFERENCE_INFO.venue}</p>
          </div>

          <div className="card bg-white p-6 sm:p-8 space-y-3">
            <Ticket className="h-5 w-5 text-[#0e7a6e]" />
            <h2 className="text-lg font-medium text-[#111827]">Registration</h2>
            <p className="text-base text-[#0e7a6e] font-medium">₦5,000 / $20 / €20 / £20</p>
            <p className="text-sm text-[#4b5563]">Flat rate for every participant</p>
          </div>
        </div>

        <div className="card relative isolate grid overflow-hidden lg:grid-cols-[1fr_1fr] lg:items-center">
          <div
            aria-hidden="true"
            className="flare absolute inset-x-0 bottom-0 -z-10 h-[55%] opacity-45"
          />
          <div className="p-6 sm:p-10 lg:p-14 space-y-5">
            <p className="text-xs font-medium tracking-wide text-[#0e7a6e]">Official Flyer</p>
            <h2 className="h-section">{CONFERENCE_INFO.title}</h2>
            <p className="text-base leading-relaxed text-[#4b5563]">
              “{CONFERENCE_INFO.themeTitleCase}” — {CONFERENCE_INFO.dates} at{" "}
              {CONFERENCE_INFO.venue}.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={CONFERENCE_INFO.assets.flyer}
                download="IHGC-2026-Official-Flyer.png"
                className="btn btn-primary"
              >
                <Download className="h-4 w-4" />
                <span>Download Flyer</span>
              </a>
              <Link href="/register" className="btn btn-outline">
                Register Now
              </Link>
            </div>
          </div>
          <div className="flex justify-center p-6 sm:p-10">
            <Image
              src={CONFERENCE_INFO.assets.flyer}
              alt="Official IHGC 2026 Conference Flyer"
              width={360}
              height={500}
              className="max-w-[360px] w-full rounded-2xl border border-[#d1d5db] shadow-lg"
            />
          </div>
        </div>

        <div className="card p-6 sm:p-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-medium tracking-wide text-[#0e7a6e]">
              Important Planning Notice for Participants
            </p>
            <h2 className="h-card text-[#111827]">{CONFERENCE_INFO.lodgingNotice}</h2>
            <p className="text-sm text-[#4b5563]">
              {CONFERENCE_INFO.feeBreakdown} The organizers have not provided lodging or meal
              details.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 shrink-0">
            <Link
              href="/camp-info"
              className="link-arrow text-sm font-medium text-[#111827]"
            >
              <span>Read Camp Info &amp; Lodging Advisory</span>
              <ArrowRight className="h-4 w-4 text-[#0e7a6e]" />
            </Link>
            <Link href="/programme" className="btn btn-outline !min-h-[44px]">
              View Programme
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
