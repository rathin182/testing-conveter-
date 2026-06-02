"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { ArrowLeft, Ban, CheckCircle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import AdminClientMetaCard from "@/components/admin/client-profile/AdminClientMetaCard";
import AdminClientInfoCard from "@/components/admin/client-profile/AdminClientInfoCard";
import AdminClientDetailsCard from "@/components/admin/client-profile/AdminClientDetailsCard";
import AdminClientAccountCard from "@/components/admin/client-profile/AdminClientAccountCard";
import ConfirmModal from "@/components/ConfirmModal";
import DashboardShell from "@/components/layout/DashboardShell";
import SuspendUserModal from "@/components/admin/SuspendUserModal";

export default function AdminClientProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading, mutate } = useSWR(`/api/admin/users/${id}`, fetcher);

  const [isProcessing, setIsProcessing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showSuspend, setShowSuspend] = useState(false);

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: "var(--primary)" }} />
        </div>
      </DashboardShell>
    );
  }

  const user = data?.user;
  const profile = user?.clientProfile;

  if (!user) return <p className="text-center mt-10">User not found</p>;

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Client deleted"); router.push("/admin/client-management"); }
      else toast.error("Failed to delete client");
    } catch { toast.error("Error occurred"); } 
    finally { setIsProcessing(false); }
  };

  return (
    <DashboardShell>
      <div className="space-y-6 pb-10 max-w-6xl mx-auto">
        {/* TOP ACTION BAR */}
        <div className="bg-white border border-[var(--border)] rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
              <ArrowLeft size={18} className="text-gray-600" />
            </button>
            <div>
              <h2 className="text-xl font-bold font-inter text-[var(--text-primary)]">Manage Client</h2>
              <p className="text-xs font-inter text-[var(--text-muted)]">ID: {user.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSuspend(true)} 
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100 text-sm font-semibold"
            >
              {user.isSuspended ? <CheckCircle size={16}/> : <Ban size={16}/>} 
              {user.isSuspended ? "Unsuspend" : "Suspend"}
            </button>
            <button 
              onClick={() => setShowDelete(true)} 
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-sm font-semibold"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>

        {/* PROFILE CARDS */}
        <div className="space-y-6">
          <AdminClientMetaCard user={user} />
          <AdminClientInfoCard user={user} onUpdate={() => mutate()} />
          <AdminClientDetailsCard profile={profile} user={user} onUpdate={() => mutate()} />
          <AdminClientAccountCard payoutData={user.payoutDetail} userId={user.id} onUpdate={() => mutate()} />
        </div>

        {/* MODALS */}
        <ConfirmModal isOpen={showDelete} title="Delete Client" message={`Permanently delete ${user.name}? This removes all their projects and data.`} confirmText="Delete" isDanger={true} isLoading={isProcessing} onCancel={() => setShowDelete(false)} onConfirm={handleDelete} />
        <SuspendUserModal 
          isOpen={showSuspend}
          user={user}
          onClose={() => setShowSuspend(false)}
          onSuccess={() => {
            toast.success(`User account has been successfully ${user.isSuspended ? "unsuspended" : "suspended"}.`);
            mutate();
          }}
        />
      </div>
    </DashboardShell>
  );
}