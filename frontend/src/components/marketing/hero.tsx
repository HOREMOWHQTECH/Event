"use client";

import { Calendar } from "lucide-react";
import { CountdownClock } from "@/components/marketing/countdown-clock";
import { HeroBackground } from "@/components/marketing/hero-background";
import { ParallaxLayer } from "@/components/marketing/parallax-layer";
import { FitTwoLines } from "@/components/marketing/fit-two-lines";
import { useLandingSettings } from "@/components/marketing/landing-settings";
import { SITE_CONFIG } from "@/config/site";

const TOP_OUTER = ["14px 0", "calc(100% - 14px) 0", "100% 14px", "100% 100%", "0 100%", "0 14px"];
const TOP_INNER = [
  "14.6px 1.5px",
  "calc(100% - 14.6px) 1.5px",
  "calc(100% - 1.5px) 14.6px",
  "calc(100% - 1.5px) calc(100% - 1.5px)",
  "1.5px calc(100% - 1.5px)",
  "1.5px 14.6px",
];
const BOT_OUTER = ["0 0", "100% 0", "100% calc(100% - 14px)", "calc(100% - 14px) 100%", "0 100%"];
const BOT_INNER = [
  "1.5px 1.5px",
  "calc(100% - 1.5px) 1.5px",
  "calc(100% - 1.5px) calc(100% - 14.6px)",
  "calc(100% - 14.6px) calc(100% - 1.5px)",
  "1.5px calc(100% - 1.5px)",
];
const shape = (outer: string[]) => `polygon(${outer.join(", ")})`;
const ring = (outer: string[], inner: string[]) =>
  `polygon(evenodd, ${outer.join(", ")}, ${inner.join(", ")})`;

const HB_CSS = `
/* NO WHITE ANYWHERE - solid dark plates, teal hairline only */
.hb-wrap{position:relative}
.hb-plate{position:relative;overflow:hidden}
.hb-top{background:#0E1020}
.hb-bot{background:#07181D}
.hb-border{position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden;background:rgba(142,227,214,.28)}
.hb-border::before{display:none}
.hb-border-bot::before{display:none}
.hb-bar{position:absolute;left:0;top:0;bottom:0;width:3px;z-index:2;background:linear-gradient(180deg,#8EE3D6,rgba(142,227,214,0))}
.hb-seam{height:1px;width:100%;background:linear-gradient(90deg,transparent,rgba(142,227,214,.5) 12%,rgba(142,227,214,.5) 88%,transparent)}
.hb-top-cut{height:1px;width:100%;background:linear-gradient(90deg,transparent,rgba(142,227,214,.5) 12%,rgba(142,227,214,.5) 88%,transparent)}
`;

export function Hero() {
  const { heroDatesLabel, startsAt, endsAt } = useLandingSettings();
  // Always show the full conference theme, even if settings shorten it.
  const themeTitle = SITE_CONFIG.theme.trim().toUpperCase();

  return (
    <section
      data-track="hero"
      className="relative w-full lg:min-h-[600px] flex items-center bg-[#0E1020] overflow-hidden"
    >
      <style dangerouslySetInnerHTML={{ __html: HB_CSS }} />

      {/* REMOVED: hero-heaven white glow */}

      <ParallaxLayer speed={0.4} className="absolute inset-0">
        <HeroBackground desktopLift={10} />
      </ParallaxLayer>

      <div className="relative z-10 mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-8 px-4 pb-14 pt-[350px] sm:px-8 sm:pt-[390px] md:gap-6 md:pb-10 md:pt-[320px] lg:grid-cols-12 lg:gap-8 lg:py-12">
        <div className="hidden lg:block lg:col-span-5" />

        <div
          data-hero-content
          className="grid w-full grid-cols-1 items-start gap-2.5 text-left sm:gap-3 md:grid-cols-[minmax(0,500px)_auto] md:items-center md:justify-center md:gap-x-5 md:gap-y-3 lg:col-span-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:justify-start"
        >
          <div className="min-w-0 md:col-start-1 md:row-start-1">
            <ParallaxLayer speed={0.04}>
            <div
              className="hero-fade inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wider uppercase text-gray-300 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-sm"
              style={{ animationDelay: "0.05s" }}
            >
              <Calendar className="w-3.5 h-3.5 text-[#8EE3D6]" strokeWidth={1.8} />
              <span>{heroDatesLabel}</span>
            </div>
          </ParallaxLayer>

            <ParallaxLayer speed={0.1} className="mt-2.5 w-full sm:mt-3">
              <div className="hb-wrap -mx-[6px] w-[calc(100%+12px)] sm:mx-0 sm:w-full">
                <div aria-hidden className="hb-top-cut mb-1.5 sm:mb-1.5 md:mb-1" />

                <div className="relative grid grid-rows-2 gap-1 md:gap-0.5">
                <div className="hero-fade relative" style={{ animationDelay: "0.2s" }}>
                  <div
                    className="hb-plate hb-top relative flex h-full flex-col justify-center py-3 pl-4 pr-4 sm:py-3 sm:pl-5 sm:pr-5 md:py-3.5 md:pl-6 md:pr-6 lg:py-3.5"
                    style={{ clipPath: shape(TOP_OUTER) }}
                  >
                    <span aria-hidden className="hb-bar" />
                    <h1 className="relative z-[2] whitespace-nowrap text-[4.2vw] font-extrabold uppercase leading-[1.1] tracking-tight text-white sm:text-2xl md:text-[20px] md:leading-[1.05] lg:text-[20px]">
                      INTERNATIONAL HOLINESS
                    </h1>
                    <h2 className="relative z-[2] mt-0.5 whitespace-nowrap text-[3.2vw] font-bold uppercase leading-[1.2] tracking-wide text-[#8EE3D6] sm:mt-0.5 sm:text-base md:text-[13px] md:leading-[1.1] lg:text-[13px]">
                      GENERAL CONFERENCE 2026
                    </h2>
                  </div>
                  <div
                    aria-hidden
                    className="hb-border hb-border-top"
                    style={{ clipPath: ring(TOP_OUTER, TOP_INNER) }}
                  />
                </div>

                {/* THEME BOX */}
                <div className="hero-fade relative" style={{ animationDelay: "0.5s" }}>
                  <div
                    className="hb-plate hb-bot relative flex h-full flex-col justify-center py-3 pl-4 pr-4 sm:py-3 sm:pl-5 sm:pr-5 md:py-3.5 md:pl-6 md:pr-6 lg:py-3.5"
                    style={{ clipPath: shape(BOT_OUTER) }}
                    data-theme-box
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute right-4 -top-2 select-none font-serif text-[64px] leading-none text-[#8EE3D6]/15 sm:right-5 sm:text-[58px] md:right-6 md:text-[50px] lg:text-[50px]"
                    >
                      &ldquo;
                    </span>

                    <span className="relative z-[2] inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#8EE3D6] sm:text-[11px]">
                      <span aria-hidden className="h-px w-5 bg-[#8EE3D6]/70" />
                      THEME
                    </span>

                    {/* Mobile keeps the full theme wrapped on two lines. */}
                    <span className="relative z-[2] mt-1.5 block pr-4 text-[14px] font-extrabold uppercase leading-[1.25] tracking-tight text-white sm:hidden">
                     MAN AND SATAN IN CONTENTION
                      <br />
                      AGAINST THE HOLY GOD
                    </span>

                    {/* Desktop uses the same full theme, auto-fit to the box. */}
                    <div className="relative z-[2] mt-1 hidden sm:block sm:pr-5 md:pr-6">
                      <FitTwoLines
                        text={themeTitle}
                        minFont={8}
                        lines={2}
                        className="pr-3 text-[9px] font-extrabold leading-tight tracking-tight text-white sm:text-[15px] md:text-[13px] lg:text-[13px]"
                      />
                    </div>
                  </div>
                  <div
                    aria-hidden
                    className="hb-border hb-border-bot"
                    style={{ clipPath: ring(BOT_OUTER, BOT_INNER) }}
                  />
                </div>
              </div>

                <div aria-hidden className="hb-seam mt-2 sm:mt-2.5 md:mt-1.5" />
              </div>
            </ParallaxLayer>
          </div>

          <ParallaxLayer speed={0.16} className="w-full min-w-0 md:col-span-2 md:row-start-2">
            <div className="hero-fade pt-0 pb-0" style={{ animationDelay: "0.8s" }}>
              {/* No dup: countdown no go print theme again */}
              <CountdownClock startsAt={startsAt} endsAt={endsAt} theme="" show3DClock={false} />
            </div>
          </ParallaxLayer>

          <ParallaxLayer
            speed={0.1}
            className="w-full md:col-start-2 md:row-start-1 md:w-auto md:justify-self-end"
          >
            <div className="hero-fade flex justify-center pb-0 pt-0 md:-ml-[10px] md:mt-[10px] md:justify-end" style={{ animationDelay: "0.8s" }}>
              <CountdownClock
                startsAt={startsAt}
                endsAt={endsAt}
                theme=""
                showFlip={false}
                className="cc-wrap w-auto"
                clockClassName="h-[168px] w-[168px] sm:h-[200px] sm:w-[200px] md:h-[172px] md:w-[172px] lg:h-[196px] lg:w-[196px]"
              />
            </div>
          </ParallaxLayer>
        </div>
      </div>
    </section>
  );
}