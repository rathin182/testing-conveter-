import React from "react";
import { User } from "lucide-react";

export const T = {
  bg: "#f4f4f4", card: "#ffffff", border: "#e5e5e5", primary: "#FFAE58",
  primaryLight: "#fff4e6", text: "#050A30", textSec: "#4B4B4B", textMuted: "#6F6F6F",
  danger: "#ef4444", purple: "#8b5cf6", success: "#16a34a"
} as const;

export const inputCls = "w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-300 bg-white text-[#050A30] border-[#e5e5e5]";
export const selectCls = "w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-300 bg-white text-[#050A30]";
export const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 500, color: T.text, marginBottom: 4 };

export const getApiBase = (role: string) => {
  if (role === "CLIENT") return "/api/client/projects";
  if (role === "ENGINEER") return "/api/engineer/projects";
  return "/api/admin/project"; 
};

export const ProgressGauge = ({ progress }: { progress?: number }) => {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - ((progress || 0) / 100) * circumference;
  return (
    <div style={{ position: "relative", width: 120, height: 120 }}>
      <svg style={{ width: 120, height: 120, transform: "rotate(-90deg)" }} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" stroke="#e5e5e5" strokeWidth="8" fill="none" />
        <circle cx="50" cy="50" r="45" stroke={T.primary} strokeWidth="8" fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.4s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: T.text }}>{progress || 0}%</span>
      </div>
    </div>
  );
};

export const PriorityBadge = ({ priority }: { priority?: string }) => {
  const map: Record<string, { bg: string; color: string }> = {
    HIGH: { bg: "#fee2e2", color: "#ef4444" }, MEDIUM: { bg: "#fef9c3", color: "#d97706" }, LOW: { bg: "#dcfce7", color: "#16a34a" },
  };
  const s = map[priority || "LOW"] || map.LOW;
  return <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>{priority || "LOW"} Priority</span>;
};

export const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    DRAFT: { bg: "#f3f4f6", color: "#6b7280", label: "Draft" }, AWAITING_ADVANCE: { bg: "#fef9c3", color: "#d97706", label: "Awaiting Advance" },
    SEARCHING: { bg: "#dbeafe", color: "#2563eb", label: "Searching Engineer" }, IN_PROGRESS: { bg: "#dcfce7", color: "#16a34a", label: "In Progress" },
    IN_REVIEW: { bg: "#ede9fe", color: "#7c3aed", label: "In Review" }, AWAITING_FINAL_PAYMENT: { bg: "#fef9c3", color: "#d97706", label: "Awaiting Final Payment" },
    COMPLETED: { bg: "#dcfce7", color: "#15803d", label: "Completed" }, CANCELED: { bg: "#fee2e2", color: "#ef4444", label: "Canceled" },
  };
  const s = map[status] || { bg: "#f3f4f6", color: "#6b7280", label: status };
  return <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span>;
};

export const TeamMemberCard = ({ user, label }: { user: any; label: string }) => {
  const isOnline = user.lastActiveAt ? new Date(user.lastActiveAt) > new Date(Date.now() - 5 * 60 * 1000) : false;
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 16px", marginTop: 10, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", width: 48, height: 48, borderRadius: "50%", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {user.image ? <img src={user.image} alt={user.name || "User"} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} /> : <User size={24} color={T.textMuted} />}
        <span style={{ position: "absolute", bottom: 2, right: 2, width: 10, height: 10, borderRadius: "50%", background: isOnline ? "#22c55e" : "#d1d5db", border: "1.5px solid #fff" }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: T.text }}>{user.name || "Unknown"}</p>
        <p style={{ margin: "1px 0 0", fontSize: 12, color: T.primary, fontWeight: 500 }}>{label}</p>
        <p style={{ margin: 0, fontSize: 11, color: T.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
      </div>
    </div>
  );
};