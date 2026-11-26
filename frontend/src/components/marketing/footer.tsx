import Link from "next/link";
import Image from "next/image";
import { CONFERENCE_INFO, GALLERY_PHOTOS } from "@/data/conference";

export function Footer() {
  const marqueeItems = [...GALLERY_PHOTOS, ...GALLERY_PHOTOS];

  return (
    <footer className="relative isolate overflow-hidden border-t border-[#e5e7eb] bg-[#f4f5f7] pt-16 sm:pt-20">
      {/* Conference Photography Marquee */}
      <div aria-label="Moments from previous conferences" role="group" className="relative overflow-hidden">
        <div className="marquee">
          <ul className="flex shrink-0 gap-3 pr-3 sm:gap-4 sm:pr-4">
            {marqueeItems.map((photo, idx) => (
              <li
                key={`${photo.src}-${idx}`}
                className="relative h-[112px] w-[168px] shrink-0 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white sm:h-[156px] sm:w-[234px]"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={234}
                  height={156}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-3 pt-8 pb-2 text-[12px] leading-none font-medium text-white">
                  {photo.tag}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container-site pt-16 pb-10 sm:pt-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Ministry Identity & Venue */}
          <div className="lg:col-span-5 space-y-5">
            <Link
              href="/"
              className="inline-flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7a6e] rounded-lg"
            >
              <Image
                src={CONFERENCE_INFO.assets.logo}
                alt="HOREMOW Official Logo"
                width={48}
                height={48}
                className="h-12 w-12 rounded-full border border-[#e5e7eb] bg-white p-1 object-contain"
              />
              <div>
                <p className="text-lg font-semibold text-[#111827]">
                  {CONFERENCE_INFO.ministryName}
                </p>
                <p className="text-xs font-medium tracking-wide text-[#0e7a6e]">
                  {CONFERENCE_INFO.title}
                </p>
              </div>
            </Link>

            <p className="max-w-md text-[15px] leading-relaxed text-[#4b5563]">
              HOREMOW is a non-denominational Christian movement dedicated to reviving biblical
              righteousness, inward and outward holiness, complete sanctification, and preparing
              believers globally for the rapture.
            </p>

            <div className="space-y-1.5 text-sm text-[#374151]">
              <p>
                <span className="text-[#6b7280]">Dates:</span> {CONFERENCE_INFO.dates} · Opens{" "}
                {CONFERENCE_INFO.openingDate}
              </p>
              <p>
                <span className="text-[#6b7280]">Venue:</span> {CONFERENCE_INFO.venue}
              </p>
              <p>
                <span className="text-[#6b7280]">Helpline &amp; WhatsApp:</span>{" "}
                <a
                  href={CONFERENCE_INFO.contact.phoneTel}
                  className="font-medium text-[#0e7a6e] hover:underline"
                >
                  {CONFERENCE_INFO.contact.phone}
                </a>
              </p>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            <nav aria-label="Explore conference">
              <p className="text-lg font-semibold text-[#111827] sm:text-xl">Explore</p>
              <ul className="mt-4 space-y-1">
                <li>
                  <Link href="/" className="block py-1.5 text-[15px] text-[#4b5563] transition-colors hover:text-[#0e7a6e]">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="block py-1.5 text-[15px] text-[#4b5563] transition-colors hover:text-[#0e7a6e]">
                    About HOREMOW
                  </Link>
                </li>
                <li>
                  <Link href="/conference" className="block py-1.5 text-[15px] text-[#4b5563] transition-colors hover:text-[#0e7a6e]">
                    IHC26 Overview
                  </Link>
                </li>
                <li>
                  <Link href="/programme" className="block py-1.5 text-[15px] text-[#4b5563] transition-colors hover:text-[#0e7a6e]">
                    Programme
                  </Link>
                </li>
                <li>
                  <Link href="/ministers" className="block py-1.5 text-[15px] text-[#4b5563] transition-colors hover:text-[#0e7a6e]">
                    Ministers
                  </Link>
                </li>
              </ul>
            </nav>

            <nav aria-label="Attend and support">
              <p className="text-lg font-semibold text-[#111827] sm:text-xl">Participate</p>
              <ul className="mt-4 space-y-1">
                <li>
                  <Link href="/register" className="block py-1.5 text-[15px] font-medium text-[#0e7a6e] transition-colors hover:text-[#0a5e54]">
                    Register Now
                  </Link>
                </li>
                <li>
                  <Link href="/find-my-tickets" className="block py-1.5 text-[15px] text-[#4b5563] transition-colors hover:text-[#0e7a6e]">
                    Find My Tickets
                  </Link>
                </li>
                <li>
                  <Link href="/camp-info" className="block py-1.5 text-[15px] text-[#4b5563] transition-colors hover:text-[#0e7a6e]">
                    Camp Information
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="block py-1.5 text-[15px] text-[#4b5563] transition-colors hover:text-[#0e7a6e]">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="block py-1.5 text-[15px] text-[#4b5563] transition-colors hover:text-[#0e7a6e]">
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="col-span-2 sm:col-span-1">
              <p className="text-lg font-semibold text-[#111827] sm:text-xl">Registration</p>
              <div className="mt-4 rounded-2xl border border-[#e5e7eb] bg-white p-4 space-y-3">
                <p className="text-sm font-medium text-[#111827]">
                  {CONFERENCE_INFO.datesNumeric} · Kwali, Abuja
                </p>
                <p className="text-xs leading-relaxed text-[#4b5563]">
                  Flat rate of ₦5,000 / $20 / €20 / £20 per participant for individuals and groups.
                </p>
                <Link
                  href="/register"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-[#0e7a6e] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a5e54]"
                >
                  Register Now
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Social Row */}
        <div className="mt-14 flex flex-col-reverse gap-6 border-t border-[#e5e7eb] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#4b5563]">
            © 2026 Holiness Revival Movement Worldwide (HOREMOW). All Rights Reserved ·{" "}
            <Link href="/privacy" className="py-1 text-[#111827] hover:text-[#0e7a6e]">
              Privacy Notice
            </Link>{" "}
            ·{" "}
            <Link href="/terms" className="py-1 text-[#111827] hover:text-[#0e7a6e]">
              Terms &amp; Refund Policy
            </Link>
          </p>

          <ul className="flex items-center gap-5" aria-label="Official social media channels">
            <li>
              <a
                href={CONFERENCE_INFO.contact.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="HOREMOW YouTube"
                className="block text-[#4b5563] transition-all hover:-translate-y-0.5 hover:text-[#0e7a6e]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                  <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </li>
            <li>
              <a
                href={CONFERENCE_INFO.contact.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="HOREMOW Facebook"
                className="block text-[#4b5563] transition-all hover:-translate-y-0.5 hover:text-[#0e7a6e]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </li>
            <li>
              <a
                href={CONFERENCE_INFO.contact.x}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="HOREMOW X"
                className="block text-[#4b5563] transition-all hover:-translate-y-0.5 hover:text-[#0e7a6e]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.9 2H22l-6.78 7.75L23.2 22h-6.25l-4.9-7.38L5.6 22H2.46l7.25-8.29L1.8 2h6.4l4.43 6.77L18.9 2Zm-1.1 18h1.73L7.27 3.89H5.42L17.8 20Z" />
                </svg>
              </a>
            </li>
            <li>
              <a
                href={CONFERENCE_INFO.contact.whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="HOREMOW WhatsApp Helpline"
                className="block text-[#4b5563] transition-all hover:-translate-y-0.5 hover:text-[#0e7a6e]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
