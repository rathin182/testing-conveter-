"use client";
import React, { useState, useEffect } from "react";
import { Edit2, X } from "lucide-react";
import EngineerModal from "@/components/engineer/profile/modals/EngineerModal";
import toast from "react-hot-toast";

export default function AdminClientDetailsCard({ profile, user, onUpdate }: { profile: any, user: any, onUpdate: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expertise, setExpertise] = useState<string[]>([]);
  const [expInput, setExpInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      setExpertise(profile?.expertise || []);
      setExpInput("");
    }
  }, [profile, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = expInput.trim();
      if (value && !expertise.includes(value)) setExpertise([...expertise, value]);
      setExpInput("");
    }
  };

  const removeTag = (index: number) => setExpertise(expertise.filter((_, i) => i !== index));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expertise }),
      });
      if (res.ok) { toast.success("Updated successfully"); onUpdate(); setIsOpen(false); }
      else toast.error("Update failed");
    } catch { toast.error("Error occurred"); }
    finally { setIsSaving(false); }
  };

  return (
    <>
      <div className="p-6 border border-[var(--border)] rounded-2xl bg-white">
        <div className="flex justify-between items-center mb-6 border-b border-[var(--border)] pb-4">
          <h4 className="text-lg font-bold font-inter text-[var(--text-primary)]">Client Details</h4>
          <button onClick={() => setIsOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-semibold hover:bg-gray-50 transition-colors">
            <Edit2 size={14} /> Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
          <div><p className="text-xs text-[var(--text-muted)] font-semibold mb-1 uppercase tracking-wider">Total Projects</p><p className="font-semibold text-sm text-[var(--text-primary)]">{profile?.totalProjects || 0}</p></div>
          <div><p className="text-xs text-[var(--text-muted)] font-semibold mb-1 uppercase tracking-wider">Total Budget Spent</p><p className="font-semibold text-sm text-[var(--text-primary)]">₹{(profile?.totalBudget || 0).toLocaleString()}</p></div>
          
          <div className="md:col-span-2 pt-2 border-t border-dashed border-[var(--border)]">
            <p className="text-xs text-[var(--text-muted)] font-semibold mb-2 uppercase tracking-wider">Areas of Expertise / Industry</p>
            <div className="flex flex-wrap gap-2">
              {profile?.expertise?.length > 0 
                ? profile.expertise.map((s: string) => <span key={s} className="bg-gray-100 border border-[var(--border)] text-[var(--text-secondary)] text-xs font-semibold px-3 py-1.5 rounded-md shadow-sm">{s}</span>)
                : <span className="text-sm text-gray-400 italic">None added</span>}
            </div>
          </div>
        </div>
      </div>

      <EngineerModal isOpen={isOpen} onClose={() => setIsOpen(false)} className="max-w-[600px]">
        <div className="p-8">
          <h4 className="text-2xl font-bold font-inter text-[var(--text-primary)] mb-6">Edit Client Details</h4>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Expertise / Industry</label>
              <div className="flex flex-wrap items-center gap-2 w-full border border-[var(--border)] rounded-lg p-2 focus-within:border-[var(--primary)] bg-gray-50/50 min-h-[50px]">
                {expertise.map((exp, index) => (
                  <span key={index} className="flex items-center gap-1.5 px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium rounded-md">
                    {exp}
                    <button type="button" onClick={() => removeTag(index)} className="hover:text-red-500"><X size={14}/></button>
                  </span>
                ))}
                <input 
                  value={expInput} 
                  onChange={e => setExpInput(e.target.value)} 
                  onKeyDown={handleKeyDown}
                  placeholder={expertise.length === 0 ? "Type and press Enter" : ""}
                  className="flex-1 bg-transparent outline-none min-w-[150px] p-1 text-sm text-[var(--text-primary)]" 
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t mt-4"><button type="button" onClick={()=>setIsOpen(false)} className="px-5 py-2.5 rounded-lg border font-semibold">Cancel</button><button type="submit" disabled={isSaving} className="px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white font-semibold">{isSaving ? "Saving..." : "Save"}</button></div>
          </form>
        </div>
      </EngineerModal>
    </>
  );
}