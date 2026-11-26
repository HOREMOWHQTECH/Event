/**
 * Client-side ticket artwork shared by the payment-status and ticket pages.
 * The same canvas powers the PNG and PDF downloads so both look identical.
 */
import QRCode from "qrcode";

export type Ticket = {
  id: string;
  refCode: string;
  name: string;
  status: string;
  qrToken: string;
};

export type TicketOrder = {
  reference: string;
  currency: string;
  totalMinor: number;
  isGroup: boolean;
  groupName: string | null;
};

export type GroupTicket = {
  id: string;
  totalSeats: number;
  claimedSeats: number;
  qrToken?: string;
  managementToken?: string;
};

export type TicketBundle = {
  order: TicketOrder;
  participants: Ticket[];
  group: GroupTicket | null;
};

export const EVENT = {
  name: "IHGC 2026 General Conference",
  dates: "8 – 11 Dec 2026",
  venue: "Holiness Campground, Kwali, Abuja",
};

export const BOOKLET_URL = "/IHGC-2026-Programme-Booklet.pdf";
export const BOOKLET_FILENAME = "IHGC-2026-Programme-Booklet.pdf";

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not create image"))), "image/png");
  });
}

export function qrDataUrl(value: string): Promise<string> {
  return QRCode.toDataURL(value, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 1024,
    color: { dark: "#000000", light: "#FFFFFF" },
  });
}

const FONT = "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif";

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  size: number,
  weight = 700,
  min = 22
) {
  let s = size;
  ctx.font = `${weight} ${s}px ${FONT}`;
  while (s > min && ctx.measureText(text).width > maxWidth) {
    s -= 2;
    ctx.font = `${weight} ${s}px ${FONT}`;
  }
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  maxWidth: number,
  startY: number,
  options: { size: number; weight?: number; lineHeight: number; maxLines?: number; color: string }
) {
  const { size, weight = 700, lineHeight, maxLines = 2, color } = options;
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${FONT}`;

  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  let index = 0;

  for (; index < words.length; index++) {
    const candidate = line ? `${line} ${words[index]}` : words[index];
    if (!line || ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
      continue;
    }
    lines.push(line);
    line = words[index];
    if (lines.length >= maxLines) break;
  }

  if (lines.length < maxLines && line) lines.push(line);

  const truncated = index < words.length - 1;
  if (truncated && lines.length > 0) {
    let last = lines[lines.length - 1];
    while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) {
      last = last.slice(0, -1);
    }
    lines[lines.length - 1] = `${last.trimEnd()}…`;
  }

  lines.forEach((value, i) => ctx.fillText(value, centerX, startY + i * lineHeight));
}

function newCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; contentWidth: number } {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1500;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported");
  const contentWidth = canvas.width - 140;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#0E1020";
  ctx.fillRect(0, 0, canvas.width, 300);

  return { canvas, ctx, contentWidth };
}

function drawHeader(ctx: CanvasRenderingContext2D, contentWidth: number, label: string) {
  ctx.fillStyle = "#8EE3D6";
  ctx.font = `700 30px ${FONT}`;
  ctx.fillText(label, 540, 90);

  ctx.fillStyle = "#FFFFFF";
  fitText(ctx, EVENT.name, contentWidth, 58, 800, 30);
  ctx.fillText(EVENT.name, 540, 170);

  ctx.fillStyle = "#C7CAD6";
  const sub = `${EVENT.dates}  •  ${EVENT.venue}`;
  fitText(ctx, sub, contentWidth, 32, 400, 22);
  ctx.fillText(sub, 540, 235);
}

async function drawQr(ctx: CanvasRenderingContext2D, qr: string, y = 640) {
  const img = new Image();
  img.src = qr;
  await img.decode();
  const qrSize = 680;
  const qrX = (1080 - qrSize) / 2;
  ctx.strokeStyle = "#E5E7EB";
  ctx.lineWidth = 4;
  ctx.strokeRect(qrX - 20, y - 20, qrSize + 40, qrSize + 40);
  ctx.drawImage(img, qrX, y, qrSize, qrSize);
}

function drawFooter(ctx: CanvasRenderingContext2D, contentWidth: number, instruction: string, warning: string) {
  ctx.fillStyle = "#111320";
  fitText(ctx, instruction, contentWidth, 32, 600, 22);
  ctx.fillText(instruction, 540, 1395);
  ctx.fillStyle = "#6B7280";
  fitText(ctx, warning, contentWidth, 26, 400, 18);
  ctx.fillText(warning, 540, 1440);
}

export async function renderTicketCanvas(ticket: Ticket, qr: string): Promise<HTMLCanvasElement> {
  const { canvas, ctx, contentWidth } = newCanvas();
  drawHeader(ctx, contentWidth, "PARTICIPANT PASS");

  drawWrappedText(ctx, ticket.name, 540, contentWidth, 400, {
    size: 56,
    weight: 700,
    lineHeight: 64,
    maxLines: 2,
    color: "#111320",
  });

  ctx.fillStyle = "#6B7280";
  ctx.font = `600 28px ${FONT}`;
  ctx.fillText("REFERENCE", 540, 535);
  ctx.fillStyle = "#0E7A6E";
  fitText(ctx, ticket.refCode, contentWidth, 52, 800, 32);
  ctx.fillText(ticket.refCode, 540, 590);

  await drawQr(ctx, qr);
  drawFooter(
    ctx,
    contentWidth,
    "Show this QR code at the camp gate for check-in.",
    "Keep your screen brightness up and do not share this code."
  );
  return canvas;
}

/** Group ticket uses the same layout as a regular ticket, with group details. */
export async function renderGroupTicketCanvas(
  group: GroupTicket,
  order: TicketOrder,
  qr: string
): Promise<HTMLCanvasElement> {
  const { canvas, ctx, contentWidth } = newCanvas();
  drawHeader(ctx, contentWidth, "GROUP ADMISSION PASS");

  drawWrappedText(ctx, order.groupName || `${order.reference} Group`, 540, contentWidth, 395, {
    size: 56,
    weight: 700,
    lineHeight: 64,
    maxLines: 2,
    color: "#111320",
  });

  ctx.fillStyle = "#6B7280";
  ctx.font = `600 28px ${FONT}`;
  ctx.fillText("PAID PARTICIPANTS", 540, 510);
  ctx.fillStyle = "#0E7A6E";
  fitText(ctx, String(group.totalSeats), contentWidth, 56, 800, 32);
  ctx.fillText(String(group.totalSeats), 540, 575);

  ctx.fillStyle = "#6B7280";
  ctx.font = `600 24px ${FONT}`;
  ctx.fillText(`ORDER ${order.reference}`, 540, 615);

  await drawQr(ctx, qr, 660);
  drawFooter(
    ctx,
    contentWidth,
    "Scan this group QR once to check in every paid participant.",
    "The group QR covers children and all paid participants. Do not share this code."
  );
  return canvas;
}

async function savePdf(canvas: HTMLCanvasElement, filename: string) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a5", orientation: "portrait" });
  const width = 148;
  const height = (width * canvas.height) / canvas.width;
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, width, height);
  pdf.save(filename);
}

export async function downloadTicketPdf(ticket: Ticket, qr: string) {
  const canvas = await renderTicketCanvas(ticket, qr);
  await savePdf(canvas, `IHGC-2026-ticket-${ticket.refCode}.pdf`);
}

export async function downloadGroupPdf(group: GroupTicket, order: TicketOrder, qr: string) {
  const canvas = await renderGroupTicketCanvas(group, order, qr);
  await savePdf(canvas, `IHGC-2026-group-ticket-${order.reference}.pdf`);
}

export async function downloadGroupPng(group: GroupTicket, order: TicketOrder, qr: string) {
  const canvas = await renderGroupTicketCanvas(group, order, qr);
  downloadBlob(await canvasToBlob(canvas), `IHGC-2026-group-ticket-${order.reference}.png`);
}
