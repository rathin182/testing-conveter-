"use client";

import React, { useState } from "react";
import { Edit2, ShieldCheck } from "lucide-react";
import EditClientProfileModal from "./modals/EditClientProfileModal";
import ChangePasswordModal from "@/components/engineer/profile/modals/ChangePasswordModal";

export default function ClientInfoCard({ user, onUpdate }: { user: any, onUpdate: () => void }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPassOpen, setIsPassOpen] = useState(false);

  return (
    <>
      <div className="p-6 border border-[var(--border)] rounded-2xl bg-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-[var(--border)] pb-4">
          <h4 className="text-lg font-bold font-inter text-[var(--text-primary)]">Personal Information</h4>
          <div className="flex gap-2">
             <button onClick={() => setIsEditOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-semibold hover:bg-gray-50 transition-colors">
               <Edit2 size={14} /> Edit
             </button>
             <button onClick={() => setIsPassOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-semibold hover:bg-gray-50 transition-colors">
               <ShieldCheck size={14} /> Change Password
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
          <div>
            <p className="text-xs text-[var(--text-muted)] font-semibold mb-1 uppercase tracking-wider">Full Name</p>
            <p className="font-semibold text-sm text-[var(--text-primary)]">{user.name}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] font-semibold mb-1 uppercase tracking-wider">Client ID</p>
            <p className="font-mono text-sm font-semibold text-[var(--text-secondary)]">{user.id}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] font-semibold mb-1 uppercase tracking-wider">Phone</p>
            <p className="font-semibold text-sm text-[var(--text-primary)]">{user.phone || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] font-semibold mb-1 uppercase tracking-wider">Email Address</p>
            <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{user.email}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-[var(--text-muted)] font-semibold mb-1 uppercase tracking-wider">Bio</p>
            <p className="font-semibold text-sm text-[var(--text-primary)]">{user.bio || "—"}</p>
          </div>
        </div>
      </div>

      <EditClientProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} user={user} onUpdate={onUpdate} />
      <ChangePasswordModal isOpen={isPassOpen} onClose={() => setIsPassOpen(false)} user={user} />
    </>
  );
}