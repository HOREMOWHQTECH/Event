"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  LoaderCircle,
  Search,
  Sparkles,
} from "lucide-react";
import { useScannerSession } from "@/components/scanner/use-scanner-session";

const SCAN_SUCCESS_CSS = `
@keyframes ihgcScanPop{0%{opacity:0;transform:translateY(22px) scale(.86)}65%{opacity:1;transform:translateY(-5px) scale(1.03)}100%{opacity:1;transform:none}}
@keyframes ihgcScanHalo{0%{transform:scale(.7);opacity:.85}100%{transform:scale(1.85);opacity:0}}
@keyframes ihgcScanSpark{0%{opacity:0;transform:translate(0,0) scale(.3)}25%{opacity:1}100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(1)}}
.scan-win{position:absolute;inset:0;z-50;display:flex;align-items:center;justify-content:center;padding:24px;background:radial-gradient(circle at 50% 40%,rgba(142,227,214,.2),rgba(5,10,20,.92) 62%);backdrop-filter:blur(6px)}
.scan-win__card{position:relative;width:min(100%,380px);overflow:hidden;border-radius:30px;border:1px solid rgba(142,227,214,.45);background:linear-gradient(160deg,#11263A,#0B1424 60%,#0E1020);padding:30px 24px 24px;text-align:center;color:white;box-shadow:0 30px 90px rgba(0,0,0,.6),0 0 45px rgba(142,227,214,.2);animation:ihgcScanPop .5s cubic-bezier(.2,.9,.25,1.2) both}
.scan-win__card::before{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(120deg,rgba(255,255,255,.1),transparent 35%,rgba(142,227,214,.08))}
.scan-win__halo{position:absolute;left:50%;top:46px;width:92px;height:92px;margin-left:-46px;border-radius:999px;border:2px solid rgba(142,227,214,.7);animation:ihgcScanHalo 1.6s ease-out infinite}
.scan-win__check{position:relative;z-index:2;display:flex;height:92px;width:92px;margin-inline:auto;align-items:center;justify-content:center;border-radius:999px;background:linear-gradient(135deg,#8EE3D6,#43BFAE);color:#062018;box-shadow:0 12px 40px rgba(142,227,214,.45)}
.scan-win__check svg{height:46px;width:46px;stroke-width:3}
.scan-win__sparks{position:absolute;left:50%;top:92px;width:0;height:0;pointer-events:none}
.scan-win__spark{position:absolute;height:8px;width:8px;border-radius:3px;animation:ihgcScanSpark 1.1s ease-out both}
.scan-win__spark:nth-child(1){--tx:-96px;--ty:-62px;background:#8EE3D6;animation-delay:.05s}
.scan-win__spark:nth-child(2){--tx:96px;--ty:-58px;background:#FFE08A;animation-delay:.12s}
.scan-win__spark:nth-child(3){--tx:-112px;--ty:26px;background:#FF9BC4;animation-delay:.18s}
.scan-win__spark:nth-child(4){--tx:110px;--ty:32px;background:#8EE3D6;animation-delay:.24s}
.scan-win__spark:nth-child(5){--tx:-48px;--ty:-104px;background:#FFE08A;animation-delay:.1s}
.scan-win__spark:nth-child(6){--tx:52px;--ty:-108px;background:#A6EBE0;animation-delay:.16s}
.scan-win__spark:nth-child(7){--tx:-74px;--ty:88px;background:#8EE3D6;animation-delay:.28s}
.scan-win__spark:nth-child(8){--tx:76px;--ty:90px;background:#FFE08A;animation-delay:.34s}
.scan-win__eyebrow{position:relative;z-index:2;margin-top:18px;display:inline-flex;align-items:center;gap:7px;border-radius:999px;background:rgba(142,227,214,.14);padding:5px 12px;font-size:10px;font-weight:800;letter-spacing:.18em;color:#8EE3D6}
.scan-win__title{position:relative;z-index:2;margin-top:10px;font-size:28px;font-weight:900;letter-spacing:-.02em;line-height:1.1}
.scan-win__name{position:relative;z-index:2;margin-top:7px;font-size:14px;font-weight:700;color:rgba(255,255,255,.78)}
.scan-win__type{position:relative;z-index:2;margin-top:14px;display:inline-block;border:1px solid rgba(142,227,214,.4);border-radius:999px;padding:4px 12px;font-size:10px;font-weight:800;letter-spacing:.14em;color:#8EE3D6}
.scan-win__count{position:relative;z-index:2;margin-top:18px;border-radius:22px;border:1px solid rgba(142,227,214,.25);background:rgba(142,227,214,.08);padding:16px}
.scan-win__count-row{display:flex;align-items:center;justify-content:center;gap:14px}
.scan-win__count svg{height:30px;width:30px;color:#8EE3D6}
.scan-win__count strong{display:block;font-size:42px;line-height:1;font-weight:900;color:white}
.scan-win__count span{display:block;margin-top:5px;font-size:10px;font-weight:800;letter-spacing:.16em;color:#8EE3D6}
.scan-win__meta{position:relative;z-index:2;margin-top:12px;font-size:11px;color:rgba(255,255,255,.55)}
.scan-win__next{position:relative;z-index:2;margin-top:20px;display:flex;min-height:52px;width:100%;align-items:center;justify-content:center;gap:10px;border-radius:999px;background:linear-gradient(135deg,#8EE3D6,#71D5C7);font-size:13px;font-weight:900;color:#062018;box-shadow:0 14px 34px rgba(142,227,214,.32);transition:transform .18s ease,filter .18s ease}
.scan-win__next:hover{transform:translateY(-2px);filter:brightness(1.05)}
.scan-win__next:active{transform:translateY(0)}
@media (prefers-reduced-motion:reduce){.scan-win__card,.scan-win__halo,.scan-win__spark{animation:none}.scan-win__next{transition:none}}
`;

export function ScannerInterface() {
  const session = useScannerSession();

  // The scanner is a full-screen kiosk view; never let the page behind it scroll.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <main className="fixed inset-0 z-[100] flex bg-[#0A0D18] font-body text-white selection:bg-[#8EE3D6] selection:text-[#0E1020]">
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#0E1020] shadow-[0_0_80px_rgba(0,0,0,0.5)] sm:mx-auto sm:h-[100dvh] sm:max-w-[480px] sm:border-x sm:border-white/10">
        {/* Viewfinder */}
        <section className="relative min-h-0 flex-1 overflow-hidden bg-[#0A0D18]">
          <video
            ref={session.videoRef}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              session.cameraActive ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            playsInline
            muted
            aria-label="Live ticket scanner camera"
          />

          {!session.cameraActive && (
            <div className="absolute inset-0 bg-gradient-to-b from-[#0E1020] via-[#121528] to-[#0A0D18]" aria-hidden="true">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(142,227,214,0.12),transparent_65%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.04]" />
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/35" aria-hidden="true" />

          <header className="absolute inset-x-0 top-0 z-20 flex h-[68px] items-center justify-between px-4 pt-[env(safe-area-inset-top)]">
            <Link
              href="/admin"
              aria-label="Back to Admin Dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="flex flex-col items-center text-center">
              <span className="font-heading text-xs font-extrabold tracking-[0.14em] text-white">IHGC 2026</span>
              <span className="font-heading text-[10px] font-bold tracking-wider text-[#8EE3D6]">CHECK-IN SCANNER</span>
            </div>

            <span className="h-10 w-10" aria-hidden="true" />
          </header>

          <div className="absolute inset-x-0 top-[22%] z-10 px-6 text-center" aria-hidden="true">
            <span className="inline-flex rounded-full border border-white/15 bg-black/35 px-4 py-1.5 font-heading text-[10px] font-bold uppercase tracking-[0.12em] text-[#8EE3D6] shadow-sm backdrop-blur-md">
              {session.cameraActive ? "Align ticket QR inside the frame" : "Scan Participant Pass"}
            </span>
          </div>

          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center pb-8">
            <div
              className={`relative aspect-square w-[min(66vw,290px)] rounded-[28px] border border-white/15 transition-all duration-300 ${
                session.cameraActive ? "scale-100 border-white/20" : "scale-[0.88] opacity-60"
              }`}
            >
              <span className="absolute -left-0.5 -top-0.5 h-10 w-10 rounded-tl-[24px] border-l-[3.5px] border-t-[3.5px] border-[#8EE3D6] shadow-[0_0_16px_rgba(142,227,214,0.6)]" />
              <span className="absolute -right-0.5 -top-0.5 h-10 w-10 rounded-tr-[24px] border-r-[3.5px] border-t-[3.5px] border-[#8EE3D6] shadow-[0_0_16px_rgba(142,227,214,0.6)]" />
              <span className="absolute -bottom-0.5 -left-0.5 h-10 w-10 rounded-bl-[24px] border-b-[3.5px] border-l-[3.5px] border-[#8EE3D6] shadow-[0_0_16px_rgba(142,227,214,0.6)]" />
              <span className="absolute -bottom-0.5 -right-0.5 h-10 w-10 rounded-br-[24px] border-b-[3.5px] border-r-[3.5px] border-[#8EE3D6] shadow-[0_0_16px_rgba(142,227,214,0.6)]" />

              {session.cameraActive && (
                <span className="absolute inset-x-4 top-1/2 h-[2px] animate-[scanline_2.2s_ease-in-out_infinite] bg-[#8EE3D6] shadow-[0_0_16px_4px_rgba(142,227,214,0.7)]" />
              )}
            </div>
          </div>

          {!session.cameraActive && (
            <div className="absolute inset-x-8 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur-md">
                <Camera className="h-7 w-7 text-[#8EE3D6]" />
              </div>
              <p className="mt-4 font-heading text-sm font-bold text-white drop-shadow">Camera Ready</p>
              <p className="mt-1 max-w-[260px] font-body text-xs leading-relaxed text-gray-300">
                Keep the QR ticket steady in the frame, or enter the short ticket reference below.
              </p>
              <button
                onClick={() => void session.startCamera()}
                disabled={session.cameraStarting}
                className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#8EE3D6] px-6 font-heading text-xs font-bold text-[#0E1020] shadow-[0_4px_20px_rgba(142,227,214,0.35)] transition-all hover:bg-[#7BD4C7] active:scale-95 disabled:cursor-wait disabled:opacity-70"
              >
                {session.cameraStarting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin text-[#0E1020]" />
                ) : (
                  <Camera className="h-4 w-4 text-[#0E1020]" />
                )}
                {session.cameraStarting ? "Opening camera…" : "Start Scanning"}
              </button>
            </div>
          )}

          {session.cameraActive && (
            <button
              onClick={session.stopCamera}
              className="absolute right-4 top-[78px] z-20 rounded-full border border-white/20 bg-black/45 px-3.5 py-1.5 font-heading text-[10px] font-bold text-white backdrop-blur-md transition-colors hover:bg-black/65"
            >
              Pause camera
            </button>
          )}

          {session.cameraError && (
            <div
              className="absolute inset-x-3 bottom-[78px] z-30 rounded-xl border border-amber-200 bg-[#fff9e9]/95 px-3.5 py-2.5 font-body text-[11px] font-semibold leading-relaxed text-amber-950 shadow-xl"
              role="alert"
            >
              <span>{session.cameraError}</span>
              <button onClick={session.clearCameraError} className="ml-2 font-heading font-bold text-amber-900 underline underline-offset-2">
                Dismiss
              </button>
            </div>
          )}
        </section>

        {/* Only the ticket reference input and Verify action live here. */}
        <section className="relative z-20 shrink-0 rounded-t-[32px] bg-white px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-3.5 text-[#111320] shadow-[0_-16px_45px_rgba(0,0,0,0.25)]">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200" aria-hidden="true" />

          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void session.submitManual();
            }}
          >
            <label className="sr-only" htmlFor="manual-ticket-reference">
              Ticket reference code
            </label>
            <input
              id="manual-ticket-reference"
              type="text"
              placeholder="Enter ticket ref · HGC-XXXXXX"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              value={session.manualCode}
              onChange={(event) => session.setManualCode(event.target.value.toUpperCase())}
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3.5 font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-[#111320] outline-none placeholder:font-body placeholder:normal-case placeholder:tracking-normal placeholder:text-gray-400 focus:border-[#0E7A6E] focus:ring-2 focus:ring-[#0E7A6E]/15"
            />
            <button
              type="submit"
              disabled={session.busy}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#0E1020] px-4 font-heading text-[11px] font-bold text-white transition hover:bg-[#1A1D36] active:scale-95 disabled:cursor-wait disabled:opacity-60"
            >
              {session.busy ? (
                <LoaderCircle className="h-3.5 w-3.5 animate-spin text-[#8EE3D6]" />
              ) : (
                <Search className="h-3.5 w-3.5 text-[#8EE3D6]" />
              )}
              <span>{session.busy ? "Checking" : "Verify"}</span>
            </button>
          </form>
        </section>

        {/* Result of the last scan. The camera stays paused until Next Scan. */}
        {session.scanResult.type === "valid" && (
          <div
            className="scan-win"
            role="dialog"
            aria-modal="true"
            aria-live="polite"
            aria-label="Scan successful"
          >
            <style dangerouslySetInnerHTML={{ __html: SCAN_SUCCESS_CSS }} />
            <div className="scan-win__card">
              <div className="scan-win__sparks" aria-hidden="true">
                <span className="scan-win__spark" />
                <span className="scan-win__spark" />
                <span className="scan-win__spark" />
                <span className="scan-win__spark" />
                <span className="scan-win__spark" />
                <span className="scan-win__spark" />
                <span className="scan-win__spark" />
                <span className="scan-win__spark" />
              </div>
              <span className="scan-win__halo" aria-hidden="true" />
              <div className="scan-win__check" aria-hidden="true">
                <Check />
              </div>

              <span className="scan-win__eyebrow">
                <Sparkles className="h-3.5 w-3.5" />
                SCAN SUCCESSFUL
              </span>
              <h2 className="scan-win__title">Check-in complete!</h2>
              <p className="scan-win__name">{session.scanResult.name}</p>
              <span className="scan-win__type">
                {session.scanResult.isGroup ? "GROUP TICKET" : "INDIVIDUAL TICKET"}
              </span>

              <div className="scan-win__count">
                <div className="scan-win__count-row">
                  <BookOpen aria-hidden="true" />
                  <div>
                    <strong>{session.scanResult.seats}</strong>
                    <span>
                      {session.scanResult.seats === 1 ? "BOOKLET TO ISSUE" : "BOOKLETS TO ISSUE"}
                    </span>
                  </div>
                </div>
              </div>

              <p className="scan-win__meta">
                {session.scanResult.refCode} · {session.scanResult.seats}{" "}
                {session.scanResult.seats === 1 ? "paid participant" : "paid participants"}
              </p>

              <button type="button" autoFocus className="scan-win__next" onClick={session.dismissResult}>
                Next Scan
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {session.scanResult.type !== "valid" && session.scanResult.type !== "idle" && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#050A14]/90 p-6 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-live="assertive"
            aria-label="Scan result"
          >
            <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-[#10172A] p-6 text-center text-white shadow-2xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <h2 className="mt-4 font-heading text-xl font-extrabold">
                {session.scanResult.type === "already_checked_in"
                  ? "Already checked in"
                  : session.scanResult.type === "forged"
                    ? "Invalid ticket"
                    : "Scan failed"}
              </h2>
              <p className="mt-2 font-body text-sm leading-relaxed text-white/70">
                {session.scanResult.message}
              </p>
              <button
                type="button"
                autoFocus
                onClick={session.dismissResult}
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#8EE3D6] font-heading text-xs font-bold text-[#0E1020] transition hover:bg-[#7BD4C7] active:scale-95"
              >
                Next Scan
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <canvas ref={session.canvasRef} className="hidden" aria-hidden="true" />
      </div>
    </main>
  );
}
