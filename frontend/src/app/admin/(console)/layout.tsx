import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/ui/logout-button";
import { requireAnyRole } from "@/lib/auth/session";
import { SITE_CONFIG } from "@/config/site";

// The install manifest is only advertised inside the authenticated console.
export const metadata: Metadata = {
  manifest: "/manifest.json",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAnyRole(["staff"]);
  if (!user) {
    redirect("/staff/login");
  }

  const isAdmin = user.role === "admin";

  return (
    <div className="min-h-screen flex bg-[#F4F5F7] text-[#111320]">
      {/* Dense Operational Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-white/5 bg-[#0E1020] text-gray-300 md:flex">
        <div>
          {/* Top Admin Brand */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white tracking-wide">
                IHGC 2026
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#8EE3D6] text-[#0E1020]">
                {isAdmin ? "ADMIN" : "STAFF"}
              </span>
            </div>
            <ShieldCheck className="w-4 h-4 text-[#8EE3D6]" />
          </div>

          {/* Navigation Links */}
          <AdminNav variant="sidebar" role={user.role} />
        </div>

        {/* Footer in Sidebar */}
        <div className="p-4 border-t border-white/10 text-[11px] text-gray-400 space-y-1">
          <div className="text-white font-semibold">{user.fullName}</div>
          <div className="text-[#8EE3D6] font-bold uppercase tracking-wider">{user.role}</div>
          <div>Kwali, Abuja • Africa/Lagos</div>
          <div className="pt-2 flex items-center justify-between">
            <Link href="/" className="text-[#8EE3D6] hover:underline text-[10px]">
              ← Public Site
            </Link>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Operational Bar */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <AdminMobileNav user={{ fullName: user.fullName, role: user.role }} role={user.role} />
            <div className="min-w-0">
              <div
                title={SITE_CONFIG.eventTitle}
                className="truncate text-[11px] font-black uppercase tracking-wider text-[#0E1020] sm:text-xs"
              >
                {SITE_CONFIG.eventTitle}
              </div>
              <div className="hidden text-[11px] font-semibold text-gray-500 sm:block">
                Management Console
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 sm:inline-flex">
              Operations Console
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF9F7] px-2.5 py-1 text-[10px] font-bold text-[#0E7A6E] sm:hidden">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1FA396]" />
              Live
            </span>
          </div>
        </header>

        {/* Mobile quick-access navigation */}
        <div className="sticky top-14 z-20 border-b border-gray-200 bg-white/95 px-3 py-2 backdrop-blur md:hidden">
          <AdminNav variant="strip" role={user.role} />
        </div>

        {/* Page Content */}
        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}