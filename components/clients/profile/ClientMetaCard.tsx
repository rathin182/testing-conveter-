"use client";

import React from "react";

export default function ClientMetaCard({ user }: { user: any }) {
  if (!user) return null;

  return (
    <div className="p-6 border border-[var(--border)] rounded-2xl bg-white flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm">
      <div className="w-24 h-24 rounded-full border-4 border-gray-50 bg-[var(--primary)] text-white flex items-center justify-center text-3xl font-bold overflow-hidden shrink-0 shadow-sm">
        {user.image ? (
          <img src={user.image} className="w-full h-full object-cover" alt="avatar" />
        ) : (
          user.name?.charAt(0)?.toUpperCase() || "C"
        )}
      </div>
      <div className="text-center md:text-left flex-1">
        <h4 className="text-2xl font-bold font-inter text-[var(--text-primary)]">{user.name}</h4>
        <p className="text-sm font-inter text-[var(--primary)] mt-1 font-semibold tracking-wide uppercase">
          Client
        </p>
        <p className="text-sm font-inter text-[var(--text-muted)] mt-3 max-w-2xl leading-relaxed">
          {user.bio || "No bio added yet. Edit your personal information to tell us about yourself!"}
        </p>
      </div>
    </div>
  );
}