"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DashboardShell from "@/components/layout/DashboardShell";
import { StatusBadge } from "@/components/project/ProjectUI";

type Invitation = {
  id: string;
  project: {
    id: string;
    title: string;
    budget: number;
    status: string;
  };
  engineer: {
    user: {
      name: string;
      email: string;
      image?: string;
    };
  };
};

export default function InvitationsManagementPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const res = await fetch("/api/admin/invitations"); // adjust route
        const data = await res.json();

        if (!data.success) return;

        // 🔥 GROUP BY PROJECT
        const grouped: Record<string, any> = {};

        data.invitations.forEach((inv: Invitation) => {
          const projectId = inv.project.id;

          if (!grouped[projectId]) {
            grouped[projectId] = {
              id: projectId,
              title: inv.project.title,
              budget: inv.project.budget,
              status: inv.project.status,
              invitationsCount: 0,
              engineers: [],
            };
          }

          grouped[projectId].invitationsCount += 1;
          grouped[projectId].engineers.push(inv.engineer);
        });

        setProjects(Object.values(grouped));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, []);

  if (loading) {
    return (
      <DashboardShell>
        <div className="space-y-6 animate-pulse">

          {/* HEADER */}
          <div>
            <div className="h-8 w-72 rounded-xl bg-gray-200 mb-3" />
            <div className="h-4 w-96 rounded-lg bg-gray-100" />
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="
                rounded-3xl
                border
                border-[var(--border)]
                bg-white
                p-6
                shadow-sm
              "
              >

                {/* TOP */}
                <div className="flex items-center justify-between mb-6">

                  <div className="h-6 w-40 rounded-lg bg-gray-200" />

                  <div className="h-7 w-20 rounded-full bg-gray-100" />

                </div>

                {/* AVATARS */}
                <div className="flex -space-x-2 mb-6">
                  {[1, 2, 3].map((avatar) => (
                    <div
                      key={avatar}
                      className="
                      w-10
                      h-10
                      rounded-full
                      bg-gray-200
                      border-2
                      border-white
                    "
                    />
                  ))}
                </div>

                {/* DETAILS */}
                <div className="space-y-4">

                  <div className="flex items-center justify-between">
                    <div className="h-4 w-20 rounded bg-gray-100" />
                    <div className="h-4 w-16 rounded bg-gray-200" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="h-4 w-32 rounded bg-gray-100" />
                    <div className="h-4 w-10 rounded bg-gray-200" />
                  </div>

                </div>

              </div>
            ))}

          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="p-6 space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Invitations Management
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Select a project to manage engineer invitations
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              onClick={() =>
                router.push(`/admin/invitations-management/${project.id}`)
              }
              className="cursor-pointer hover:shadow-lg transition-all border-[var(--border)]"
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">
                  {project.title}
                </CardTitle>

                {/* <Badge variant="secondary">
                  {project.status.replaceAll("_", " ")}
                </Badge> */}
                <StatusBadge status={project.status} />
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Engineers Preview */}
                <div className="flex -space-x-2">
                  {project.engineers.slice(0, 3).map((eng: any, i: number) => (
                    <Avatar key={i} >
                      {eng.user.image ? (
                        <AvatarImage src={eng.user.image} className="border bg-blue-200" />
                      ) : (
                        <AvatarFallback className="border border-[#FCD9B6] bg-gradient-to-r from-[#FFAE58] via-[#FFBE73] to-[#FFD8A8] text-gray-800">
                          {eng.user.name?.[0]}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  ))}

                  {project.engineers.length > 3 && (
                    <div className="text-xs bg-muted px-2 py-1 rounded-full">
                      +{project.engineers.length - 3}
                    </div>
                  )}
                </div>

                {/* Budget */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Budget</span>
                  <span className="font-medium">
                    ₹{project.budget}
                  </span>
                </div>

                {/* Invitations */}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Invitations Sent
                  </span>
                  <span className="font-medium">
                    {project.invitationsCount}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}