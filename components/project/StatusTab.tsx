"use client";

import { useEffect, useState } from "react";
import { BarChart3, Edit3, Check, X, LucideLoader } from "lucide-react";
import toast from "react-hot-toast";

export default function StatusTab({ projectId }: { projectId: string }) {
  const [status, setStatus] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newStatus, setNewStatus] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    if (projectId) { fetchStatus(); checkPermissions(); }
  }, [projectId]);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/project/status?projectId=${projectId}`);
      const data = await res.json();
      if (data.success) { setStatus(data.status); setNewStatus(data.status); }
    } catch (err) { console.error("Failed to fetch status:", err); }
    finally { setLoading(false); }
  };

  const checkPermissions = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success && data.user) setCanEdit(data.user.role.name === "ADMIN");
    } catch (err) { console.error("Failed to check permissions:", err); }
  };

  const updateStatus = async () => {
    try {
      setUpdating(true);
      const res = await fetch("/api/project/status", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId, status: newStatus }) });
      const data = await res.json();
      if (data.success) { setStatus(data.status); setEditing(false); toast.success("Status updated!"); }
      else toast.error(data.error || "Failed to update status");
    } catch { toast.error("Error updating status"); }
    finally { setUpdating(false); }
  };

  const getBarColor = (p: number) => p >= 80 ? "bg-green-500" : p >= 50 ? "bg-[var(--primary)]" : p >= 25 ? "bg-yellow-500" : "bg-red-400";
  const getStatusText = (p: number) => p === 100 ? "Completed" : p >= 80 ? "Near Completion" : p >= 50 ? "In Progress" : p >= 25 ? "Getting Started" : "Just Started";

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <LucideLoader className="animate-spin" style={{ color: "var(--primary)" }} size={40} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold  flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <BarChart3 size={22} /> Project Status
        </h2>
        {canEdit && !editing && (
          <button onClick={() => setEditing(true)} className="px-4 py-2 text-white rounded-lg flex items-center gap-2  text-sm" style={{ background: "var(--primary)" }}>
            <Edit3 size={15} /> Update Status
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-[var(--border)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold " style={{ color: "var(--text-primary)" }}>Progress Overview</h3>
          <span className="text-2xl font-bold " style={{ color: "var(--text-primary)" }}>{status}%</span>
        </div>
        <div className="mb-4">
          <div className="w-full bg-[var(--bg)] rounded-full h-4">
            <div className={`h-4 rounded-full transition-all duration-500 ${getBarColor(status)}`} style={{ width: `${status}%` }} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm " style={{ color: "var(--text-muted)" }}>Status: {getStatusText(status)}</span>
          <span className="text-sm " style={{ color: "var(--text-muted)" }}>{100 - status}% remaining</span>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-xl border border-[var(--border)] shadow-lg">
            <h3 className="text-lg font-semibold  mb-4" style={{ color: "var(--text-primary)" }}>Update Project Status</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium  mb-2" style={{ color: "var(--text-secondary)" }}>Progress Percentage</label>
              <div className="flex items-center gap-4 mb-3">
                <input
                  type="number" min="0" max="100" value={newStatus}
                  onChange={(e) => setNewStatus(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                  className="w-20 px-3 py-2 border border-[var(--border)] rounded-lg bg-white  text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  style={{ color: "var(--text-primary)" }}
                  disabled={updating}
                />
                <span className=" text-sm" style={{ color: "var(--text-muted)" }}>%</span>
              </div>
              <input
                type="range" min="0" max="100" value={newStatus}
                onChange={(e) => setNewStatus(parseInt(e.target.value))}
                className="w-full h-2 bg-[var(--bg)] rounded-lg appearance-none cursor-pointer"
                disabled={updating}
              />
              <div className="flex justify-between text-xs  mt-1" style={{ color: "var(--text-muted)" }}>
                <span>0%</span>
                <span className="font-bold text-base " style={{ color: "var(--text-primary)" }}>{newStatus}%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="mb-6">
              <div className="w-full bg-[var(--bg)] rounded-full h-3">
                <div className={`h-3 rounded-full transition-all duration-300 ${getBarColor(newStatus)}`} style={{ width: `${newStatus}%` }} />
              </div>
              <p className="text-sm  mt-2" style={{ color: "var(--text-muted)" }}>{getStatusText(newStatus)}</p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setEditing(false); setNewStatus(status); }} className="px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg  text-sm flex items-center gap-2" style={{ color: "var(--text-secondary)" }} disabled={updating}>
                <X size={14} /> Cancel
              </button>
              <button onClick={updateStatus} disabled={updating} className="px-4 py-2 text-white rounded-lg  text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: "var(--primary)" }}>
                <Check size={14} /> {updating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
