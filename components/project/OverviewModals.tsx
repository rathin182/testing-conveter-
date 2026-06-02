import React, { useState } from "react";
import { X, Send } from "lucide-react";
import toast from "react-hot-toast";
import { T, inputCls, selectCls, labelStyle, getApiBase } from "./OverviewUI";

export const EditModal = ({ showModel, projectData, userRole }: { showModel: (v: boolean) => void; projectData: any, userRole: string }) => {
  const [loading, setLoading] = useState(false);
  const [instruments, setInstruments] = useState<string[]>(projectData.instruments || []);
  const [newInstrument, setNewInstrument] = useState("");
  const isAdmin = userRole === "ADMIN";

  const [formData, setFormData] = useState({
    title: projectData.title || "",
    description: projectData.description || "",
    startDate: projectData.startDate || "",
    endDate: projectData.endDate || "",
    priority: projectData.priority || "LOW",
    repository: projectData.repository || "",
    budget: projectData.budget || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const apiBase = getApiBase(userRole);
    
    try {
      const payload: any = { projectId: projectData.id, ...formData, instruments };
      if (!isAdmin) { delete payload.repository; delete payload.budget; }

      const res = await fetch(`${apiBase}/${projectData.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success("Project updated successfully");
        showModel(false);
        window.location.reload();
      } else { toast.error(data.message || "Failed to update project"); }
    } catch { toast.error("Failed to update project"); } 
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(5,10,48,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
      <div style={{ background: T.card, borderRadius: 16, width: "100%", maxWidth: 660, maxHeight: "82vh", overflowY: "auto", border: `1px solid ${T.border}`, boxShadow: "0 8px 40px rgba(5,10,48,0.12)" }}>
        <div style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: T.text, margin: 0 }}>Edit Project Details</h2>
            <button onClick={() => showModel(false)} style={{ border: "none", background: "transparent", cursor: "pointer", color: T.textMuted }}><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={labelStyle}>Project Title *</label><input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputCls} required /></div>
              <div><label style={labelStyle}>Priority</label>
                <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className={selectCls}>
                  <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
                </select>
              </div>
              <div><label style={labelStyle}>Start Date</label><input type="date" value={formData.startDate?.split("T")[0]} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className={inputCls} /></div>
              <div><label style={labelStyle}>Deadline</label><input type="date" value={formData.endDate?.split("T")[0]} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className={inputCls} /></div>
              {isAdmin && (
                <>
                  <div><label style={labelStyle}>Budget (₹) *</label><input type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })} className={inputCls} required /></div>
                  <div><label style={labelStyle}>Repository</label><input type="text" value={formData.repository} onChange={(e) => setFormData({ ...formData, repository: e.target.value })} className={inputCls} placeholder="URL ending in .git" /></div>
                </>
              )}
            </div>

            <div>
              <label style={labelStyle}>Requirements / Tech Stack</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input type="text" placeholder="Add requirement..." value={newInstrument} onChange={(e) => setNewInstrument(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (newInstrument.trim()) { setInstruments([...instruments, newInstrument.trim()]); setNewInstrument(""); }}}} className={inputCls} />
                <button type="button" onClick={() => { if (newInstrument.trim()) { setInstruments([...instruments, newInstrument.trim()]); setNewInstrument(""); }}} style={{ padding: "8px 14px", background: T.primary, border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, cursor: "pointer" }}>Add</button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {instruments.map((inst, i) => (
                  <span key={i} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, background: T.bg, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 4 }}>
                    {inst} <button type="button" onClick={() => setInstruments(instruments.filter((_, idx) => idx !== i))} style={{ color: T.danger, background: "none", border: "none", cursor: "pointer" }}>×</button>
                  </span>
                ))}
              </div>
            </div>

            <div><label style={labelStyle}>Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={inputCls} rows={3} /></div>

            <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
              <button type="button" onClick={() => showModel(false)} style={{ flex: 1, padding: "10px", border: `1px solid ${T.border}`, borderRadius: 8, background: T.card, color: T.text, cursor: "pointer", fontWeight: 500 }}>Cancel</button>
              <button type="submit" disabled={loading} style={{ flex: 1, padding: "10px", background: T.primary, border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Updating..." : "Update Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const SubmitReviewModal = ({ showModel, projectData }: { showModel: (v: boolean) => void; projectData: any }) => {
  const [loading, setLoading] = useState(false);
  const [repo, setRepo] = useState(projectData.repository || "");
  const [link, setLink] = useState(projectData.finalProjectLink || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/engineer/projects/${projectData.id}/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ finalProjectLink: link, repository: repo }) });
      const data = await res.json();
      if (data.success) { toast.success("Submitted for review!"); showModel(false); window.location.reload(); } 
      else { toast.error(data.message || "Failed to submit"); }
    } catch { toast.error("An error occurred"); } 
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(5,10,48,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: T.card, borderRadius: 16, padding: "1.5rem", width: 400, border: `1px solid ${T.border}` }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: T.text, margin: "0 0 1rem" }}>Submit for Review</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div><label style={labelStyle}>Live Project Link *</label><input type="url" value={link} onChange={(e) => setLink(e.target.value)} className={inputCls} placeholder="https://..." required /></div>
          <div><label style={labelStyle}>Repository URL</label><input type="url" value={repo} onChange={(e) => setRepo(e.target.value)} className={inputCls} placeholder="https://github.com/..." /></div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button type="button" onClick={() => showModel(false)} style={{ flex: 1, padding: "9px", border: `1px solid ${T.border}`, borderRadius: 8, background: T.card, cursor: "pointer", fontWeight: 500 }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: "9px", background: T.success, border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Send size={15} /> {loading ? "Sending..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ProgressModal = ({ current, onClose, onSave, saving }: any) => {
  const [val, setVal] = useState(current);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(5,10,48,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: T.card, borderRadius: 16, padding: "1.5rem", width: 340, border: `1px solid ${T.border}`, boxShadow: "0 8px 40px rgba(5,10,48,0.12)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: T.text, margin: 0 }}>Update Progress</h2>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: T.textMuted }}><X size={18} /></button>
        </div>
        <input type="range" min={0} max={100} value={val} onChange={(e) => setVal(Number(e.target.value))} style={{ width: "100%", accentColor: T.primary }} />
        <p style={{ textAlign: "center", fontWeight: 700, fontSize: 28, color: T.text, margin: "8px 0 16px" }}>{val}%</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "9px", border: `1px solid ${T.border}`, borderRadius: 8, background: T.card, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onSave(val)} disabled={saving} style={{ flex: 1, padding: "9px", background: T.primary, border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", opacity: saving ? 0.7 : 1 }}>{saving ? "Saving..." : "Save"}</button>
        </div>
      </div>
    </div>
  );
};