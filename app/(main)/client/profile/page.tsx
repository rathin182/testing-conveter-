"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import ClientInfoCard from "@/components/clients/profile/ClientInfoCard";
import ClientDetailsCard from "@/components/clients/profile/ClientDetailsCard";
import EngineerAccountCard from "@/components/engineer/profile/EngineerAccountCard";
import ClientMetaCard from "@/components/clients/profile/ClientMetaCard";

export default function ClientProfile() {
  const { data, isLoading, mutate } = useSWR("/api/client/profile", fetcher);

  if (isLoading) return <div className="flex items-center justify-center h-[80vh]"><div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: "var(--primary)" }} /></div>;

  const user = data?.user;
  const profile = data?.profile;

  if (!user) return <p className="text-center mt-10">No user found</p>;

  return (
      <div className="space-y-6 pb-10">
        <div>
          <h2 className="text-2xl font-bold font-inter text-[var(--text-primary)]">My Profile</h2>
          <p className="text-sm font-inter text-[var(--text-muted)] mt-1">Manage your personal and business details.</p>
        </div>

        <div className="space-y-6">
          <ClientMetaCard user={user} />
          <ClientInfoCard user={user} onUpdate={() => mutate()} />
          <ClientDetailsCard profile={profile} user={user} onUpdate={() => mutate()} />
          <EngineerAccountCard />
        </div>
      </div>
  );
}