"use client";

import { fetcher } from "@/lib/fetcher";
import { Mail, Calendar, User, Edit2, Trash2, Loader2, Ban, CheckCircle, Bell, Search, Filter, } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import ConfirmModal from "../ConfirmModal";
import EditUserModal from "./EditUserModal";
import useSWRInfinite from "swr/infinite";
import { useRouter } from "next/navigation";
import SuspendUserModal from "./SuspendUserModal";
import EngineerStatusModal from "./EngineerStatusModal";

const socket = io({
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 5000,
});

const s = {
  page: { minHeight: "100vh", background: "#f9fafb", padding: 32, fontFamily: "inherit" } as React.CSSProperties,
  card: { position: "relative", background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", padding: 20, boxShadow: "0 1px 4px rgba(5,10,48,0.05)", transition: "box-shadow 0.2s" } as React.CSSProperties,
  avatar: (isSuspended: boolean) => ({ width: 56, height: 56, borderRadius: "50%", background: isSuspended ? "#fee2e2" : "#fff4e6", border: `2px solid ${isSuspended ? "#ef4444" : "#FFAE58"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 600, color: isSuspended ? "#ef4444" : "#FFAE58", position: "relative", flexShrink: 0 } as React.CSSProperties),
  dot: (isActive: boolean) => ({ position: "absolute", bottom: 1, right: 1, width: 11, height: 11, borderRadius: "50%", background: isActive ? "#22c55e" : "#9ca3af", border: "2px solid #fff" } as React.CSSProperties),
  badge: (color: string, bg: string) => ({ display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: bg, color } as React.CSSProperties),
  divider: { borderTop: "1px solid #e5e5e5", marginTop: 14, paddingTop: 12 } as React.CSSProperties,
  iconRow: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6F6F6F" } as React.CSSProperties,
  actionBtn: (danger = false) => ({ padding: "6px 8px", borderRadius: 8, background: danger ? "#fff0f0" : "#f4f4f4", border: "none", cursor: "pointer", display: "flex", alignItems: "center" } as React.CSSProperties),
};

export default function RoleDashboard({ role }: { role: "ENGINEER" | "ADMIN" | "CLIENT" }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(role === "ENGINEER" ? "APPROVED" : "ALL");

  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [suspendingUser, setSuspendingUser] = useState<any>(null);

  const [statusModalUser, setStatusModalUser] = useState<any>(null);
  const [targetStatus, setTargetStatus] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [liveUsers, setLiveUsers] = useState<Record<string, boolean>>({});
  const [socketError, setSocketError] = useState("");

  const router = useRouter();


  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedSearch(search); }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && previousPageData.users.length === 0) return null;
    return `/api/admin/users?role=${role}&search=${encodeURIComponent(debouncedSearch)}&status=${statusFilter}&page=${pageIndex + 1}&limit=12`;
  };
console.log(getKey, "key");

  const { data, size, setSize, isValidating, mutate } = useSWRInfinite(
    getKey,
    fetcher,
    {
      keepPreviousData: true,
      revalidateOnFocus: false
    }
  );

  const visibleUsers = data ? data.flatMap(page => page.users) : [];
  const isLoadingInitialData = !data && isValidating;
  const isReachingEnd = data && data[data.length - 1]?.users?.length < 12;
  const pendingCount = data?.[0]?.pendingCount || 0;

  const observerTarget = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isReachingEnd && !isValidating) {
          setSize(size + 1);
        }
      },
      { threshold: 1.0 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [size, isReachingEnd, isValidating, setSize]);

  useEffect(() => {
    if (visibleUsers.length === 0) return;
    const userIds = visibleUsers.map((u: any) => u.id);
    socket.emit("check_multiple_users_status", userIds);

    const handleBulkStatus = (statuses: Record<string, boolean>) => setLiveUsers((prev) => ({ ...prev, ...statuses }));
    const handleStatusChange = ({ userId, isOnline }: { userId: string, isOnline: boolean }) => setLiveUsers((prev) => ({ ...prev, [userId]: isOnline }));

    socket.on("multiple_users_status_result", handleBulkStatus);
    socket.on("user_status_change", handleStatusChange);

    return () => {
      socket.off("multiple_users_status_result", handleBulkStatus);
      socket.off("user_status_change", handleStatusChange);
    };
  }, []);

// console.log(data,"userss");

  // ACTION HANDLERS
  const handleDelete = async () => {
    if (!deletingUser) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        toast.success("User deleted successfully");
        mutate();
      } else {
        toast.error(result.message || "Failed to delete");
      }
    } catch { toast.error("Internal Server Error"); }
    finally { setIsProcessing(false); setDeletingUser(null); }
  };

  const handleStatusUpdate = async () => {
    if (!statusModalUser || !targetStatus) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/users/${statusModalUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalStatus: targetStatus,
          rejectionReason: targetStatus === "REJECTED" ? rejectionReason : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`User ${targetStatus.toLowerCase()} successfully`);
        setStatusModalUser(null);
        setTargetStatus(null);
        setRejectionReason("");
        mutate();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const tabLabel = { ENGINEER: "Engineers", ADMIN: "Admins", CLIENT: "Clients" };

  const renderCard = (u: any) => {
    const isDbActive = new Date().getTime() - new Date(u.lastActive).getTime() < 15 * 60 * 1000;
    const isActive = liveUsers[u.id] !== undefined ? liveUsers[u.id] : isDbActive;

    const handleRedirect = (role: string) => {
      if (role === "ENGINEER") router.push(`/admin/engineer-management/${u.id}`);
      else if (role === "ADMIN") router.push(`/admin/admin-management/${u.id}`);
      else if (role === "CLIENT") router.push(`/admin/client-management/${u.id}`);
    }

    return (
      <div
        key={u.id}
        style={{ ...s.card, cursor: "pointer" }}
        onClick={() => handleRedirect(u.role)}
        className="hover:shadow-md transition-shadow"
      >
        <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 4, zIndex: 10 }}>
          <button
            onClick={(e) => { e.stopPropagation(); setSuspendingUser(u); }}
            style={s.actionBtn()}
            title={u.isSuspended ? "Unsuspend" : "Suspend"}
          >
            {u.isSuspended ? <CheckCircle size={14} color="#22c55e" /> : <Ban size={14} color="#f59e0b" />}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setEditingUser(u); }}
            style={s.actionBtn()}
            title="Edit"
          >
            <Edit2 size={14} color="#6F6F6F" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setDeletingUser(u); }}
            style={s.actionBtn(true)}
            title="Delete"
          >
            <Trash2 size={14} color="#e53e3e" />
          </button>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={s.avatar(u.isSuspended)}>
            {u.image ? (
              <Image src={u.image} alt={u.name || "User"} width={56} height={56} style={{ borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              (u.name || "U").charAt(0).toUpperCase()
            )}
            <div style={s.dot(isActive)} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, paddingRight: 80 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: u.isSuspended ? "#ef4444" : "#050A30" }}>
                {u.name || "Unnamed"}
              </span>
            </div>

            {/* INLINE STATUS & ACTIONS FOR ENGINEERS */}
            {(role === "ENGINEER") && (
              <div style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={s.badge(u.status === "PENDING" ? "#f59e0b" : u.status === "REJECTED" ? "#ef4444" : "#22C55E", "#f4f4f4")}>
                  {/* {u.status || "APPROVED"} */}
                  {u.status}
                </span>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={s.iconRow}><Mail size={12} /><span className="truncate">{u.email}</span></div>
              {role === "CLIENT" && <div style={s.iconRow}><User size={12} /><span>Projects: {u.totalProjects || 0}</span></div>}
              {role === "ENGINEER" && <div style={s.iconRow}><User size={12} /><span>Completed Work: {u.completedProjects || 0}</span></div>}
              {u.joinedAt && (
                <div style={s.iconRow}>
                  <Calendar size={12} />
                  <span>Joined: {new Date(u.joinedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={s.divider}>
          <p style={{ fontSize: 12, color: "#4B4B4B", margin: 0, lineHeight: "1.4" }}>
            {role === "ENGINEER" && <><strong>Skills:</strong> {u.skills?.length ? u.skills.join(", ") : "Not provided"}</>}
            {role === "CLIENT" && <><strong>Expertise:</strong> {u.expertise?.length ? u.expertise.join(", ") : "Not provided"}</>}
            {role === "ADMIN" && "Platform Administrator"}
          </p>
        </div>

        <div className="mt-3" style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          {/* Pending Actions - ADDED e.stopPropagation() */}
          {u.status === "PENDING" && (
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={(e) => { e.stopPropagation(); setStatusModalUser(u); setTargetStatus("APPROVED"); }}
                style={{ padding: "2px 8px", fontSize: 11, fontWeight: 600, background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 6, cursor: "pointer" }}
              >
                Approve
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setStatusModalUser(u); setTargetStatus("REJECTED"); }}
                style={{ padding: "2px 8px", fontSize: 11, fontWeight: 600, background: "#fee2e2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: 6, cursor: "pointer" }}
              >
                Reject
              </button>
            </div>
          )}

          {/* Rejected Actions - ADDED e.stopPropagation() */}
          {u.status === "REJECTED" && (
            <button
              onClick={(e) => { e.stopPropagation(); setStatusModalUser(u); setTargetStatus("APPROVED"); }}
              style={{ padding: "2px 8px", fontSize: 11, fontWeight: 600, background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 6, cursor: "pointer" }}
            >
              Approve
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={s.page}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>

          <h1 style={{ fontSize: 22, fontWeight: 600, color: "#050A30", display: "flex", alignItems: "center", gap: "10px" }}>
            {statusFilter === "PENDING" ? "Pending Requests" : tabLabel[role]}
            <span style={{ fontSize: 14, fontWeight: 500, color: "#6F6F6F" }}>
              ({visibleUsers.length})
            </span>
          </h1>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[#e5e5e5] rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#FFAE58]"
              />
            </div>

            {role === "ENGINEER" && (
              <div className="relative">
                <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-8 pr-8 py-2 border border-[#e5e5e5] rounded-lg text-sm outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-[#FFAE58] bg-white"
                >
                  <option value="ALL">All Status</option>
                  <option value="APPROVED">Approved Only</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            )}

            {role === "ENGINEER" && (
              <button
                onClick={() => setStatusFilter(statusFilter === "PENDING" ? "APPROVED" : "PENDING")}
                className={`relative p-2.5 rounded-lg border transition-colors ${statusFilter === "PENDING" ? "bg-[#FFAE58] text-white border-[#FFAE58]" : "bg-white border-[#e5e5e5] text-gray-600 hover:bg-gray-50"}`}
                title="View Pending Requests"
              >
                <Bell size={18} />
                {pendingCount > 0 && statusFilter !== "PENDING" && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {isLoadingInitialData ? (
        <div className="h-40 w-full flex items-center justify-center">
          <Loader2 className="animate-spin" color="#FFAE58" size={32} />
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24, paddingTop: 20 }}>
            {visibleUsers.map((u: any) => renderCard(u))}
          </div>

          <div ref={observerTarget} className="h-10 w-full mt-4 flex items-center justify-center">
            {isValidating && !isLoadingInitialData && <Loader2 className="animate-spin" color="#FFAE58" size={24} />}
          </div>

          {visibleUsers.length === 0 && (
            <p style={{ color: "#6F6F6F", textAlign: "center", paddingTop: 40 }}>
              No {tabLabel[role].toLowerCase()} found.
            </p>
          )}
        </>
      )}

      {/* MODALS */}
      <EditUserModal
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSuccess={() => { mutate(); setEditingUser(null); }}
      />

      <ConfirmModal
        isOpen={!!deletingUser}
        title="Delete User"
        message={`Are you sure you want to permanently delete ${deletingUser?.name}? All associated data and files will be wiped.`}
        confirmText="Delete"
        isDanger={true}
        isLoading={isProcessing}
        onCancel={() => setDeletingUser(null)}
        onConfirm={handleDelete}
      />

      <SuspendUserModal
        isOpen={!!suspendingUser}
        user={suspendingUser}
        onClose={() => setSuspendingUser(null)}
        onSuccess={() => {
          toast.success(`User state successfully updated.`);
          mutate();
        }}
      />

      <EngineerStatusModal
        isOpen={!!statusModalUser}
        user={statusModalUser}
        initialStatus={targetStatus || undefined}
        onClose={() => {
          setStatusModalUser(null);
          setTargetStatus(null);
        }}
        onSuccess={() => {
          toast.success(`Engineer updated successfully`);
          mutate();
          setStatusModalUser(null);
          setTargetStatus(null);
        }}
      />
    </div>
  );
}