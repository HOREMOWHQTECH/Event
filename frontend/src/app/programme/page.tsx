"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Download, Calendar, Clock, MapPin, X } from "lucide-react";
import { CONFERENCE_INFO, PROGRAMME_DAYS } from "@/data/conference";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";

export default function ProgrammePage() {
  const [activeDay, setActiveDay] = useState(PROGRAMME_DAYS[0].date);
  const [posterOpen, setPosterOpen] = useState(false);

  const selectedDay =
    PROGRAMME_DAYS.find((d) => d.date === activeDay) || PROGRAMME_DAYS[0];

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
            Conference Programme &amp; Schedule
          </p>
          <h1 className="h-hero text-[#111827]">{CONFERENCE_INFO.title}</h1>
          <p className="text-base leading-relaxed text-[#4b5563] sm:text-lg">
            Four days of expository biblical teaching, spiritual warfare, inward and outward
            holiness, and revival gatherings.
          </p>
        </div>

        {/* Timetable poster preview */}
        <div className="card bg-white overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 p-6 sm:p-10 space-y-5">
            <p className="text-xs font-medium tracking-wide text-[#0e7a6e]">
              Official Timetable Poster
            </p>
            <h2 className="h-card text-[#111827]">Daily Session Breakdown</h2>
            <p className="text-sm leading-relaxed text-[#4b5563]">
              Morning Warfare (6:45 AM) through Evening Revival (9:00 PM WAT). Full printed
              programmes are available at the venue.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPosterOpen(true)}
                className="btn btn-outline"
              >
                <Calendar className="h-4 w-4" />
                <span>Preview Poster</span>
              </button>
              <a
                href={CONFERENCE_INFO.assets.timetable}
                download="IHGC-2026-Programme-Schedule.jpeg"
                className="btn btn-primary"
              >
                <Download className="h-4 w-4" />
                <span>Download Timetable</span>
              </a>
            </div>
          </div>
          <div className="lg:col-span-7 relative min-h-[320px]">
            <Image
              src={CONFERENCE_INFO.assets.timetable}
              alt="IHGC 2026 Programme Schedule Poster"
              fill
              className="object-cover object-top"
            />
          </div>
        </div>

        {/* Day tabs + sessions */}
        <div className="card bg-white p-6 sm:p-10 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#e5e7eb] pb-5">
            <div>
              <h2 className="h-card text-[#111827]">Session Schedule</h2>
              <p className="mt-1 text-xs text-[#4b5563]">
                All times are West Africa Time (WAT, UTC+1)
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6b7280]">
              <MapPin className="h-3.5 w-3.5 text-[#0e7a6e]" />
              <span>{CONFERENCE_INFO.venueShort}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
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

          <div>
            <p className="text-xs font-medium text-[#0e7a6e]">
              {selectedDay.dayLabel} · {selectedDay.theme}
            </p>
            <ul className="mt-4 divide-y divide-[#f3f4f6]">
              {selectedDay.sessions.map((session) => (
                <li
                  key={`${selectedDay.date}-${session.time}`}
                  className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <div className="min-w-0">
                    <span className="text-xs text-[#6b7280]">{session.category}</span>
                    <p className="text-sm font-medium text-[#111827] sm:text-base">
                      {session.title}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-xs text-[#0e7a6e] tabular-nums">
                    <Clock className="h-3.5 w-3.5" />
                    {session.time}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card p-6 sm:p-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="h-card text-[#111827]">Ready to attend IHGC 2026?</h2>
            <p className="mt-1 text-sm text-[#4b5563]">
              Registration is open now — {CONFERENCE_INFO.feeSummary}.
            </p>
          </div>
          <Link href="/register" className="btn btn-primary shrink-0">
            Register Now
          </Link>
        </div>
      </div>

      {/* Poster modal */}
      {posterOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="IHGC 2026 Programme Poster"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onClick={() => setPosterOpen(false)}
        >
          <div
            className="relative max-w-3xl w-full rounded-2xl border border-[#e5e7eb] bg-white overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-3.5">
              <p className="text-sm font-medium text-[#111827]">
                IHGC 2026 Programme Schedule
              </p>
              <button
                type="button"
                aria-label="Close poster preview"
                onClick={() => setPosterOpen(false)}
                className="grid size-9 place-items-center rounded-lg border border-[#e5e7eb] bg-[#f9fafb] text-[#111827] hover:bg-[#f3f4f6] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-auto bg-[#f4f5f7] p-4 flex justify-center">
              <Image
                src={CONFERENCE_INFO.assets.timetable}
                alt="IHGC 2026 Programme Schedule Poster"
                width={900}
                height={1200}
                className="max-h-[74vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
