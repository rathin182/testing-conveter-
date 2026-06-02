"use client";
import React, { useState, useEffect } from "react";
import { Edit2 } from "lucide-react";
import EngineerModal from "@/components/engineer/profile/modals/EngineerModal";
import toast from "react-hot-toast";

export default function AdminClientInfoCard({ user, onUpdate }: { user: any, onUpdate: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", bio: "" });
console.log(user, "userss");

  useEffect(() => {
    if (user && isOpen) setFormData({ name: user.name || "", phone: user.phone || "", bio: user.bio || "" });
  }, [user, isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
          <h4 className="text-lg font-bold font-inter text-[var(--text-primary)]">Personal Information</h4>
          <button onClick={() => setIsOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-semibold hover:bg-gray-50 transition-colors">
            <Edit2 size={14} /> Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
          <div><p className="text-xs text-[var(--text-muted)] font-semibold mb-1 uppercase tracking-wider">Full Name</p><p className="font-semibold text-sm text-[var(--text-primary)]">{user.name}</p></div>
          <div><p className="text-xs text-[var(--text-muted)] font-semibold mb-1 uppercase tracking-wider">Client ID</p><p className="font-mono text-sm font-semibold text-[var(--text-secondary)]">{user.id}</p></div>
          <div><p className="text-xs text-[var(--text-muted)] font-semibold mb-1 uppercase tracking-wider">Phone</p><p className="font-semibold text-sm text-[var(--text-primary)]">{user.phone || "—"}</p></div>
          <div><p className="text-xs text-[var(--text-muted)] font-semibold mb-1 uppercase tracking-wider">Email Address</p><p className="font-semibold text-sm text-[var(--text-primary)] truncate">{user.email}</p></div>
          <div className="md:col-span-2"><p className="text-xs text-[var(--text-muted)] font-semibold mb-1 uppercase tracking-wider">Bio</p><p className="font-semibold text-sm text-[var(--text-primary)]">{user.bio || "—"}</p></div>
          <div className="md:col-span-2"><p className="text-xs text-[var(--text-muted)] font-semibold mb-1 uppercase tracking-wider">Total Projects</p><p className="font-semibold text-sm text-[var(--text-primary)]">{user.clientProfile?.totalProjects}</p></div>
        </div>
      </div>

      <EngineerModal isOpen={isOpen} onClose={() => setIsOpen(false)} className="max-w-[500px]">
        <div className="p-8">
          <h4 className="text-2xl font-bold font-inter text-[var(--text-primary)] mb-6">Edit Personal Info</h4>
          <form onSubmit={handleSave} className="space-y-4">
            <div><label className="block text-sm font-semibold mb-1">Full Name</label><input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg p-3 bg-gray-50" /></div>
            <div><label className="block text-sm font-semibold mb-1">Phone</label><input value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="w-full border rounded-lg p-3 bg-gray-50" /></div>
            <div><label className="block text-sm font-semibold mb-1">Bio</label><textarea value={formData.bio} onChange={e=>setFormData({...formData, bio: e.target.value})} rows={3} className="w-full border rounded-lg p-3 bg-gray-50" /></div>
            <div className="flex justify-end gap-3 pt-4 border-t"><button type="button" onClick={()=>setIsOpen(false)} className="px-5 py-2.5 rounded-lg border font-semibold">Cancel</button><button type="submit" disabled={isSaving} className="px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white font-semibold">{isSaving ? "Saving..." : "Save"}</button></div>
          </form>
        </div>
      </EngineerModal>
    </>
  );
}