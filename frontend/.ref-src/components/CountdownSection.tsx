import { useEffect, useState } from 'react';
import { CONFERENCE_INFO } from '../data/conferenceData';

interface CountdownSectionProps {
  onNavigate: (path: string) => void;
}

interface TimeLeft {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

function getTimeLeft(): TimeLeft {
  const target = new Date(CONFERENCE_INFO.openingIso).getTime();
  const diff = Math.max(0, target - Date.now());

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    days: pad(days),
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
  };
}

export function CountdownSection({ onNavigate }: CountdownSectionProps) {
  const [time, setTime] = useState<TimeLeft>(() => getTimeLeft());

  useEffect(() => {
    const id = window.setInterval(() => {
      setTime(getTimeLeft());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const units = [
    { label: 'Days', value: time.days },
    { label: 'Hours', value: time.hours },
    { label: 'Minutes', value: time.minutes },
    { label: 'Seconds', value: time.seconds },
  ];

  return (
    <section className="section pb-16 sm:pb-24">
      <div className="container-site text-center">
        <h2 className="h-section mx-auto max-w-[680px]">
          {CONFERENCE_INFO.title}
        </h2>
        <p className="mt-3 text-base text-[#4b5563] sm:text-lg">
          {CONFERENCE_INFO.openingDate} · {CONFERENCE_INFO.venueShort}
        </p>

        <div className="mx-auto mt-10 max-w-[720px] sm:mt-12">
          <div
            role="timer"
            aria-label="Countdown to International Holiness General Conference 2026"
            className="grid grid-cols-4 gap-2.5 sm:gap-5"
          >
            {units.map((unit) => (
              <div key={unit.label}>
                <div className="flip">
                  <span className="relative z-[1] text-[clamp(2rem,6vw,4.5rem)] font-medium tracking-[-0.03em] text-[#111827] tabular-nums">
                    {unit.value}
                  </span>
                </div>
                <p className="mt-3 text-[13px] text-[#4b5563] sm:text-base">{unit.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/register"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/register');
            }}
            className="btn btn-primary"
          >
            Register Now
          </a>
          <a
            href="/programme"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/programme');
            }}
            className="btn btn-outline"
          >
            See the Programme
          </a>
        </div>
      </div>
    </section>
  );
}
