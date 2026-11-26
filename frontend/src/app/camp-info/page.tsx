import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Phone, MapPin } from "lucide-react";
import { CONFERENCE_INFO } from "@/data/conference";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "Camp Information | IHGC 2026",
  description:
    "Venue directions and arrival guidance for participants travelling to Holiness Campground, Kwali, Abuja for IHGC 2026.",
};

export default function CampInfoPage() {
  return (
    <div className="relative isolate min-h-screen bg-white pt-28 pb-20 sm:pt-36 sm:pb-28">
      <Header />
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
          <div className="lg:col-span-6 min-h-[280px] relative">
            <Image
              src={CONFERENCE_INFO.assets.campground}
              alt="Holiness Campground, Behind FGC, Kwali, Abuja"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              num: "01",
              title: "Before You Travel",
              body: "Keep your ticket QR code or unique reference code (HGC-XXXXXX) available at arrival for gate check-in.",
            },
            {
              num: "02",
              title: "Lodging & Meals",
              body: "Arrange your own accommodation and food ahead of arrival in Kwali, Abuja.",
            },
            {
              num: "03",
              title: "Opening Day",
              body: "The conference opens Tuesday, 8 December 2026 at 4:00 PM WAT. Full printed programmes are available at the venue.",
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
            <Link href="/find-my-tickets" className="btn btn-primary">
              Find My Tickets
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
