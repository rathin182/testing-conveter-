"use client";

import { PlusCircle, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import TextArea from "../form/input/TextArea";
import Loader from "../common/Loading";

type CardProps = { id: string; description: string; createdBy: string; date: string; onDelete?: (id: string) => void; };

export function MinimalCard({ id, description, createdBy, date, onDelete }: CardProps) {
  return (
    <div className="relative rounded-xl border border-[var(--border)] bg-white p-5 transition-colors">
      <button onClick={() => onDelete?.(id)} className="absolute right-3 top-3 p-1.5 rounded-lg hover:bg-red-50 transition-colors" style={{ color: "var(--text-muted)" }}>
        <Trash2 size={14} />
      </button>
      <p className="text-sm  leading-relaxed pr-8" style={{ color: "var(--text-secondary)" }}>{description}</p>
      <div className="mt-4 flex items-center justify-between text-xs ">
        <span style={{ color: "var(--text-muted)" }}>{createdBy}</span>
        <span style={{ color: "var(--text-muted)" }}>{date}</span>
      </div>
    </div>
  );
}

function ClientUpdate({ projectId }: { projectId: string }) {
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [update, setUpdate] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchUpdates = async () => {
    setLoading(true);
    const req = await fetch(`/api/latest-updates?projectId=${projectId}`);
    if (req.status === 200) { const d = await req.json(); setData(d.updates); }
    setLoading(false);
  };

  const handleAddUpdate = async () => {
    if (!update.trim()) return;
    try {
      setUpdating(true);
      const userRes = await fetch("/api/auth/me"); const userData = await userRes.json();
      const res = await fetch("/api/latest-updates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: update, projectId, createdBy: userData.user?.name || "Admin" }) });
      if (res.ok) { setUpdate(""); setShowAddUpdate(false); fetchUpdates(); }
    } catch { } finally { setUpdating(false); }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Delete this update?")) return;
    try {
      const req = await fetch(`/api/latest-updates?id=${id}`, { method: "DELETE" });
      if (req.ok) fetchUpdates();
    } catch { }
  };

  useEffect(() => { fetchUpdates(); }, []);

  if (loading) return <div className="w-full h-[80vh] flex justify-center items-center"><Loader /></div>;

  return (
    <div className="relative space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold " style={{ color: "var(--text-primary)" }}>Client Update</h2>
          <p className="text-sm  mt-0.5" style={{ color: "var(--text-muted)" }}>Report to client for the latest updates.</p>
        </div>
        <button onClick={() => setShowAddUpdate(true)} className="px-4 py-2 text-white rounded-lg flex items-center gap-2  text-sm" style={{ background: "var(--primary)" }}>
          <PlusCircle size={15} /> Update
        </button>
      </div>

      {showAddUpdate && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/40">
          <div className="w-full max-w-md bg-white p-6 rounded-xl border border-[var(--border)] shadow-lg">
            <h1 className="text-lg font-semibold  mb-4" style={{ color: "var(--text-primary)" }}>Update to Client</h1>
            <TextArea value={update} onChange={(e) => setUpdate(e)} className="min-h-40 bg-[var(--bg)] resize-none border border-[var(--border)] rounded-lg  text-sm" />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setShowAddUpdate(false); setUpdate(""); }} className="px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg  text-sm" style={{ color: "var(--text-secondary)" }}>Cancel</button>
              <button onClick={handleAddUpdate} disabled={updating} className="px-4 py-2 text-white rounded-lg  text-sm disabled:opacity-40" style={{ background: "var(--primary)" }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((card: any, i) => (
            <MinimalCard key={i} id={card.id} date={card.date} createdBy={card.createdBy} description={card.title} onDelete={deleteProject} />
          ))}
        </div>
      ) : (
        <p className="text-center  text-sm py-12" style={{ color: "var(--text-muted)" }}>No updates added yet.</p>
      )}
    </div>
  );
}

export default ClientUpdate;
