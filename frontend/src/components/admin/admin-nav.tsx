"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ADMIN_NAV_ITEMS } from "@/config/admin-nav";

type AdminNavProps = {
  variant?: "sidebar" | "drawer" | "strip";
  role?: string;
  onNavigate?: () => void;
};

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ variant = "sidebar", role, onNavigate }: AdminNavProps) {
  const pathname = usePathname();
  const items = ADMIN_NAV_ITEMS.filter(
    (item) => !item.roles || (role ? item.roles.includes(role) : false)
  );

  if (variant === "strip") {
    return (
      <nav aria-label="Admin sections" className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                active
                  ? "border-transparent bg-[#0E1020] text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-[#0E1020]"
              }`}
            >
              <item.icon className={`h-3.5 w-3.5 ${active ? "text-[#8EE3D6]" : "text-gray-400"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  const isDrawer = variant === "drawer";

  return (
    <nav aria-label="Admin sections" className="space-y-1 p-3">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-colors ${
              active
                ? "bg-white/10 text-white"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <item.icon className={`h-4 w-4 ${active ? "text-[#8EE3D6]" : "text-gray-400"}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
      {isDrawer && (
        <p className="px-3.5 pt-3 text-[10px] leading-relaxed text-gray-500">
          Swipe the strip above the page for quick access, or use this menu for the full console.
        </p>
      )}
    </nav>
  );
}
