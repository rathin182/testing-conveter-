"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import EngineerMetaCard from "@/components/engineer/profile/EngineerMetaCard";
import EngineerInfoCard from "@/components/engineer/profile/EngineerInfoCard";
import EngineerDetailsCard from "@/components/engineer/profile/EngineerDetailsCard";
import EngineerAccountCard from "@/components/engineer/profile/EngineerAccountCard";
import DashboardShell from "@/components/layout/DashboardShell";

export default function Profile() {
  const { data, isLoading, mutate } = useSWR("/api/engineer/profile", fetcher);

  if (isLoading) {
      return (
        <DashboardShell>
          <div className="flex items-center justify-center h-[80vh]">
            <div 
              className="animate-spin rounded-full h-10 w-10 border-b-2" 
              style={{ borderColor: "var(--primary)" }} 
            />
          </div>
        </DashboardShell>
      );
    }

  const user = data?.user;
  const profile = data?.profile;

  if (!user) return <p className="text-center mt-10">No user found</p>;

  return (
    <DashboardShell>
    <div className="space-y-6 pb-10">
      <div>
        <h2 className="text-2xl font-bold font-inter text-[var(--text-primary)]">My Profile</h2>
        <p className="text-sm font-inter text-[var(--text-muted)] mt-1">Manage your personal and professional details.</p>
      </div>

      <div className="space-y-6">
        <EngineerMetaCard user={user} />
        <EngineerInfoCard user={user} onUpdate={() => mutate()} />
        <EngineerDetailsCard profile={profile} onUpdate={() => mutate()} />
        <EngineerAccountCard />
      </div>
    </div>
   </DashboardShell>
  );
}