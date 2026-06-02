"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Plus, Clock, CheckCircle, XCircle, User, LucideLoader } from "lucide-react";
import toast from "react-hot-toast";

export default function BlockageTab({ projectId }: { projectId: string }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newTicket, setNewTicket] = useState({ title: "", description: "", blockedBy: "", priority: "MEDIUM" });

  useEffect(() => { if (projectId) { fetchTickets(); fetchCurrentUser(); } }, [projectId]);

  const fetchCurrentUser = async () => {
    try { const res = await fetch("/api/auth/me"); const data = await res.json(); if (data.success) setCurrentUser(data.user); } catch { }
  };
  const fetchTickets = async () => {
    try { const res = await fetch(`/api/project/blockage?projectId=${projectId}`); const data = await res.json(); if (data.success) setTickets(data.tickets); } catch { } finally { setLoading(false); }
  };
  const createTicket = async () => {
    if (!newTicket.title.trim() || !newTicket.description.trim() || !newTicket.blockedBy.trim()) { toast.error("Please fill in all required fields"); return; }
    try {
      setCreating(true);
      const res = await fetch("/api/project/blockage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newTicket, projectId }) });
      const data = await res.json();
      if (data.success) { setShowModal(false); setNewTicket({ title: "", description: "", blockedBy: "", priority: "MEDIUM" }); await fetchTickets(); toast.success("Ticket created!"); }
      else toast.error(data.error || "Failed to create ticket");
    } catch { toast.error("Error creating ticket"); } finally { setCreating(false); }
  };
  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const res = await fetch("/api/project/blockage", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ticketId, status }) });
      const data = await res.json();
      if (data.success) { await fetchTickets(); toast.success("Status updated!"); }
      else toast.error(data.error || "Failed to update");
    } catch { toast.error("Error updating status"); }
  };

  const getPriorityStyle = (p: string) => ({
    HIGH: "bg-red-50 text-red-700 border-red-200",
    MEDIUM: "bg-[var(--primary-light)] text-[#b87a2e] border-[#ffd9a8]",
    LOW: "bg-green-50 text-green-700 border-green-200",
  }[p] || "bg-gray-100 text-gray-600 border-gray-200");

  const getStatusIcon = (s: string) => ({
    OPEN: <AlertTriangle className="text-red-500" size={18} />,
    IN_PROGRESS: <Clock style={{ color: "var(--primary)" }} size={18} />,
    RESOLVED: <CheckCircle className="text-green-500" size={18} />,
  }[s] || <XCircle style={{ color: "var(--text-muted)" }} size={18} />);

  const inputCls = "w-full px-3 py-2 rounded-lg bg-white border border-[var(--border)]  text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]";

  if (loading) return <div className="flex items-center justify-center py-12"><LucideLoader className="animate-spin" style={{ color: "var(--primary)" }} size={40} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold  flex items-center gap-2" style={{ color: "var(--text-primary)" }}><AlertTriangle size={22} /> Blockage Tickets</h2>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 text-white rounded-lg flex items-center gap-2  text-sm bg-red-500 hover:bg-red-600">
          <Plus size={14} /> Report Blockage
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
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  {getStatusIcon(ticket.status)}
                  <div>
                    <h3 className="font-semibold " style={{ color: "var(--text-primary)" }}>{ticket.title}</h3>
                    <p className="text-sm  mt-0.5" style={{ color: "var(--text-secondary)" }}>{ticket.description}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 text-xs font-semibold  rounded-full border ${getPriorityStyle(ticket.priority)}`}>{ticket.priority}</span>
              </div>
              <div className="bg-[var(--bg)] rounded-lg p-3 mb-3 border border-[var(--border)]">
                <p className="text-sm " style={{ color: "var(--text-secondary)" }}><strong>Blocked by:</strong> {ticket.blockedBy}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs " style={{ color: "var(--text-muted)" }}>
                  <span className="flex items-center gap-1"><User size={11} /> Reported by Developer</span>
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
                {currentUser?.role.name === "ADMIN" && ticket.status !== "RESOLVED" && (
                  <div className="flex gap-2">
                    {ticket.status === "OPEN" && (
                      <button onClick={() => updateTicketStatus(ticket.id, "IN_PROGRESS")} className="px-3 py-1 text-white text-xs rounded " style={{ background: "var(--primary)" }}>Start Progress</button>
                    )}
                    <button onClick={() => updateTicketStatus(ticket.id, "RESOLVED")} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded ">Mark Resolved</button>
                  </div>
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
              {[{ label: "Issue Title *", key: "title", type: "input", placeholder: "e.g., Waiting for design assets" },
                { label: "Description *", key: "description", type: "textarea", placeholder: "Describe the blockage..." },
                { label: "Blocked By *", key: "blockedBy", type: "input", placeholder: "e.g., Design Team, External API" }
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium  mb-1.5" style={{ color: "var(--text-secondary)" }}>{label}</label>
                  {type === "textarea"
                    ? <textarea value={(newTicket as any)[key]} onChange={(e) => setNewTicket({ ...newTicket, [key]: e.target.value })} className={`${inputCls} resize-none`} rows={3} placeholder={placeholder} disabled={creating} />
                    : <input type="text" value={(newTicket as any)[key]} onChange={(e) => setNewTicket({ ...newTicket, [key]: e.target.value })} className={inputCls} placeholder={placeholder} disabled={creating} />
                  }
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium  mb-1.5" style={{ color: "var(--text-secondary)" }}>Priority</label>
                <select value={newTicket.priority} onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })} className={inputCls} disabled={creating}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setNewTicket({ title: "", description: "", blockedBy: "", priority: "MEDIUM" }); }} className="px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg  text-sm" style={{ color: "var(--text-secondary)" }} disabled={creating}>Cancel</button>
              <button onClick={createTicket} disabled={creating} className="px-4 py-2 text-white rounded-lg  text-sm disabled:opacity-40 bg-red-500 hover:bg-red-600">
                {creating ? "Creating..." : "Report Blockage"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
