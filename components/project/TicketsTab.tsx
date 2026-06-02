"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Plus, Trash2, User, Clock, LucideLoader } from "lucide-react";
import toast from "react-hot-toast";

export default function TicketsTab({ projectId }: { projectId: string }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [teammates, setTeammates] = useState<any[]>([]);
  const [newTicket, setNewTicket] = useState({ reason: "", blockedTeammates: [] as string[] });

  useEffect(() => {
    if (projectId) { fetchTickets(); fetchCurrentUser(); fetchTeammates(); }
  }, [projectId]);

  const fetchCurrentUser = async () => {
    try { const res = await fetch("/api/auth/me"); const data = await res.json(); if (data.success) setCurrentUser(data.user); } catch { }
  };
  const fetchTeammates = async () => {
    try { const res = await fetch(`/api/project/member?projectId=${projectId}`); const data = await res.json(); if (data.success) setTeammates(data.members); } catch { }
  };
  const fetchTickets = async () => {
    try { const res = await fetch(`/api/project/ticket?projectId=${projectId}`); const data = await res.json(); if (data.success) setTickets(data.tickets); } catch { } finally { setLoading(false); }
  };
  const createTicket = async () => {
    if (!newTicket.reason.trim()) { toast.error("Please describe the blockage issue"); return; }
    try {
      setCreating(true);
      const res = await fetch("/api/project/ticket", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId, reportedBy: currentUser?.name, reason: newTicket.reason.trim(), blockedTeammates: newTicket.blockedTeammates }) });
      const data = await res.json();
      if (data.success) { setShowModal(false); setNewTicket({ reason: "", blockedTeammates: [] }); await fetchTickets(); toast.success("Ticket created!"); }
      else toast.error(data.message || "Failed to create ticket");
    } catch { toast.error("Error creating ticket"); } finally { setCreating(false); }
  };
  const deleteTicket = async (ticketId: string) => {
    if (!confirm("Delete this ticket?")) return;
    try {
      const res = await fetch("/api/project/ticket", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ticketId }) });
      const data = await res.json();
      if (data.success) { await fetchTickets(); toast.success("Ticket deleted!"); }
      else toast.error(data.message || "Failed to delete");
    } catch { toast.error("Error deleting ticket"); }
  };

  const inputCls = "w-full px-3 py-2 rounded-lg bg-white border border-[var(--border)]  text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]";

  if (loading) return <div className="flex items-center justify-center py-12"><LucideLoader className="animate-spin" style={{ color: "var(--primary)" }} size={40} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold  flex items-center gap-2" style={{ color: "var(--text-primary)" }}><AlertTriangle size={22} /> Blockage Tickets</h2>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 text-white rounded-lg flex items-center gap-2  text-sm bg-red-500 hover:bg-red-600">
          <Plus size={16} /> Report Blockage
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-10 w-10 mb-3" style={{ color: "var(--border)" }} />
          <p className=" text-sm" style={{ color: "var(--text-muted)" }}>No blockages reported yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket: any) => (
            <div key={ticket.id} className="bg-white rounded-xl border border-[var(--border)] p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <AlertTriangle className="text-red-500 mt-0.5 shrink-0" size={18} />
                  <div className="flex-1">
                    <p className="font-semibold " style={{ color: "var(--text-primary)" }}>Project Blockage Issue</p>
                    <p className="text-sm  mt-1" style={{ color: "var(--text-secondary)" }}>{ticket.reason}</p>
                    {ticket.blockedTeammates?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {ticket.blockedTeammates.map((t: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 text-xs  rounded-full bg-red-50 text-red-700 border border-red-200">{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs " style={{ color: "var(--text-muted)" }}>
                      <span className="flex items-center gap-1"><User size={12} /> {ticket.reportedBy}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                {currentUser?.role.name === "ADMIN" && (
                  <button onClick={() => deleteTicket(ticket.id)} className="p-1.5 hover:text-red-500 transition-colors" style={{ color: "var(--text-muted)" }}><Trash2 size={15} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-xl border border-[var(--border)] shadow-lg">
            <h3 className="text-lg font-semibold  mb-4" style={{ color: "var(--text-primary)" }}>Report Project Blockage</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium  mb-1.5" style={{ color: "var(--text-secondary)" }}>Describe the blockage *</label>
                <textarea value={newTicket.reason} onChange={(e) => setNewTicket((p) => ({ ...p, reason: e.target.value }))} className={`${inputCls} resize-none`} rows={4} placeholder="e.g., Frontend blocked waiting for design mockups..." disabled={creating} />
              </div>
              <div>
                <label className="block text-sm font-medium  mb-1.5" style={{ color: "var(--text-secondary)" }}>Blocked Teammates</label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto border border-[var(--border)] rounded-lg p-2 bg-[var(--bg)]">
                  {teammates.map((t: any) => (
                    <label key={t.id} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-white transition-colors">
                      <input type="checkbox" checked={newTicket.blockedTeammates.includes(t.user.name)} onChange={(e) => setNewTicket((p) => ({ ...p, blockedTeammates: e.target.checked ? [...p.blockedTeammates, t.user.name] : p.blockedTeammates.filter((n) => n !== t.user.name) }))} className="rounded" disabled={creating} />
                      <span className="text-sm " style={{ color: "var(--text-secondary)" }}>{t.user.name}</span>
                    </label>
                  ))}
                  {teammates.length === 0 && <p className="text-xs  p-1" style={{ color: "var(--text-muted)" }}>No teammates found</p>}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setNewTicket({ reason: "", blockedTeammates: [] }); }} className="px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg  text-sm" style={{ color: "var(--text-secondary)" }} disabled={creating}>Cancel</button>
              <button onClick={createTicket} disabled={creating || !newTicket.reason.trim()} className="px-4 py-2 text-white rounded-lg  text-sm disabled:opacity-40 bg-red-500 hover:bg-red-600">
                {creating ? "Creating..." : "Report Blockage"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
