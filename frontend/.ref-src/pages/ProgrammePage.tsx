import { useState } from 'react';
import { Download, Expand, X } from 'lucide-react';
import { CONFERENCE_INFO, PROGRAMME_DAYS } from '../data/conferenceData';

interface ProgrammePageProps {
  onNavigate: (path: string) => void;
}

export function ProgrammePage({ onNavigate }: ProgrammePageProps) {
  const [selectedDate, setSelectedDate] = useState(PROGRAMME_DAYS[0].date);
  const [posterOpen, setPosterOpen] = useState(false);

  const activeDay =
    PROGRAMME_DAYS.find((d) => d.date === selectedDate) || PROGRAMME_DAYS[0];

  return (
    <div className="relative isolate min-h-screen bg-white pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div aria-hidden="true" className="bg-ticks pointer-events-none absolute inset-x-0 top-0 h-[420px] -z-10" />
      <div
        aria-hidden="true"
        className="glow absolute -top-[340px] left-1/2 -z-10 h-[720px] w-[1400px] -translate-x-1/2 [--glow-strength:0.22]"
      />

      <div className="container-site space-y-12">
        <div className="max-w-[780px] space-y-4">
          <p className="text-sm font-medium tracking-wide text-[#0e7a6e]">
            Official Conference Timetable · {CONFERENCE_INFO.dates}
          </p>
          <h1 className="h-hero text-[#111827]">Conference Programme &amp; Schedule</h1>
          <p className="text-base leading-relaxed text-[#4b5563]">
            Theme:{' '}
            <span className="text-[#111827] font-medium">“{CONFERENCE_INFO.themeTitleCase}”</span>{' '}
            · Sessions run daily from 6:45 AM Morning Warfare through 9:00 PM Revival Messages at{' '}
            {CONFERENCE_INFO.venue}.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href={CONFERENCE_INFO.assets.timetable}
              download="IHGC-2026-Programme-Schedule.jpeg"
              className="btn btn-primary"
            >
              <Download className="h-4 w-4" />
              <span>Download Timetable (JPEG)</span>
            </a>
            <button
              type="button"
              onClick={() => setPosterOpen(true)}
              className="btn btn-outline"
            >
              <Expand className="h-4 w-4" />
              <span>Preview Full Poster</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5 card bg-[#f4f5f7] p-4 sm:p-6">
            <button
              type="button"
              onClick={() => setPosterOpen(true)}
              className="group relative block w-full overflow-hidden rounded-xl border border-[#e5e7eb] bg-white cursor-pointer"
            >
              <img
                src={CONFERENCE_INFO.assets.timetable}
                alt="Official IHGC 2026 Conference Timetable Poster"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-lg bg-[#0e7a6e] px-3 py-1.5 text-xs font-medium text-white shadow-sm">
                <Expand className="h-3.5 w-3.5" />
                <span>Click to enlarge</span>
              </span>
            </button>
            <p className="mt-3 text-center text-xs text-[#4b5563]">
              Official Conference Timetable Poster · Kwali, Abuja
            </p>
          </div>

          <div className="lg:col-span-7 card bg-white p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <h2 className="h-card text-[#111827]">Daily Session Breakdown</h2>
              <p className="mt-1 text-sm text-[#4b5563]">
                Select a conference day to inspect morning warfare, teachings, book reviews, and
                evening revival sessions.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {PROGRAMME_DAYS.map((day) => {
                const active = day.date === selectedDate;
                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => setSelectedDate(day.date)}
                    className={`rounded-lg px-4 py-2.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-[#0e7a6e] text-white'
                        : 'border border-[#e5e7eb] bg-[#f9fafb] text-[#374151] hover:border-[#0e7a6e] hover:text-[#0e7a6e]'
                    }`}
                  >
                    {day.dayLabel}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-[#e5e7eb] pt-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg font-medium text-[#111827]">
                  {activeDay.dayLabel} — {activeDay.theme}
                </h3>
                <span className="text-xs font-medium text-[#0e7a6e] tabular-nums">
                  {activeDay.sessions.length} Scheduled Sessions
                </span>
              </div>

              <ul className="mt-4 divide-y divide-[#f3f4f6]">
                {activeDay.sessions.map((s) => (
                  <li
                    key={`${activeDay.date}-${s.time}`}
                    className="flex flex-col gap-1.5 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                  >
                    <div>
                      <p className="text-xs font-medium text-[#0e7a6e]">{s.category}</p>
                      <p className="mt-0.5 text-base font-medium text-[#111827]">{s.title}</p>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-[#4b5563] tabular-nums">
                      {s.time}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="card p-6 sm:p-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="h-card text-[#111827]">
              Ready to attend the International Holiness General Conference?
            </h2>
            <p className="mt-2 text-sm text-[#4b5563]">
              Registration is open online for individuals and church groups worldwide.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/register')}
            className="btn btn-primary shrink-0"
          >
            Proceed to Registration
          </button>
        </div>
      </div>

      {posterOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Official Timetable Poster"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onClick={() => setPosterOpen(false)}
        >
          <div
            className="relative max-w-3xl w-full rounded-2xl border border-[#e5e7eb] bg-white overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-3.5">
              <p className="text-sm font-medium text-[#111827]">Official IHGC 2026 Timetable</p>
              <button
                type="button"
                aria-label="Close timetable preview"
                onClick={() => setPosterOpen(false)}
                className="grid size-9 place-items-center rounded-lg border border-[#e5e7eb] bg-[#f9fafb] text-[#111827] hover:bg-[#f3f4f6] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[82vh] overflow-auto bg-[#f4f5f7] p-4 flex justify-center">
              <img
                src={CONFERENCE_INFO.assets.timetable}
                alt="Official IHGC 2026 Timetable"
                referrerPolicy="no-referrer"
                className="max-h-[76vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
