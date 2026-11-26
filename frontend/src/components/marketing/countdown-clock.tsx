"use client";

import { useEffect, useState } from "react";
import { ConferenceClock3D } from "@/components/marketing/conference-clock-3d";
import { SITE_CONFIG } from "@/config/site";

type DateLike = string | number | Date | null | undefined;
type Phase = "before" | "live" | "ended";

const toMs = (v: DateLike): number => {
  if (v === null || v === undefined || v === "") return NaN;
  if (v instanceof Date) return v.getTime();
  if (typeof v === "number") return v;
  return Date.parse(v);
};

/**
 * Counts down to the start. While the conference is on, it counts down to the
 * end instead. After the end it rests at zero.
 */
function useConferenceCountdown(startsAt: DateLike, endsAt: DateLike) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      timer = setTimeout(tick, 1000 - (t % 1000) + 5); // stay on the second
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  const start = toMs(startsAt);
  const end = toMs(endsAt);

  let phase: Phase = "before";
  let target: number | null = Number.isNaN(start) ? null : start;

  if (now !== null) {
    if (!Number.isNaN(start) && now < start) {
      phase = "before";
      target = start;
    } else if (!Number.isNaN(end) && now < end) {
      phase = "live";
      target = end;
    } else if (!Number.isNaN(start) || !Number.isNaN(end)) {
      phase = "ended";
      target = null;
    }
  }

  const remaining = target !== null && now !== null ? Math.max(0, target - now) : 0;

  return {
    phase,
    target,
    days: Math.floor(remaining / 86400000),
    hours: Math.floor(remaining / 3600000) % 24,
    minutes: Math.floor(remaining / 60000) % 60,
    seconds: Math.floor(remaining / 1000) % 60,
  };
}

const FC_CSS = `
/* ---------- timer above the clock on phones, beside it on desktop ---------- */
.cc-wrap{position:relative;width:100%}
.cc-body{position:relative;display:flex;flex-direction:column;align-items:center}
@media (min-width:640px){.cc-body{flex-direction:row;align-items:center}}
.cc-clock-glow{position:absolute;inset:6%;border-radius:9999px;pointer-events:none;
  background:radial-gradient(closest-side,rgba(142,227,214,.30),transparent 72%);filter:blur(14px);animation:cc-breathe 5s ease-in-out infinite}
@keyframes cc-breathe{0%,100%{transform:scale(.92);opacity:.7}50%{transform:scale(1.06);opacity:1}}

/* ---------- flip tiles ---------- */
.fc-grid{display:grid;grid-template-columns:repeat(4,minmax(0,104px));gap:8px}
@media (min-width:640px){.fc-grid{gap:12px}}

.fc-tile{position:relative;aspect-ratio:.86;container-type:inline-size;perspective:520px;border-radius:7px;
  background:#151925;box-shadow:0 14px 30px rgba(0,0,0,.4),inset 0 0 0 1px rgba(142,227,214,.10)}

/* Static halves */
.fc-half{position:absolute;left:0;right:0;height:50%;overflow:hidden}
.fc-top{top:0;border-radius:7px 7px 0 0;background:linear-gradient(180deg,#252c3d 0%,#1b2131 100%)}
.fc-bottom{bottom:0;border-radius:0 0 7px 7px;background:linear-gradient(180deg,#181d2b 0%,#121622 100%)}

/* The number is as tall as the whole tile, so each half shows half of it */
.fc-num{position:absolute;left:0;width:100%;height:200%;display:flex;align-items:center;justify-content:center;
  font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:-.02em;line-height:1;color:#e8eef2;font-size:62cqw;
  text-shadow:0 0 18px rgba(142,227,214,.14)}
.fc-wide .fc-num{font-size:46cqw}
.fc-top .fc-num,.fc-flap-front .fc-num{top:0}
.fc-bottom .fc-num,.fc-flap-back .fc-num{bottom:0}

/* Flipping flaps */
.fc-flap{position:absolute;left:0;right:0;height:50%;overflow:hidden;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.fc-flap-front{top:0;z-index:3;transform-origin:50% 100%;border-radius:7px 7px 0 0;background:linear-gradient(180deg,#252c3d,#1b2131)}
.fc-flap-back{bottom:0;z-index:2;transform-origin:50% 0;border-radius:0 0 7px 7px;background:linear-gradient(180deg,#181d2b,#121622);transform:rotateX(90deg)}
.fc-flap-front.fc-run{animation:fc-front .32s ease-in forwards}
.fc-flap-back.fc-run{animation:fc-back .32s ease-out .32s forwards}
@keyframes fc-front{from{transform:rotateX(0)}to{transform:rotateX(-90deg)}}
@keyframes fc-back{from{transform:rotateX(90deg)}to{transform:rotateX(0)}}

.fc-split{position:absolute;left:0;right:0;top:50%;height:2px;margin-top:-1px;z-index:4;background:#06080d;box-shadow:0 1px 0 rgba(255,255,255,.05)}
.fc-label{position:absolute;left:9px;bottom:7px;z-index:5;font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#8a95a8}
.fc-tile[data-unit="seconds"] .fc-label{color:#8EE3D6}

@media (prefers-reduced-motion:reduce){
  .fc-flap-front.fc-run,.fc-flap-back.fc-run,.cc-clock-glow{animation:none}
  .fc-flap-front{transform:rotateX(-90deg)}
  .fc-flap-back{transform:none}
}
`;

/** One flip tile: the old number folds down and the new one lands. */
function FlipUnit({
  value,
  label,
  unit,
  minDigits = 2,
}: {
  value: number;
  label: string;
  unit: string;
  minDigits?: number;
}) {
  const digits = Math.max(minDigits, String(value).length);
  const text = String(value).padStart(digits, "0");
  const [state, setState] = useState({ cur: text, prev: text, tick: 0 });

  // New value arrives: start a flip
  useEffect(() => {
    setState((s) => (s.cur === text ? s : { cur: text, prev: s.cur, tick: s.tick + 1 }));
  }, [text]);

  // When the flip has landed, the bottom half catches up
  useEffect(() => {
    if (state.tick === 0) return;
    const id = setTimeout(() => setState((s) => ({ ...s, prev: s.cur })), 660);
    return () => clearTimeout(id);
  }, [state.tick]);

  const run = state.tick > 0 ? "fc-run" : "";

  return (
    <div className={`fc-tile ${digits > 2 ? "fc-wide" : ""}`} data-unit={unit}>
      <div className="fc-half fc-top">
        <span className="fc-num">{state.cur}</span>
      </div>
      <div className="fc-half fc-bottom">
        <span className="fc-num">{state.prev}</span>
      </div>
      <div key={`f${state.tick}`} className={`fc-flap fc-flap-front ${run}`}>
        <span className="fc-num">{state.prev}</span>
      </div>
      <div key={`b${state.tick}`} className={`fc-flap fc-flap-back ${run}`}>
        <span className="fc-num">{state.cur}</span>
      </div>
      <div className="fc-split" />
      <span className="fc-label">{label}</span>
    </div>
  );
}

export function CountdownClock({
  startsAt,
  endsAt,
  theme,
  title,
  show3DClock = true,
  showFlip = true,
  className,
  clockClassName,
}: {
  startsAt?: DateLike;
  endsAt?: DateLike;
  theme: string;
  /** Conference name printed on the clock dial */
  title?: string;
  /** Lets the hero place the 3D clock beside the name/theme plates. */
  show3DClock?: boolean;
  /** Lets the hero keep the flip tiles in their own row on larger screens. */
  showFlip?: boolean;
  className?: string;
  clockClassName?: string;
}) {
  const { target, days, hours, minutes, seconds } = useConferenceCountdown(startsAt, endsAt);

  const dialTitle =
    title ?? (SITE_CONFIG as { eventTitle?: string }).eventTitle ?? "International Holiness General Conference 2026";

  return (
    <div className={className ?? "cc-wrap"}>
      <style dangerouslySetInnerHTML={{ __html: FC_CSS }} />

      <div data-countdown className="cc-body gap-4 sm:flex-row sm:gap-6">
        {/* 3D clock: your logo in the middle, conference name + theme around the dial */}
        {show3DClock && (
          <div data-clock-3d className="relative z-[2] order-2 shrink-0">
            <span aria-hidden className="cc-clock-glow" />
            <ConferenceClock3D
              target={target}
              title={dialTitle}
              theme={theme}
              logoSrc={SITE_CONFIG.logo.src}
              className={clockClassName ?? "h-[168px] w-[168px] sm:h-[200px] sm:w-[200px]"}
            />
          </div>
        )}

        {/* Flip countdown: above the clock on phones, to its left on desktop */}
        {showFlip && (
          <div className="relative z-[2] order-1 w-full min-w-0 flex-1">
            <div className="fc-grid mx-auto sm:mx-0" aria-hidden>
              <FlipUnit value={days} label="Days" unit="days" />
              <FlipUnit value={hours} label="Hours" unit="hours" />
              <FlipUnit value={minutes} label="Minutes" unit="minutes" />
              <FlipUnit value={seconds} label="Seconds" unit="seconds" />
            </div>

            <span className="sr-only" role="timer">
              {days} days, {hours} hours, {minutes} minutes and {seconds} seconds
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
