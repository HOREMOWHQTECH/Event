// Standalone full-screen route: it deliberately lives outside the admin
// console layout so the scanner fills the viewport on mobile.
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ScannerInterface } from "@/components/scanner/scanner-interface";
import { requireAnyRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

// Authenticated gate devices may install the scanner; public pages never advertise it.
export const metadata: Metadata = {
  manifest: "/manifest.json",
};

export default async function AdminScannerPage() {
  const user = await requireAnyRole(["staff"]);
  if (!user) redirect("/staff/login");

  return <ScannerInterface />;
}
