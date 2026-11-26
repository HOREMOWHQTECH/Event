"use client";

import { useEffect, useState } from "react";
import { Download, Image as ImageIcon, Loader2, Printer } from "lucide-react";
import { EVENT, GroupTicket, qrDataUrl, TicketOrder, downloadGroupPdf, downloadGroupPng } from "@/lib/tickets/ticket-pdf";

/** Group pass rendered like a regular ticket, with a full PDF download. */
export function GroupTicketCard({ group, order }: { group: GroupTicket; order: TicketOrder }) {
  const [qr, setQr] = useState<string | null>(null);
  const [busy, setBusy] = useState<"png" | "pdf" | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!group.qrToken) return;
    let alive = true;
    qrDataUrl(group.qrToken)
      .then((url) => {
        if (alive) setQr(url);
      })
      .catch(() => {
        if (alive) setErr("Could not generate the group QR code.");
      });
    return () => {
      alive = false;
    };
  }, [group.qrToken]);

  const withBusy = async (kind: "png" | "pdf", action: () => Promise<void>) => {
    setBusy(kind);
    setErr(null);
    try {
      await action();
    } catch {
      setErr(kind === "pdf" ? "Could not create the PDF. Try Print instead." : "Could not create the image.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="w-full max-w-md rounded-[24px] border border-gray-100 bg-white shadow-sm overflow-hidden print:shadow-none print:border-gray-300 print:break-inside-avoid">
      <div className="bg-[#0E1020] px-6 py-5 text-center text-white">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#8EE3D6]">Group Admission Pass</div>
        <div className="mt-1 text-lg font-extrabold tracking-tight">{EVENT.name}</div>
        <div className="mt-1 text-xs text-gray-300">
          {EVENT.dates} • {EVENT.venue}
        </div>
      </div>

      <div className="space-y-5 p-6 text-center sm:p-8">
        <div>
          <div className="break-words text-xl font-extrabold text-[#111320]">
            {order.groupName || "Conference Group"}
          </div>
          <div className="mt-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">Paid participants</div>
          <div className="text-2xl font-black text-[#0E7A6E]">{group.totalSeats}</div>
          <div className="mt-2 font-mono text-[11px] text-gray-500">Order {order.reference}</div>
        </div>

        <div className="mx-auto flex aspect-square w-full max-w-[280px] items-center justify-center rounded-xl border border-gray-200 bg-white p-2">
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="Group check-in QR code" className="h-full w-full" />
          ) : (
            <span className="text-xs text-gray-400">Generating group QR code…</span>
          )}
        </div>

        <p className="mx-auto max-w-sm text-xs leading-relaxed text-gray-600">
          Scan this group QR once at the camp gate to check in every paid participant, including children.
        </p>

        {err && (
          <p role="alert" className="text-xs text-red-600">
            {err}
          </p>
        )}

        <div className="space-y-2 print:hidden">
          <button
            type="button"
            onClick={() => qr && withBusy("pdf", () => downloadGroupPdf(group, order, qr))}
            disabled={!qr || busy !== null}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0E1020] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1A1D36] disabled:opacity-50"
          >
            {busy === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            <span>{busy === "pdf" ? "Preparing…" : "Download Group Ticket PDF"}</span>
          </button>
          <button
            type="button"
            onClick={() => qr && withBusy("png", () => downloadGroupPng(group, order, qr))}
            disabled={!qr || busy !== null}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0E1020] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1A1D36] disabled:opacity-50"
          >
            {busy === "png" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            <span>{busy === "png" ? "Preparing…" : "Save as Image"}</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={!qr}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#F3F4F6] px-4 py-2.5 text-xs font-semibold text-[#0E1020] transition-colors hover:bg-gray-200 disabled:opacity-50"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </button>
        </div>
      </div>
    </div>
  );
}
