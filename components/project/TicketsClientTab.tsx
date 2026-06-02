"use client";
import { useEffect, useState } from "react";
import { Plus, AlertCircle, Loader2, Image as ImageIcon, X } from "lucide-react";
import toast from "react-hot-toast";

const ISSUE_TYPES = ["PAYMENT", "COMMUNICATION", "TECHNICAL", "DELIVERY", "OTHER"];

const STATUS_COLOR: Record<string, string> = {
  OPEN:        "bg-red-50 text-red-700 border-red-200",
  IN_PROGRESS: "bg-yellow-50 text-yellow-700 border-yellow-200",
  RESOLVED:    "bg-green-50 text-green-700 border-green-200",
  CLOSED:      "bg-gray-100 text-gray-600 border-gray-200",
};

export default function TicketsClientTab({ projectId }: { projectId: string }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ issueType: "TECHNICAL", description: "" });
  const [images, setImages] = useState<File[]>([]);

  const fetch_ = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tickets");
      const data = await res.json();
      if (data.success) setTickets(data.tickets.filter((t: any) => t.projectId === projectId));
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch_(); }, [projectId]);

  const handleSubmit = async () => {
    if (!form.description.trim()) { toast.error("Description is required"); return; }
    const fd = new FormData();
    fd.append("projectId", projectId);
    fd.append("issueType", form.issueType);
    fd.append("description", form.description);
    images.forEach((img) => fd.append("images", img));

    setSubmitting(true);
    try {
      const res = await fetch("/api/tickets", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.success) { toast.error(data.message); return; }
      toast.success("Ticket raised");
      setOpen(false);
      setForm({ issueType: "TECHNICAL", description: "" });
      setImages([]);
      fetch_();
    } catch { toast.error("Failed to raise ticket"); }
    finally { setSubmitting(false); }
  };

  const inputCls = "w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm  outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white text-[var(--text-primary)]";

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[var(--primary)]" size={32} /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold  text-[var(--text-primary)]">Support Tickets</h2>
        <button onClick={() => setOpen(true)} className="px-4 py-2 text-white rounded-lg flex items-center gap-2  text-sm" style={{ background: "var(--primary)" }}>
          <Plus size={15} /> Raise Ticket
        </button>
      </div>

      <div className="text-xs  p-3 rounded-lg border bg-[var(--primary-light)] border-[#ffd9a8] text-[var(--text-secondary)]">
        You can raise up to <strong>3 tickets per day</strong>. Tickets are reviewed by our admin team.
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-16 text-sm  text-[var(--text-muted)]">No tickets raised yet.</div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t: any) => (
            <div key={t.id} className="bg-white border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle size={15} className="text-[var(--primary)] shrink-0" />
                  <span className="text-xs font-semibold  text-[var(--text-primary)]">{t.issueType}</span>
                </div>
                <span className={`text-[10px] font-semibold  px-2 py-0.5 rounded-full border ${STATUS_COLOR[t.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {t.status}
                </span>
              </div>
              <p className="text-xs  text-[var(--text-secondary)] leading-relaxed">{t.description}</p>
              {t.images?.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {t.images.map((img: string, i: number) => (
                    <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                      <img src={img} alt="" className="w-12 h-12 object-cover rounded border border-[var(--border)]" />
                    </a>
                  ))}
                </div>
              )}
              <p className="text-[10px]  text-[var(--text-muted)] mt-2">{new Date(t.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full border border-[var(--border)] shadow-lg">
            <h3 className="text-base font-semibold  mb-4 text-[var(--text-primary)]">Raise a Ticket</h3>
            <div className="space-y-3">
              <select className={inputCls} value={form.issueType} onChange={(e) => setForm({ ...form, issueType: e.target.value })}>
                {ISSUE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <textarea className={`${inputCls} resize-none`} rows={4} placeholder="Describe the issue (min 10 chars)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div>
                <label className="block text-xs  text-[var(--text-muted)] mb-1">Attach images (max 5)</label>
                <input type="file" accept="image/*" multiple onChange={(e) => setImages(Array.from(e.target.files ?? []).slice(0, 5))} className="text-xs  text-[var(--text-secondary)]" />
                {images.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {images.map((img, i) => (
                      <div key={i} className="relative">
                        <img src={URL.createObjectURL(img)} alt="" className="w-10 h-10 object-cover rounded border border-[var(--border)]" />
                        <button onClick={() => setImages((p) => p.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center">
                          <X size={8} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setOpen(false)} className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm  text-[var(--text-secondary)]">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2 text-white rounded-lg text-sm  disabled:opacity-40 flex items-center gap-2" style={{ background: "var(--primary)" }}>
                {submitting && <Loader2 size={13} className="animate-spin" />} Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
