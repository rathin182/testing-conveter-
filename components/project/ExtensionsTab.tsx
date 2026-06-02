"use client";
import { useEffect, useState } from "react";
import { Plus, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ExtensionsTab({ projectId, role }: { projectId: string; role: string }) {
  const [extensions, setExtensions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ requestedEndDate: "", reason: "" });

  const fetch_ = async () => {
    // Extensions are embedded in the project detail — re-fetch project
    setLoading(true);
    try {
      const endpoint = role === "CLIENT" ? `/api/client/projects/${projectId}` : `/api/engineer/projects/${projectId}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.success) {
        setExtensions(data.project?.extensionRequests ?? []);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch_(); }, [projectId, role]);

  const handleRequest = async () => {
    if (!form.requestedEndDate || !form.reason.trim()) { toast.error("All fields required"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/engineer/projects/extensions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, requestedEndDate: form.requestedEndDate, reason: form.reason }),
      });
      const data = await res.json();
      if (!data.success) { toast.error(data.message); return; }
      toast.success("Extension request sent to client");
      setOpen(false);
      setForm({ requestedEndDate: "", reason: "" });
      fetch_();
    } catch { toast.error("Failed"); }
    finally { setSubmitting(false); }
  };

  const handleReview = async (requestId: string, action: "APPROVE" | "REJECT") => {
    try {
      const res = await fetch("/api/client/projects/extensions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      const data = await res.json();
      if (!data.success) { toast.error(data.message); return; }
      toast.success(data.message);
      fetch_();
    } catch { toast.error("Failed"); }
  };

  const inputCls = "w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm  outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white text-[var(--text-primary)]";

  const STATUS_ICON: Record<string, React.ReactNode> = {
    PENDING:  <Clock size={15} className="text-yellow-500" />,
    APPROVED: <CheckCircle size={15} className="text-green-500" />,
    REJECTED: <XCircle size={15} className="text-red-500" />,
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[var(--primary)]" size={32} /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold  text-[var(--text-primary)]">Deadline Extensions</h2>
        {role === "ENGINEER" && (
          <button onClick={() => setOpen(true)} className="px-4 py-2 text-white rounded-lg flex items-center gap-2  text-sm" style={{ background: "var(--primary)" }}>
            <Plus size={15} /> Request Extension
          </button>
        )}
      </div>

      {extensions.length === 0 ? (
        <div className="text-center py-16 text-sm  text-[var(--text-muted)]">No extension requests yet.</div>
      ) : (
        <div className="space-y-3">
          {extensions.map((ext: any) => (
            <div key={ext.id} className="bg-white border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {STATUS_ICON[ext.status] ?? <Clock size={15} />}
                  <span className="text-xs font-semibold  text-[var(--text-primary)]">
                    Requested: {new Date(ext.requestedEndDate).toLocaleDateString()}
                  </span>
                </div>
                <span className={`text-[10px] font-semibold  px-2 py-0.5 rounded-full border
                  ${ext.status === "APPROVED" ? "bg-green-50 text-green-700 border-green-200" :
                    ext.status === "REJECTED" ? "bg-red-50 text-red-700 border-red-200" :
                    "bg-yellow-50 text-yellow-700 border-yellow-200"}`}>
                  {ext.status}
                </span>
              </div>
              <p className="text-xs  text-[var(--text-secondary)] mt-2 leading-relaxed">{ext.reason}</p>
              <p className="text-[10px]  text-[var(--text-muted)] mt-1">{new Date(ext.createdAt).toLocaleDateString()}</p>

              {role === "CLIENT" && ext.status === "PENDING" && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleReview(ext.id, "APPROVE")} className="px-3 py-1.5 bg-green-600 text-white text-xs  rounded-lg hover:bg-green-700">Approve</button>
                  <button onClick={() => handleReview(ext.id, "REJECT")} className="px-3 py-1.5 bg-red-500 text-white text-xs  rounded-lg hover:bg-red-600">Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full border border-[var(--border)] shadow-lg">
            <h3 className="text-base font-semibold  mb-4 text-[var(--text-primary)]">Request Deadline Extension</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs  text-[var(--text-muted)] mb-1">New Requested End Date</label>
                <input type="date" className={inputCls} value={form.requestedEndDate} onChange={(e) => setForm({ ...form, requestedEndDate: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs  text-[var(--text-muted)] mb-1">Reason (min 10 chars)</label>
                <textarea className={`${inputCls} resize-none`} rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Explain why you need more time..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setOpen(false)} className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm  text-[var(--text-secondary)]">Cancel</button>
              <button onClick={handleRequest} disabled={submitting} className="px-4 py-2 text-white rounded-lg text-sm  disabled:opacity-40 flex items-center gap-2" style={{ background: "var(--primary)" }}>
                {submitting && <Loader2 size={13} className="animate-spin" />} Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
