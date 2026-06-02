"use client";

import React, { useState } from "react";
import { Edit2 } from "lucide-react";
import ClientExpertiseModal from "./modals/ClientExpertiseModal";

export default function ClientDetailsCard({ profile, user, onUpdate }: { profile: any, user: any, onUpdate: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="p-6 border border-[var(--border)] rounded-2xl bg-white">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h4 className="text-lg font-bold">Business Details</h4>
          <button onClick={() => setIsOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-semibold hover:bg-gray-50"><Edit2 size={14} /> Edit</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
          <div><p className="text-xs text-gray-500 uppercase">Total Projects</p><p className="font-bold text-sm">{profile?.totalProjects || 0}</p></div>
          <div><p className="text-xs text-gray-500 uppercase">Total Budget Spent</p><p className="font-bold text-sm">₹{(profile?.totalBudget || 0).toLocaleString()}</p></div>
          
          <div className="md:col-span-2 border-t pt-4">
            <p className="text-xs text-gray-500 uppercase mb-2">Areas of Expertise</p>
            <div className="flex flex-wrap gap-2">
              {profile?.expertise?.map((s: string) => <span key={s} className="bg-gray-100 border text-xs font-semibold px-3 py-1.5 rounded-md">{s}</span>)}
            </div>
          </div>
        </div>
      </div>
      <ClientExpertiseModal isOpen={isOpen} onClose={() => setIsOpen(false)} user={user} profile={profile} onUpdate={onUpdate} />
    </>
  );
}