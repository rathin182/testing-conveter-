"use client";
import React from "react";

export default function AdminEngMetaCard({ user }: { user: any }) {
  return (
    <div className="p-6 border border-[var(--border)] rounded-2xl bg-white flex items-center gap-6">
      <div className="w-24 h-24 rounded-full border-4 border-gray-50 bg-[var(--primary)] text-white flex items-center justify-center text-3xl font-bold overflow-hidden shrink-0 shadow-sm">
        {user.image ? <img src={user.image} className="w-full h-full object-cover" alt="avatar" /> : user.name?.charAt(0)}
      </div>
      <div>
        <h4 className="text-2xl font-bold font-inter text-[var(--text-primary)]">{user.name}</h4>
        <p className="text-sm font-inter text-[var(--text-secondary)] mt-1 font-semibold">Engineer</p>
      </div>
    </div>
  );
}