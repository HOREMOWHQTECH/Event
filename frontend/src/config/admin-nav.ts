import {
  LayoutDashboard,
  Receipt,
  Users,
  Download,
  Settings,
  AlertTriangle,
  ScanLine,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Omit to show for every signed-in staff role. */
  roles?: string[];
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, roles: ["admin"] },
  { label: "Live Scanner", href: "/admin/scanner", icon: ScanLine },
  { label: "Payments", href: "/admin/payments", icon: Receipt, roles: ["admin"] },
  { label: "Participants", href: "/admin/participants", icon: Users },
  { label: "Conflicts", href: "/admin/conflicts", icon: AlertTriangle, roles: ["admin"] },
  { label: "Reports & Export", href: "/admin/export", icon: Download, roles: ["admin"] },
  { label: "Settings", href: "/admin/settings", icon: Settings, roles: ["admin"] },
];
