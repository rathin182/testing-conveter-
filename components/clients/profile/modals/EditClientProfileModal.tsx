"use client";

import React, { useState, useEffect } from "react";
import EngineerModal from "@/components/engineer/profile/modals/EngineerModal";
import { Camera } from "lucide-react";
import toast from "react-hot-toast";

export default function EditClientProfileModal({ isOpen, onClose, user, onUpdate }: any) {
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setBio(user.bio || "");
      setPreview(user.image || "");
      setFile(null);
    }
  }, [user, isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("bio", bio);
    if (file) formData.append("profileImage", file);

    try {
      const res = await fetch("/api/client/profile", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        toast.success("Profile updated");
        onUpdate();
        onClose();
      } else toast.error(data.message);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <EngineerModal isOpen={isOpen} onClose={onClose} className="max-w-[600px]">
      <div className="p-8">
        <h4 className="text-2xl font-bold font-inter text-[var(--text-primary)] mb-2">Edit Personal Info</h4>
        <p className="text-sm text-[var(--text-muted)] font-inter mb-6">Update your photo, name, phone, and bio.</p>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="flex items-center gap-6 mb-2">
            <div className="relative w-20 h-20 rounded-full bg-gray-100 border border-[var(--border)] overflow-hidden shrink-0">
              {preview ? <img src={preview} className="w-full h-full object-cover" alt="Preview"/> : <span className="w-full h-full flex items-center justify-center text-gray-400"><Camera/></span>}
            </div>
            <label className="bg-white border border-[var(--border)] px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:border-[var(--primary)] transition-all">
              Upload new photo
              <input type="file" accept="image/*" className="hidden" onChange={e => {
                const f = e.target.files?.[0];
                if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
              }} />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Full Name</label>
              <input required value={name} onChange={e => setName(e.target.value)} className="w-full border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-[var(--primary)] bg-gray-50/50" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Phone Number</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" className="w-full border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-[var(--primary)] bg-gray-50/50" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1">Bio</label>
              <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)} className="w-full border border-[var(--border)] rounded-lg p-2.5 outline-none focus:border-[var(--primary)] bg-gray-50/50 resize-none" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border)] mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg border border-[var(--border)] font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={isSaving} className="px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white font-semibold disabled:opacity-50 shadow-md">
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </EngineerModal>
  );
}