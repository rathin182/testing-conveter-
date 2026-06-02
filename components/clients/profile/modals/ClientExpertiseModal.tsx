"use client";

import React, { useState, useEffect } from "react";
import EngineerModal from "@/components/engineer/profile/modals/EngineerModal";
import { X } from "lucide-react";
import toast from "react-hot-toast";

export default function ClientExpertiseModal({ 
  isOpen, onClose, user, profile, onUpdate 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  user: any, 
  profile: any, 
  onUpdate: () => void 
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [expertise, setExpertise] = useState<string[]>([]);
  const [expInput, setExpInput] = useState("");

  useEffect(() => {
    if (isOpen && profile) {
      setExpertise(profile?.expertise || []);
      setExpInput("");
    }
  }, [profile, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = expInput.trim();
      if (value && !expertise.includes(value)) {
        setExpertise([...expertise, value]);
      }
      setExpInput("");
    }
  };

  const removeTag = (index: number) => {
    setExpertise(expertise.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/client/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expertise }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Expertise updated");
        onUpdate();
        onClose();
      } else {
        toast.error(data.message || "Failed to update");
      }
    } catch {
      toast.error("Error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <EngineerModal isOpen={isOpen} onClose={onClose} className="max-w-[500px]">
      <div className="p-8">
        <h4 className="text-2xl font-bold font-inter text-[var(--text-primary)] mb-2">Edit Expertise</h4>
        <p className="text-sm text-[var(--text-muted)] font-inter mb-6">Define your industry focus and areas of expertise.</p>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5">Expertise / Industry *</label>
            <div className="flex flex-wrap items-center gap-2 w-full border border-[var(--border)] rounded-lg p-2 focus-within:border-[var(--primary)] bg-gray-50/50 min-h-[50px]">
              {expertise.map((exp, index) => (
                <span key={index} className="flex items-center gap-1.5 px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium rounded-md">
                  {exp}
                  <button type="button" onClick={() => removeTag(index)} className="hover:text-red-500 transition-colors">
                    <X size={14} />
                  </button>
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

          <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border)]">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 rounded-lg border border-[var(--border)] font-semibold hover:bg-gray-50 transition-colors text-[var(--text-primary)]"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving} 
              className="px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white font-semibold disabled:opacity-50 transition-opacity"
            >
              {isSaving ? "Saving..." : "Save Details"}
            </button>
          </div>
        </form>
      </div>
    </EngineerModal>
  );
}