"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShieldCheck, X } from "lucide-react";

import { AdminNav } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/ui/logout-button";

type AdminMobileNavProps = {
  user: {
    fullName: string;
    role: string;
  };
  role?: string;
};

export function AdminMobileNav({ user, role }: AdminMobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open admin navigation"
        aria-expanded={open}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-[#0E1020] shadow-sm md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation"
        >
          <button
            type="button"
            aria-label="Close admin navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full bg-[#0E1020]/60 backdrop-blur-[2px]"
          />

          <div className="relative flex h-full w-[min(88vw,320px)] flex-col bg-[#0E1020] text-gray-300 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-wide text-white">IHGC 2026</span>
                <span className="rounded bg-[#8EE3D6] px-1.5 py-0.5 text-[10px] font-bold text-[#0E1020]">
                  {user.role === "admin" ? "ADMIN" : "STAFF"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#8EE3D6]" />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close admin navigation"
                  autoFocus
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain">
              <AdminNav variant="drawer" role={role} onNavigate={() => setOpen(false)} />
            </div>

            <div className="space-y-1 border-t border-white/10 p-4 text-[11px]">
              <div className="font-semibold text-white">{user.fullName}</div>
              <div className="font-bold uppercase tracking-wider text-[#8EE3D6]">{user.role}</div>
              <div className="text-gray-400">Kwali, Abuja • Africa/Lagos</div>
              <div className="flex items-center justify-between pt-3">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="text-[10px] text-[#8EE3D6] hover:underline"
                >
                  ← Public Site
                </Link>
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
