import type { Metadata } from "next";
import Link from "next/link";
import { Phone, MessageCircle, MapPin, ArrowRight } from "lucide-react";
import { CONFERENCE_INFO } from "@/data/conference";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "Contact | IHGC 2026",
  description:
    "Contact the International Holiness General Conference 2026 team for registration, arrival, and group booking inquiries.",
};

export default function ContactPage() {
  return (
    <div className="relative isolate min-h-screen bg-white pt-28 pb-20 sm:pt-36 sm:pb-28">
      <Header />
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
            <Link
              href="/camp-info"
              className="link-arrow text-base font-medium text-[#111827]"
            >
              <span>Location &amp; Travel Directions</span>
              <ArrowRight className="h-4 w-4 text-[#0e7a6e]" />
            </Link>
          </div>
        </div>

        <div className="card overflow-hidden bg-white">
          <div className="border-b border-[#e5e7eb] p-6 sm:p-8">
            <p className="text-xs font-medium tracking-wide text-[#0e7a6e]">
              Venue Location
            </p>
            <h2 className="mt-1.5 h-card text-[#111827]">{CONFERENCE_INFO.venue}</h2>
            <p className="mt-1 text-sm text-[#4b5563]">{CONFERENCE_INFO.landmark}</p>
          </div>
          <div className="aspect-[16/9] w-full min-h-[320px] sm:min-h-[420px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3942.5413190054555!2d7.057758310743839!3d8.829087291188033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104e8a458c737ff9%3A0x8547b10178d75a9c!2sHoliness%20Camp%20Ground%2C%20Kwali%20Abuja!5e0!3m2!1sen!2sng!4v1795684907412!5m2!1sen!2sng"
              title="Holiness Campground, Kwali, Abuja — Google Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              className="h-full w-full"
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
