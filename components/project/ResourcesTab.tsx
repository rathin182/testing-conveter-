"use client";
import { useEffect, useState } from "react";
import { Plus, FileText, Link2, Image, File, Key, Trash2, Lock, Loader2, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  FILE:        <File size={14} />,
  CREDENTIALS: <Key size={14} />,
  IMAGE:       <Image size={14} />,
  LINK:        <Link2 size={14} />,
  TEXT:        <FileText size={14} />,
};

export default function ResourcesTab({ projectId, role, project }: { projectId: string; role: string; project: any }) {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: "", type: "TEXT", content: "" });
  const [file, setFile] = useState<File | null>(null);

  const isFileType = form.type === "FILE" || form.type === "IMAGE";
  const canAdd = role === "ENGINEER" || role === "ADMIN";

  const fetch_ = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/resources?projectId=${projectId}`);
      const data = await res.json();
      if (data.success) setResources(data.resources);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch_(); }, [projectId]);

  const handleAdd = async () => {
    if (!form.title) { toast.error("Title is required"); return; }
    if (isFileType && !file) { toast.error("File is required"); return; }
    if (!isFileType && !form.content) { toast.error("Content is required"); return; }

    const fd = new FormData();
    fd.append("projectId", projectId);
    fd.append("title", form.title);
    fd.append("type", form.type);
    if (isFileType && file) fd.append("file", file);
    else fd.append("content", form.content);

    setUploading(true);
    try {
      const res = await fetch("/api/resources", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.success) { toast.error(data.message); return; }
      toast.success("Resource added");
      setOpen(false);
      setForm({ title: "", type: "TEXT", content: "" });
      setFile(null);
      fetch_();
    } catch { toast.error("Failed to add resource"); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this resource?")) return;
    try {
      const res = await fetch(`/api/resources/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { toast.success("Deleted"); fetch_(); }
      else toast.error(data.message);
    } catch { toast.error("Failed to delete"); }
  };

  const inputCls = "w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm  outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white text-[var(--text-primary)]";

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[var(--primary)]" size={32} /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold  text-[var(--text-primary)]">Resources</h2>
        {canAdd && (
          <button onClick={() => setOpen(true)} className="px-4 py-2 text-white rounded-lg flex items-center gap-2  text-sm" style={{ background: "var(--primary)" }}>
            <Plus size={15} /> Add Resource
          </button>
        )}
      </div>

      {resources.length === 0 ? (
        <div className="text-center py-16 text-sm  text-[var(--text-muted)]">No resources yet.</div>
      ) : (
        <div className="space-y-3">
          {resources.map((r: any) => {
            const isLocked = r.isLocked && role === "CLIENT" && !project.isFinalPaymentMade;
            return (
              <div key={r.id} className="bg-white border border-[var(--border)] rounded-xl p-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-0.5 text-[var(--primary)]">{TYPE_ICONS[r.type] ?? <FileText size={14} />}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold  text-[var(--text-primary)] truncate">{r.title}</p>
                      {isLocked && <Lock size={12} className="text-[var(--text-muted)] shrink-0" />}
                    </div>
                    <p className="text-xs  text-[var(--text-muted)] mt-0.5">{r.type} · Added by {r.addedBy?.name}</p>
                    {!isLocked && (
                      <p className="text-xs  text-[var(--text-secondary)] mt-1 break-all line-clamp-2">{r.content}</p>
                    )}
                    {isLocked && (
                      <p className="text-xs  text-orange-500 mt-1">🔒 Complete final payment to unlock</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!isLocked && (r.type === "LINK" || r.type === "FILE" || r.type === "IMAGE") && (
                    <a href={r.content} target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                      <ExternalLink size={14} />
                    </a>
                  )}
                  {r.addedBy?.role === role || role === "ADMIN" ? (
                    <button onClick={() => handleDelete(r.id)} className="text-[var(--text-muted)] hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full border border-[var(--border)] shadow-lg">
            <h3 className="text-base font-semibold  mb-4 text-[var(--text-primary)]">Add Resource</h3>
            <div className="space-y-3">
              <input className={inputCls} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, content: "" })}>
                <option value="TEXT">Text</option>
                <option value="LINK">Link</option>
                <option value="CREDENTIALS">Credentials</option>
                <option value="FILE">File</option>
                <option value="IMAGE">Image</option>
              </select>
              {isFileType
                ? <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm  text-[var(--text-secondary)]" />
                : <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Content / URL / Credentials" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              }
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setOpen(false)} className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm  text-[var(--text-secondary)]">Cancel</button>
              <button onClick={handleAdd} disabled={uploading} className="px-4 py-2 text-white rounded-lg text-sm  disabled:opacity-40 flex items-center gap-2" style={{ background: "var(--primary)" }}>
                {uploading && <Loader2 size={13} className="animate-spin" />} Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
