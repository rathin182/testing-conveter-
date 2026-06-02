"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, CreditCard, Users, MessageSquare, LogOut, ChevronLeft, ChevronRight,
  User, UserKeyIcon, FolderKanban,
  Presentation,
  Lightbulb,
  FileUp,
  Handshake
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  href: string;
}

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/admin" },
  { label: "Projects", icon: <FolderKanban size={20} />, href: "/admin/project" },
  { label: "Client Management", icon: <User size={20} />, href: "/admin/client-management" },
  { label: "Engineer Management", icon: <UserKeyIcon size={20} />, href: "/admin/engineer-management" },
  { label: "Invitations Management", icon: <UserKeyIcon size={20} />, href: "/admin/invitations-management" },
  // { label: "Payment", icon: <CreditCard size={20} />, href: "/admin/payment" },
  // { label: "Customers", icon: <Users size={20} />, href: "/admin/customers" },
  { label: "Message", icon: <MessageSquare size={20} />, href: "/admin/message" },
];

const CLIENT_NAV: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/client" },
  { label: "Message", icon: <MessageSquare size={20} />, href: "/client/message" },
  { label: "Projects", icon: <FolderKanban size={20} />, href: "/client/project" },
  { label: "Payout", icon: <CreditCard size={20} />, href: "/client/account" },
  { label: "Profile", icon: <User size={20} />, href: "/client/profile" },
];

const ENGINEER_NAV: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/engineer" },
  { label: "Projects", icon: <FolderKanban size={20} />, href: "/engineer/project" },
  { label: "Message", icon: <MessageSquare size={20} />, href: "/engineer/message" },
  { label: "Payout", icon: <CreditCard size={20} />, href: "/engineer/payout" },
  { label: "Profile", icon: <User size={20} />, href: "/engineer/profile" },
];

const NavLink = ({ item, collapsed }: { item: NavItem; collapsed: boolean }) => {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  
  return (
    <Link
      href={item.href}
      className={`w-full flex items-center gap-3 px-4 py-3 text-[15px] font-semibold rounded-xl transition-all duration-200 group relative
          ${isActive
          ? "bg-[#FFAE58] text-white shadow-sm"
          : "text-gray-500 hover:bg-[#fff4e6] hover:text-[#FFAE58]"
        }`}
    >
      <span className={`shrink-0 transition-colors ${isActive ? "text-white" : "text-gray-400 group-hover:text-[#FFAE58]"}`}>
        {item.icon}
      </span>
      
      {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
      
      {!collapsed && item.badge && (
        <span className={`text-xs px-2 py-0.5 font-bold rounded-full
            ${typeof item.badge === "number"
            ? "bg-white text-[#FFAE58]"
            : "bg-black text-white"
          }`}
        >
          {item.badge}
        </span>
      )}
      
      {collapsed && (
        <span className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none shadow-lg">
          {item.label}
        </span>
      )}
    </Link>
  );
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { isAdmin, isEngineer, isClient } = useAuth();
  const nav = isAdmin ? ADMIN_NAV : isEngineer ? ENGINEER_NAV : isClient ? CLIENT_NAV : [];

  return (
    <aside
      style={{ width: collapsed ? 80 : 250 }} 
      className="h-screen flex flex-col bg-white border-r border-[var(--border)] transition-all duration-300 shrink-0 relative"
    >
      <div className="flex items-center justify-center h-20 border-b border-[var(--border)]">
        {!collapsed && <span className="font-bold text-xl text-[var(--text-primary)] tracking-tight">TECH ENGI</span>}
        {collapsed && <span className="font-bold text-xl text-[var(--text-primary)] tracking-tight">TE</span>}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-7 w-6 h-6 bg-white border border-[var(--border)] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all z-10 text-gray-400 hover:text-[#FFAE58]"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <nav className="flex-1 overflow-y-auto px-3 py-6 flex flex-col gap-2 no-scrollbar">
        {nav.map((item) => <NavLink key={item.label} item={item} collapsed={collapsed} />)}
      </nav>

      <div className="border-t border-[var(--border)] p-4">
        <button onClick={() => signOut({ callbackUrl: "/login" })} className={`w-full flex items-center font-semibold gap-3 px-4 py-3 rounded-xl text-[15px] text-red-500 hover:bg-red-50 transition-all ${collapsed ? "justify-center px-0" : ""}`}>
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}