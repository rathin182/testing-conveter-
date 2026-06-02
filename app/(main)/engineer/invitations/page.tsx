"use client";

import DashboardShell from "@/components/layout/DashboardShell";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Clock, CheckCircle, XCircle, Loader2, IndianRupee } from "lucide-react";
import { useRouter } from "next/navigation";

interface Invitation {
  id: string;
  status: string;
  createdAt: string;
  project: {
    id: string;
    title: string;
    description: string;
    earnings: number;
    instruments?: string[];
    createdAt: string;
  };
}

export default function EngineerInvitationsPage() {
  const { data: session } = useSession();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/engineer/invitation");
      const data = await res.json();

      if (data.success) {
        setInvitations(data.invitations);
      } else {
        toast.error(data.message || "Failed to load invitations");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === "ENGINEER") {
      fetchInvitations();
    }
  }, [session]);

  const handleAction = async (invitationId: string, action: "ACCEPT" | "REJECT") => {
    setActionLoading(invitationId);

    try {
      const res = await fetch(`/api/engineer/invitation/${invitationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        fetchInvitations(); // Refresh list
      } else {
        toast.error(data.message || "Action failed");
      }
      router.push("/dashboard/project");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingInvitations = invitations.filter(i => i.status === "SENT");

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold  text-[var(--text-primary)]">Project Invitations</h1>
          <p className="text-sm text-[var(--text-muted)]">Review and respond to AI-matched projects</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[var(--primary)]" size={40} />
          </div>
        ) : pendingInvitations.length === 0 ? (
          <div className="bg-white border border-[var(--border)] rounded-2xl p-12 text-center">
            <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-black">No pending invitations</h3>
            <p className="text-[var(--text-muted)]">New matching projects will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pendingInvitations.map((inv) => (
              <div
                key={inv.id}
                className="bg-white border border-[var(--border)] rounded-2xl p-6 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg leading-tight pr-4 text-black">{inv.project.title}</h3>
                  <span className="text-[10px] px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                    New Match
                  </span>
                </div>

                <p className="text-sm text-[var(--text-muted)] line-clamp-3 mb-5 leading-relaxed">
                  {inv.project.description}
                </p>

                <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white p-4 rounded-xl mb-6 text-center">
                  <p className="text-xs opacity-90">You will earn</p>
                  <p className="text-3xl font-bold">₹{inv.project.earnings.toLocaleString('en-IN')}</p>
                </div>

                {inv.project.instruments && inv.project.instruments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {inv.project.instruments.slice(0, 4).map((inst, i) => (
                      <span key={i} className="text-[10px] px-3 py-1 bg-[var(--primary-light)] text-[var(--primary)] rounded-full">
                        {inst}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleAction(inv.id, "REJECT")}
                    disabled={!!actionLoading}
                    className="flex-1 py-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-medium text-sm disabled:opacity-50"
                  >
                    {actionLoading === inv.id ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Reject"}
                  </button>

                  <button
                    onClick={() => handleAction(inv.id, "ACCEPT")}
                    disabled={!!actionLoading}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm disabled:opacity-50"
                  >
                    {actionLoading === inv.id ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Accept Project"}
                  </button>
                </div>

                <p className="text-center text-[10px] text-[var(--text-muted)] mt-4">
                  First come, first served • Respond quickly
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}