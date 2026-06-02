"use client";
import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Topbar() {
  const { user, role, isLoading } = useAuth();

  const getInitials = (name?: string | null) => {
    if (!name) return "U"; 
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatRole = (r?: string | null) => {
    if (!r) return "Guest";
    return r.charAt(0).toUpperCase() + r.slice(1).toLowerCase();
  };

  return (
    <header className="h-17 bg-white border-b border-[var(--border)] flex items-center px-6 gap-4 shrink-0">
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        {[Bell].map((Icon, i) => (
          <button
            key={i}
            className="w-9 h-9 flex items-center justify-center text-gray-400 hover:bg-[#fff4e6] hover:text-[#FFAE58] transition-all"
          >
            <Icon size={18} />
          </button>
        ))}
      </div>

      {/* User */}
      <button className="flex items-center gap-2.5 pl-3 border-l border-[var(--border)]">
        <div className="w-8 h-8 bg-[#FFAE58] flex items-center justify-center">
          <span className="text-white text-xs font-bold font-id">
            {isLoading ? "..." : getInitials(user?.name)}
          </span>
        </div>
        <div className="text-left">
          {isLoading ? (
            <>
              <div className="w-20 h-3 bg-gray-200 animate-pulse rounded mb-1" />
              <div className="w-12 h-2.5 bg-gray-200 animate-pulse rounded" />
            </>
          ) : (
            <>
              <p className="text-xs font-bold font-id text-[var(--text-primary)]">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] font-inter text-[var(--text-muted)]">
                {formatRole(role)}
              </p>
            </>
          )}
        </div>
      </button>
    </header>
  );
}