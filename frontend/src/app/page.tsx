"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
  Ticket,
  Download,
  Users,
  Expand,
  X,
} from "lucide-react";
import {
  CONFERENCE_INFO,
  MINISTERS,
  PROGRAMME_DAYS,
  ABOUT_PILLARS,
  GALLERY_PHOTOS,
} from "@/data/conference";
import { GallerySection } from "@/components/marketing/gallery-section";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { CountdownClock } from "@/components/marketing/countdown-clock";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";
import { LandingSettingsProvider, useLandingSettings } from "@/components/marketing/landing-settings";
import { SITE_CONFIG } from "@/config/site";

function HomeContent() {
  const settings = useLandingSettings();
  const [activeDay, setActiveDay] = useState(PROGRAMME_DAYS[0].date);
  const [flyerModalOpen, setFlyerModalOpen] = useState(false);

  const selectedDay =
    PROGRAMME_DAYS.find((d) => d.date === activeDay) || PROGRAMME_DAYS[0];

  const eventName = settings.eventName || CONFERENCE_INFO.title;
  const theme = settings.theme || CONFERENCE_INFO.themeTitleCase;
  const venueName = settings.venueName || CONFERENCE_INFO.venueShort;
  const feeLabel = settings.registrationFeeLabel || CONFERENCE_INFO.feeSummary;

  return (
    <div className="relative isolate bg-white">
      {/* B. HERO SECTION with Gray Motion Background */}
      <section className="relative isolate flex min-h-[min(100svh,880px)] items-center overflow-hidden bg-[#f8f9fa] pt-28 pb-20 sm:pt-36 sm:pb-28">
        {/* Gray architectural ticks & animated falling lines */}
        <div aria-hidden="true" className="bg-ticks pointer-events-none absolute inset-0 -z-20" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
          <span className="falling-line" style={{ left: "12.5%", animationDelay: "0s" }} />
          <span
            className="falling-line hidden sm:block"
            style={{ left: "37.5%", animationDelay: "-1.6s" }}
          />
          <span className="falling-line" style={{ left: "62.5%", animationDelay: "-2.7s" }} />
          <span
            className="falling-line hidden sm:block"
            style={{ left: "87.5%", animationDelay: "-0.8s" }}
          />
        </div>

        {/* Subtle faded grayscale conference backdrop blended into light surface */}
        <div aria-hidden="true" className="absolute inset-0 -z-20">
          <Image
            src="/gallery/crowed-sitted.jpg"
            alt=""
            fill
            className="object-cover object-center opacity-[0.09] grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-transparent to-white" />
        </div>

        {/* Gray atmospheric radial glow & flare */}
        <div
          aria-hidden="true"
          className="glow absolute -top-[360px] left-1/2 -z-10 h-[760px] w-[1800px] -translate-x-1/2 [--glow-strength:0.25]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 -z-10 h-[260px] [mask-image:linear-gradient(to_bottom,transparent,#000)] sm:h-[340px]"
        >
          <div className="flare h-full" />
        </div>

        <div className="container-site relative z-10 text-center">
          <p className="text-[13px] font-medium tracking-wide text-[#0e7a6e] sm:text-base">
            {CONFERENCE_INFO.dates} · {CONFERENCE_INFO.venueShort}
          </p>

          <h1 className="h-hero mx-auto mt-4 max-w-[960px] text-[#111827]">
            {eventName}
          </h1>

          <div className="mx-auto mt-7 max-w-[780px] border-y border-[#e5e7eb] py-4 sm:mt-8 sm:py-5">
            <p className="text-xs font-medium tracking-[0.16em] uppercase text-[#6b7280]">
              Conference Theme
            </p>
            <p className="mt-1.5 text-lg font-semibold tracking-tight text-[#0e7a6e] sm:text-2xl">
              {theme}
            </p>
          </div>

          <p className="mx-auto mt-6 max-w-[600px] text-sm leading-relaxed text-[#4b5563] sm:text-base">
            Four days of expository biblical teaching, spiritual warfare, inward and outward
            holiness, and revival gatherings hosted by the Holiness Revival Movement Worldwide.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register" className="btn btn-primary">
              REGISTER NOW
            </Link>
            <a href="#introduction" className="btn btn-outline">
              EXPLORE THE CONFERENCE
            </a>
          </div>
        </div>
      </section>

      {/* C. CONFERENCE INTRODUCTION */}
      <section id="introduction" className="section relative isolate overflow-hidden bg-white pb-6">
        <div
          aria-hidden="true"
          className="flare absolute inset-x-0 bottom-0 -z-10 h-[55%] opacity-40"
        />

        <div className="container-site">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5 space-y-6">
              <p className="text-sm font-medium tracking-wide text-[#0e7a6e]">
                December 8–11, 2026 · Abuja, Nigeria
              </p>
              <h2 className="h-section">
                A global convocation for holiness, spiritual warfare, and revival.
              </h2>
              <p className="text-base leading-relaxed text-[#4b5563]">
                Each year, believers, church chapters, and ministers from across Nigeria, Africa,
                North America, Europe, and Asia assemble at the{" "}
                <span className="text-[#111827] font-medium">{CONFERENCE_INFO.venue}</span> for the{" "}
                <span className="text-[#111827] font-medium">{eventName}</span>.
              </p>
              <p className="text-base leading-relaxed text-[#4b5563]">
                Centered on the 2026 theme,{" "}
                <span className="text-[#0e7a6e] font-medium">
                  “{theme}”
                </span>
                , the four-day gathering opens on Tuesday, December 8 at 4:00 PM WAT with intensive
                morning warfare prayers, scriptural expositions, book reviews, and evening revival
                services.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-6">
                <Link
                  href="/conference"
                  className="link-arrow text-base font-medium text-[#111827]"
                >
                  <span>Full conference overview</span>
                  <ArrowRight className="h-4 w-4 text-[#0e7a6e]" />
                </Link>
                <Link
                  href="/programme"
                  className="link-arrow text-base font-medium"
                >
                  <span>4-day schedule</span>
                  <ArrowRight className="h-4 w-4 text-[#0e7a6e]" />
                </Link>
              </div>
            </div>

            {/* Symmetrical 4-Photo Editorial Grid — equal card dimensions & spacing */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 auto-rows-fr gap-5">
              {[
                {
                  photo: GALLERY_PHOTOS[1],
                  title: "United Congregation",
                  subtitle: "Believers gathering from chapters worldwide at Kwali Campground.",
                },
                {
                  photo: GALLERY_PHOTOS[3],
                  title: "Altar & Repentance",
                  subtitle: "Calls to genuine salvation, restitution, and complete sanctification.",
                },
                {
                  photo: GALLERY_PHOTOS[2],
                  title: "Water Baptism",
                  subtitle: "Obedience to biblical ordinances during the general conference.",
                },
                {
                  photo: GALLERY_PHOTOS[5],
                  title: "Holiness Literature",
                  subtitle: "Afternoon book reviews and multilingual discipleship resources.",
                },
              ].map((card) => (
                <figure
                  key={card.title}
                  className="card group flex h-full flex-col overflow-hidden bg-white p-3 shadow-sm"
                >
                  <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-[#f3f4f6]">
                    <Image
                      src={card.photo.src}
                      alt={card.photo.alt}
                      width={520}
                      height={390}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="flex flex-1 flex-col px-2 pt-3.5 pb-1.5">
                    <p className="text-[15px] font-medium text-[#111827]">{card.title}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#4b5563]">
                      {card.subtitle}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* D. FEATURED MINISTERS */}
      <section className="section">
        <div className="container-site flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          <div className="lg:max-w-[460px] space-y-5">
            <p className="text-sm font-medium tracking-wide text-[#0e7a6e]">
              Servants of God
            </p>
            <h2 className="h-section">
              Pastor Paul Rika and Evang. Linda Paul Rika
            </h2>
            <p className="text-base leading-relaxed text-[#4b5563]">
              Pastor Paul Rika is the founder and International Director of the Holiness Revival
              Movement Worldwide (HOREMOW), established in 2009 to revive biblical righteousness,
              complete sanctification, and prepare believers globally for the rapture and second
              coming of Jesus Christ.
            </p>
            <p className="text-base leading-relaxed text-[#4b5563]">
              Evangelist Linda Paul Rika ministers alongside him across international conferences
              and revival meetings, sharing messages of deep inward and outward holiness, prayer,
              and restitution.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link href="/ministers" className="btn btn-primary">
                Meet the Ministers
              </Link>
              <a
                href={CONFERENCE_INFO.contact.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                Official Channels
              </a>
            </div>
          </div>

          <div className="card grid w-full grid-cols-1 gap-3 p-3 sm:grid-cols-2 lg:w-[600px]">
            {MINISTERS.map((minister) => (
              <figure
                key={minister.name}
                className="group relative aspect-[5/7] overflow-hidden rounded-xl sm:rounded-2xl bg-[#e5e7eb]"
              >
                <Image
                  src={minister.image}
                  alt={minister.alt}
                  width={300}
                  height={420}
                  loading="lazy"
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 pt-20 sm:p-5 sm:pt-24">
                  <span className="block text-[17px] font-medium text-white">
                    {minister.name}
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-[#e5e7eb]">
                    {minister.role}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* E. CONFERENCE INFORMATION & PROGRAMME PREVIEW */}
      <section className="section">
        <div className="container-site space-y-6">
          {/* Primary Conference Info Card with subtle gray ticks motion texture */}
          <div className="card warm-corner bg-ticks relative overflow-hidden p-6 sm:p-10 lg:p-14">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-5 space-y-5">
                <p className="text-sm font-medium tracking-wide text-[#0e7a6e]">
                  Essential Conference Information
                </p>
                <h2 className="h-section">Plan your attendance for IHGC 2026</h2>
                <p className="text-base leading-relaxed text-[#4b5563]">
                  Theme:{" "}
                  <span className="text-[#111827] font-medium">
                    “{theme}”
                  </span>
                </p>

                <dl className="divide-y divide-[#e5e7eb] border-y border-[#e5e7eb] text-sm">
                  <div className="flex items-start gap-3 py-3.5">
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#0e7a6e]" />
                    <div>
                      <dt className="text-[#6b7280]">Dates</dt>
                      <dd className="font-medium text-[#111827]">{CONFERENCE_INFO.dates}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 py-3.5">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#0e7a6e]" />
                    <div>
                      <dt className="text-[#6b7280]">Opening Session</dt>
                      <dd className="font-medium text-[#111827]">
                        {CONFERENCE_INFO.openingDate}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 py-3.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0e7a6e]" />
                    <div>
                      <dt className="text-[#6b7280]">Venue</dt>
                      <dd className="font-medium text-[#111827]">{CONFERENCE_INFO.venue}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 py-3.5">
                    <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-[#0e7a6e]" />
                    <div>
                      <dt className="text-[#6b7280]">Registration Fee</dt>
                      <dd className="font-medium text-[#0e7a6e]">
                        {feeLabel}
                      </dd>
                      <dd className="mt-1 text-xs text-[#4b5563]">
                        {CONFERENCE_INFO.lodgingNotice}
                      </dd>
                    </div>
                  </div>
                </dl>

                <div className="pt-2 flex flex-wrap gap-3">
                  <Link href="/register" className="btn btn-primary">
                    Register Now
                  </Link>
                  <Link href="/programme" className="btn btn-outline">
                    Full Programme
                  </Link>
                </div>
              </div>

              {/* Interactive 4-Day Programme Preview */}
              <div className="lg:col-span-7 rounded-2xl border border-[#e5e7eb] bg-white p-5 sm:p-7 shadow-xs">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#e5e7eb] pb-4">
                  <div>
                    <h3 className="h-card text-[#111827]">Daily Programme Schedule</h3>
                    <p className="mt-1 text-xs text-[#4b5563]">
                      Morning Warfare (6:45 AM) through Evening Revival (9:00 PM WAT)
                    </p>
                  </div>
                  <a
                    href={CONFERENCE_INFO.assets.timetable}
                    download="IHGC-2026-Programme-Schedule.jpeg"
                    className="inline-flex items-center gap-2 text-xs font-medium text-[#0e7a6e] hover:underline whitespace-nowrap shrink-0"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Timetable</span>
                  </a>
                </div>

                {/* Day Tabs */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {PROGRAMME_DAYS.map((day) => {
                    const active = day.date === activeDay;
                    return (
                      <button
                        key={day.date}
                        type="button"
                        onClick={() => setActiveDay(day.date)}
                        className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? "bg-[#0e7a6e] text-white"
                            : "border border-[#e5e7eb] bg-[#f9fafb] text-[#374151] hover:border-[#0e7a6e] hover:text-[#0e7a6e]"
                        }`}
                      >
                        {day.shortLabel}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5">
                  <p className="text-xs font-medium text-[#0e7a6e]">
                    {selectedDay.dayLabel} · {selectedDay.theme}
                  </p>
                  <ul className="mt-3 divide-y divide-[#f3f4f6]">
                    {selectedDay.sessions.map((session) => (
                      <li
                        key={`${selectedDay.date}-${session.time}`}
                        className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                      >
                        <div className="min-w-0">
                          <span className="text-xs text-[#6b7280]">{session.category}</span>
                          <p className="text-sm font-medium text-[#111827]">{session.title}</p>
                        </div>
                        <span className="shrink-0 font-mono text-xs text-[#0e7a6e] tabular-nums">
                          {session.time}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Card Asymmetric Split (40% / 60%) */}
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Left 40% Card */}
            <div className="card flex flex-col justify-between p-6 sm:p-10 lg:w-[42%]">
              <div className="space-y-4">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#e5e7eb] bg-white text-[#0e7a6e]">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="h-card text-[#111827]">
                  Individual &amp; Group Registration
                </h3>
                <p className="text-[15px] leading-relaxed text-[#4b5563]">
                  Register yourself as an individual participant or register your entire chapter,
                  unit, or zone together with an express check-in QR code and invite links.
                </p>
              </div>

              <div className="mt-8 space-y-3 border-t border-[#e5e7eb] pt-6">
                <Link href="/register" className="btn btn-primary w-full sm:w-auto">
                  <span>Start Online Registration</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <div>
                  <Link href="/find-my-tickets" className="link-arrow text-sm font-medium">
                    <span>Already registered? Find My Tickets</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right 60% Card */}
            <div className="card relative flex flex-col overflow-hidden sm:flex-row lg:w-[58%]">
              <div className="flex flex-1 flex-col justify-between p-6 sm:p-10">
                <div className="space-y-3">
                  <p className="text-xs font-medium tracking-wide text-[#0e7a6e]">
                    Confirmed Conference Venue
                  </p>
                  <h3 className="h-card text-[#111827]">Holiness Campground, Kwali</h3>
                  <p className="text-[15px] leading-relaxed text-[#4b5563]">
                    {CONFERENCE_INFO.landmark} Accommodation and meals are arranged independently
                    by participants.
                  </p>
                </div>

                <div className="mt-8 pt-4">
                  <Link
                    href="/camp-info"
                    className="link-arrow text-base font-medium text-[#111827]"
                  >
                    <span>Camp information &amp; arrival guide</span>
                    <ArrowRight className="h-4 w-4 text-[#0e7a6e]" />
                  </Link>
                </div>
              </div>

              <div className="relative h-56 w-full shrink-0 sm:h-auto sm:w-[44%]">
                <Image
                  src={CONFERENCE_INFO.assets.campground}
                  alt="Holiness Campground, Kwali, Abuja"
                  width={400}
                  height={500}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#f4f5f7]/60 via-transparent to-transparent sm:bg-gradient-to-r sm:from-[#f4f5f7] sm:via-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* F. ABOUT HOREMOW */}
      <section className="section">
        <div className="container-site">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <div className="lg:max-w-[500px]">
              <p className="text-sm font-medium tracking-wide text-[#0e7a6e]">
                About the Ministry
              </p>
              <h2 className="h-section mt-2">
                Holiness Revival Movement Worldwide
              </h2>
            </div>
            <div className="lg:max-w-[540px]">
              <p className="text-base leading-relaxed text-[#4b5563]">
                Founded in 2009 by Pastor Paul Rika and formally inaugurated in Kwali, Abuja in
                2010, HOREMOW is a non-denominational end-time movement reviving biblical
                righteousness, holiness, and rapture readiness across denominations.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-6 lg:mt-14">
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="card bg-ticks flex flex-col justify-between gap-10 p-6 sm:p-10 lg:w-[36%]">
                <span className="text-xs font-medium tracking-wide text-[#0e7a6e]">
                  Founded 2009 · Inaugurated 2010
                </span>
                <div>
                  <h3 className="h-card text-[#111827]">Across the Body of Christ</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-[#4b5563]">
                    HOREMOW is not structured as a separate church denomination. It operates across
                    and within existing Christian churches to unite believers under biblical truth
                    and sanctification.
                  </p>
                </div>
              </div>

              <div className="card bg-ticks relative flex flex-col overflow-hidden lg:flex-1 lg:flex-row">
                <div className="relative z-10 flex flex-1 flex-col justify-between gap-10 p-6 sm:p-10">
                  <span className="text-xs font-medium tracking-wide text-[#0e7a6e]">
                    66 Books · One Working Manual
                  </span>
                  <div className="lg:max-w-[380px]">
                    <h3 className="h-card text-[#111827]">Inward &amp; Outward Holiness</h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-[#4b5563]">
                      The movement treats the 66 books of the Holy Bible as its absolute and final
                      working manual, emphasizing genuine repentance, practical restitution, heart
                      purity, and urgent rapture readiness.
                    </p>
                  </div>
                </div>
                <div className="relative h-56 w-full shrink-0 lg:h-auto lg:w-[44%]">
                  <Image
                    src={CONFERENCE_INFO.assets.about}
                    alt="Pastor Paul Rika ministering during HOREMOW conference"
                    width={500}
                    height={600}
                    loading="lazy"
                    className="h-full w-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#f9fafb] via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#f9fafb] lg:via-transparent" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {ABOUT_PILLARS.map((pillar) => (
                <div
                  key={pillar.index}
                  className="card bg-white flex flex-col justify-between p-6 sm:p-8"
                >
                  <span className="font-mono text-xs text-[#0e7a6e]">{pillar.index}.</span>
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-[#111827]">{pillar.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-[#4b5563]">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/about" className="btn btn-outline">
                Discover Our Story
              </Link>
              <Link
                href="/contact"
                className="link-arrow px-2 text-sm font-medium text-[#111827]"
              >
                <span>Contact Conference Office</span>
                <ArrowRight className="h-4 w-4 text-[#0e7a6e]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* G. CONFERENCE GALLERY */}
      <GallerySection />

      {/* H. OFFICIAL CONFERENCE FLYER */}
      <section className="section">
        <div className="container-site">
          <div className="card relative isolate grid overflow-hidden lg:grid-cols-[1fr_1fr] lg:items-center">
            <div
              aria-hidden="true"
              className="flare absolute inset-x-0 bottom-0 -z-10 h-[55%] opacity-45"
            />

            <div className="p-6 sm:p-10 lg:py-20 lg:pl-16 space-y-5">
              <p className="text-sm font-medium tracking-wide text-[#0e7a6e]">
                Official Conference Flyer
              </p>
              <h2 className="h-section">Spread the word — share the IHGC 2026 flyer</h2>
              <p className="text-base leading-relaxed text-[#4b5563]">
                {settings.flyerDescription ||
                  "Download the official International Holiness General Conference 2026 flyer and share it across your chapter, zone, cell fellowships, and social channels."}
              </p>
              <p className="text-sm text-[#374151]">
                Theme: “{theme}” · {CONFERENCE_INFO.dates} · Registration
                is open now at {feeLabel}.
              </p>

              <div className="pt-3 flex flex-wrap gap-3">
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

            <div className="relative flex justify-center p-6 pt-0 sm:p-10 lg:py-12">
              <div
                aria-hidden="true"
                className="dots absolute inset-10 opacity-70"
              />
              <button
                type="button"
                onClick={() => setFlyerModalOpen(true)}
                aria-label="Enlarge official IHGC 2026 conference flyer"
                className="group relative w-full max-w-[380px] overflow-hidden rounded-2xl border border-[#d1d5db] bg-white shadow-[0_30px_60px_-20px_rgba(17,24,39,0.18)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7a6e]"
              >
                <Image
                  src={CONFERENCE_INFO.assets.flyer}
                  alt="Official International Holiness General Conference 2026 Flyer"
                  width={380}
                  height={520}
                  loading="lazy"
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-[#0e7a6e] px-3 py-1.5 text-xs font-medium text-white shadow-sm">
                  <Expand className="h-3.5 w-3.5" />
                  <span>Preview Full Flyer</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* I. FREQUENTLY ASKED QUESTIONS */}
      <FaqAccordion />

      {/* COUNTDOWN — existing flip-clock + 3D dial design */}
      <section className="section pb-16 sm:pb-24">
        <div className="container-site text-center">
          <h2 className="h-section mx-auto max-w-[680px]">
            {eventName}
          </h2>
          <p className="mt-3 text-base text-[#4b5563] sm:text-lg">
            {CONFERENCE_INFO.openingDate} · {CONFERENCE_INFO.venueShort}
          </p>

          <div className="mx-auto mt-10 max-w-[720px] sm:mt-12">
            <CountdownClock
              startsAt={SITE_CONFIG.startsAt}
              endsAt={SITE_CONFIG.endsAt}
              theme=""
              title={eventName}
            />
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register" className="btn btn-primary">
              Register Now
            </Link>
            <Link href="/programme" className="btn btn-outline">
              See the Programme
            </Link>
          </div>
        </div>
      </section>

      {/* Flyer Lightbox Modal */}
      {flyerModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Official IHGC 2026 Flyer Preview"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onClick={() => setFlyerModalOpen(false)}
        >
          <div
            className="relative max-w-2xl w-full rounded-2xl border border-[#e5e7eb] bg-white overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-3.5">
              <p className="text-sm font-medium text-[#111827]">
                Official IHGC 2026 Flyer
              </p>
              <div className="flex items-center gap-2">
                <a
                  href={CONFERENCE_INFO.assets.flyer}
                  download="IHGC-2026-Official-Flyer.png"
                  className="btn btn-primary !min-h-[38px] !px-3.5 !py-1.5 !text-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  aria-label="Close flyer preview"
                  onClick={() => setFlyerModalOpen(false)}
                  className="grid size-9 place-items-center rounded-lg border border-[#e5e7eb] bg-[#f9fafb] text-[#111827] hover:bg-[#f3f4f6] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="max-h-[80vh] overflow-auto bg-[#f4f5f7] p-4 flex justify-center">
              <Image
                src={CONFERENCE_INFO.assets.flyer}
                alt="Official International Holiness General Conference 2026 Flyer"
                width={800}
                height={1100}
                className="max-h-[74vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const eventStructuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: SITE_CONFIG.eventTitle,
    description: "Theme: " + SITE_CONFIG.theme,
    startDate: SITE_CONFIG.startsAt,
    endDate: SITE_CONFIG.endsAt,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: SITE_CONFIG.venue.name,
      address: SITE_CONFIG.venue.landmark + ", " + SITE_CONFIG.venue.location,
    },
    organizer: {
      "@type": "Organization",
      name: SITE_CONFIG.ministry,
    },
  };

  return (
    <LandingSettingsProvider>
      <Header />
      <main className="flex-1">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(eventStructuredData),
          }}
        />
        <HomeContent />
      </main>
      <Footer />
    </LandingSettingsProvider>
  );
}
