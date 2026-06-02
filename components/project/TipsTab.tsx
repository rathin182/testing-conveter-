"use client";

import { useEffect, useState } from "react";
import { Lightbulb, Plus, User, Calendar, LucideLoader } from "lucide-react";
import toast from "react-hot-toast";

export default function UsefulTipsTab({ projectId }: { projectId: string }) {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTip, setNewTip] = useState({ tip: "" });

  useEffect(() => { if (projectId) fetchTips(); }, [projectId]);

  const fetchTips = async () => {
    try { const res = await fetch(`/api/project/tip?projectId=${projectId}`); const data = await res.json(); if (data.success) setTips(data.tips); } catch { } finally { setLoading(false); }
  };

  const createTip = async () => {
    if (!newTip.tip.trim()) { toast.error("Please enter a tip"); return; }
    try {
      setCreating(true);
      const userRes = await fetch("/api/auth/me"); const userData = await userRes.json();
      if (!userData.success) { toast.error("Please login to add tips"); return; }
      const res = await fetch("/api/project/tip", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId, userId: userData.user.id, tip: newTip.tip.trim() }) });
      const data = await res.json();
      if (data.success) { setShowModal(false); setNewTip({ tip: "" }); await fetchTips(); toast.success("Tip added!"); }
      else toast.error(data.message || "Failed to add tip");
    } catch { toast.error("Error adding tip"); } finally { setCreating(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><LucideLoader className="animate-spin" style={{ color: "var(--primary)" }} size={40} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold  flex items-center gap-2" style={{ color: "var(--text-primary)" }}><Lightbulb size={22} /> Useful Tips</h2>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 text-white rounded-lg flex items-center gap-2  text-sm" style={{ background: "var(--primary)" }}>
          <Plus size={14} /> Add Tip
        </button>
      </div>

      <div className="rounded-lg p-4 border" style={{ background: "var(--primary-light)", borderColor: "#ffd9a8" }}>
        <h3 className="font-semibold  text-sm mb-1" style={{ color: "var(--text-primary)" }}>Contribution Guidelines</h3>
        <ul className="text-xs  space-y-0.5" style={{ color: "var(--text-secondary)" }}>
          <li><strong>Open to All:</strong> Anyone involved can contribute suggestions</li>
          <li><strong>Examples:</strong> Best practices, shortcuts, tools, workflow improvements</li>
        </ul>
      </div>

      {tips.length === 0 ? (
        <div className="text-center py-12">
          <Lightbulb className="mx-auto h-10 w-10 mb-3" style={{ color: "var(--border)" }} />
          <p className=" text-sm" style={{ color: "var(--text-muted)" }}>No tips shared yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tips.map((tip: any) => (
            <div key={tip.id} className="bg-white rounded-xl border border-[var(--border)] p-5">
              <div className="flex items-start gap-3">
                <Lightbulb size={18} style={{ color: "var(--primary)", marginTop: 2 }} />
                <div className="flex-1">
                  <p className="text-sm " style={{ color: "var(--text-secondary)" }}>{tip.tip}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs " style={{ color: "var(--text-muted)" }}>
                    <span className="flex items-center gap-1"><User size={11} /> {tip.user}</span>
                    <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(tip.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-xl border border-[var(--border)] shadow-lg">
            <h3 className="text-lg font-semibold  mb-4" style={{ color: "var(--text-primary)" }}>Share a Useful Tip</h3>
            <textarea value={newTip.tip} onChange={(e) => setNewTip({ tip: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-white border border-[var(--border)]  text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none" rows={4} placeholder="Share your insight..." disabled={creating} />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setShowModal(false); setNewTip({ tip: "" }); }} className="px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg  text-sm" style={{ color: "var(--text-secondary)" }}>Cancel</button>
              <button onClick={createTip} disabled={creating || !newTip.tip.trim()} className="px-4 py-2 text-white rounded-lg  text-sm disabled:opacity-40" style={{ background: "var(--primary)" }}>
                {creating ? "Adding..." : "Add Tip"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
