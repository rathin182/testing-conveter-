"use client";

import React, { useState } from "react";
import { Plus, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { User } from "./ProjectUI";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { usePayment } from "@/hooks/usePayment";

export function CreateProjectModal({ onClose, onCreated, user }: { onClose: () => void; onCreated: () => void, user: User }) {
  const router = useRouter();
  const { processPayment, loading: isPaying } = usePayment();
  
  const [form, setForm] = useState({ title: "", description: "", budget: "", startDate: "", endDate: "" });
  const [instruments, setInstruments] = useState<string[]>([]);
  const [instrInput, setInstrInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addInstrument = () => {
    const v = instrInput.trim();
    if (v && !instruments.includes(v)) setInstruments((p) => [...p, v]);
    setInstrInput("");
  };

  const handleStartMatching = async (projectId: string) => {
    try {
      const res = await fetch("/api/match", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (data.success) toast.success("Matching started! Finding best engineers...");
    } catch {
      toast.error("Something went wrong with matching.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (form.title.length < 5) { setError("Title must be at least 5 characters"); setLoading(false); return; }
      if (form.description.length < 20) { setError("Description must be at least 20 characters"); setLoading(false); return; }
      if (Number(form.budget) < 500) { setError("Budget must be at least ₹500"); setLoading(false); return; }

      // Create the Project in the Database
      const res = await fetch("/api/client/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title, description: form.description, budget: Number(form.budget),
          instruments, startDate: form.startDate || undefined, endDate: form.endDate || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to create project");
        setLoading(false);
        return;
      }

      const projectId = data.projectId;
      setLoading(false); 

      // Trigger payment
      processPayment({
        projectId,
        redirectPath: `/client/project/${projectId}`,
        user: { name: user?.name, email: user?.email },
        description: "Advance Payment (40%)",
        
        onSuccess: () => {
          handleStartMatching(projectId);
          onCreated();
          onClose();
          router.push(`/client/project/${projectId}`);
        },
        onError: (errMsg) => {
          setError(errMsg);
          onCreated(); 
        },
        onDismiss: () => {
          toast.error("Project saved! You can pay the advance later from your account.");
          onCreated();
          onClose();
        }
      });

    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  const inputCls = "w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm  outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white text-[var(--text-primary)]";
  const budgetAmount = form.budget ? Number(form.budget) : 0;
  const advanceAmount = (budgetAmount * 0.4).toFixed(0);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-lg font-bold  text-[var(--text-primary)] mb-1">Create New Project</h2>
          <p className="text-xs text-[var(--text-muted)]  mb-5">You&apos;ll pay 40% advance after creation</p>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
              <AlertCircle size={13} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium  text-[var(--text-secondary)] mb-1">Title *</label>
              <input className={inputCls} placeholder="Project title (min 5 chars)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={100} disabled={loading || isPaying} required />
            </div>

            <div>
              <label className="block text-xs font-medium  text-[var(--text-secondary)] mb-1">Description *</label>
              <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Describe your project (min 20 chars)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={500} disabled={loading || isPaying} required />
            </div>

            <div>
              <label className="block text-xs font-medium  text-[var(--text-secondary)] mb-1">Budget (₹) *</label>
              <input type="number" className={inputCls} placeholder="Min ₹500" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} min="500" disabled={loading || isPaying} required />
              {budgetAmount > 0 && (
                <p className="text-[10px] text-[var(--text-muted)] mt-1.5 p-2 bg-blue-50 rounded border border-blue-100">
                  💳 You&apos;ll pay <span className="font-bold text-[var(--primary)]">₹{advanceAmount}</span> (40% advance) after project creation
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Start Date</label>
                <DatePicker
                  selected={form.startDate ? new Date(form.startDate) : null}
                  onChange={(date: any) => setForm({ ...form, startDate: date ? date.toISOString().split('T')[0] : "" })}
                  dateFormat="dd/MM/yy"
                  className={inputCls}
                  placeholderText="dd/mm/yy"
                  disabled={loading || isPaying}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">End Date</label>
                <DatePicker
                  selected={form.endDate ? new Date(form.endDate) : null}
                  onChange={(date: any) => setForm({ ...form, endDate: date ? date.toISOString().split('T')[0] : "" })}
                  dateFormat="dd/MM/yy"
                  minDate={form.startDate ? new Date(form.startDate) : new Date()}
                  className={inputCls}
                  placeholderText="dd/mm/yy"
                  disabled={loading || isPaying}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium  text-[var(--text-secondary)] mb-1">Instruments / Skills Needed</label>
              <div className="flex gap-2 mb-2">
                <input className={inputCls} placeholder="e.g. React, Node.js" value={instrInput} onChange={(e) => setInstrInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInstrument())} disabled={loading || isPaying} />
                <button type="button" onClick={addInstrument} disabled={loading || isPaying} className="px-3 py-2 bg-[var(--primary-light)] text-[var(--primary)] border border-[#ffd9a8] rounded-lg text-xs  font-semibold disabled:opacity-50">Add</button>
              </div>
              <div className="flex flex-wrap gap-1">
                {instruments.map((i) => (
                  <span key={i} className="text-[10px]  px-2 py-0.5 bg-[var(--primary-light)] text-[var(--primary)] border border-[#ffd9a8] rounded-full flex items-center gap-1">
                    {i} <button type="button" onClick={() => setInstruments((p) => p.filter((x) => x !== i))} disabled={loading || isPaying} className="hover:text-red-500 disabled:opacity-50">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} disabled={loading || isPaying} className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg text-sm  text-[var(--text-secondary)] hover:bg-[var(--bg)] disabled:opacity-50">Cancel</button>
              <button type="submit" disabled={loading || isPaying || !form.title.trim() || !form.description.trim() || !form.budget} className="flex-1 px-4 py-2 text-white rounded-lg text-sm  font-semibold disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: "var(--primary)" }}>
                {(loading || isPaying) ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {isPaying ? "Processing..." : "Create & Pay"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}