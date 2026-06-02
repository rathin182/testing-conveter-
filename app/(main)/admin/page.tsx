"use client";

import { Eye, ReceiptText, Activity, Download, Briefcase, Users, CheckCircle, Clock } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import ProjectDistribution from "@/components/dashboard/ProjectDistribution";
import RevenueChart from "@/components/dashboard/RevenueChart";
import DashboardShell from "@/components/layout/DashboardShell";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Loader2 } from "lucide-react";
import TicketIssuesCard from "@/components/dashboard/TicketIssuesCard";
import ProjectCollaborationCard from "@/components/dashboard/ProjectCollaborationCard";

export default function DashboardPage() {
  const { data, isLoading } = useSWR("/api/admin/dashboard", fetcher);
  const { data: projectTicketsData, isLoading: ticketsLoading, } = useSWR("/api/admin/project-tickets", fetcher);
  const { data: projectsData, isLoading: projectsLoading, } = useSWR("/api/admin/project/all-projects", fetcher);
  // console.log(projectsData?.projects, "projectsData");

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="animate-spin" color="#FFAE58" size={32} />
        </div>
      </DashboardShell>
    );
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  
  return (
    <DashboardShell>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 ">
          <button className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] bg-white px-4 py-2 border border-[var(--border)] rounded-lg">
            <Download size={13} /> EXPORT
          </button>
        </div>
      </div>

      {/* 6 Stat Cards */}
      {/* <div className="flex gap-4 mb-6">
        <StatCard title="Total Projects" value={stats.totalProjects?.toString()} icon={<Briefcase size={16} />} />
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue?.toLocaleString()}`} icon={<ReceiptText size={16} />} />
        <StatCard title="Total Clients" value={stats.totalClients?.toString()} icon={<Users size={16} />} />
        
        <StatCard title="Ongoing Projects" value={stats.ongoingProjects?.toString()} icon={<Activity size={16} />} />
        <StatCard title="Completed Projects" value={stats.completedProjects?.toString()} icon={<CheckCircle size={16} />} />
        <StatCard title="Pending Revenue" value={`₹${stats.pendingRevenue?.toLocaleString()}`} icon={<Clock size={16} />} />
      </div> */}

      <div className="flex flex-col">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-3">
          <StatCard
            title="Total Projects"
            value={stats.totalProjects?.toString()}
            highlighted
            change="5%"
            changeType="up"
          />

          <StatCard
            title="Ended Projects"
            value={stats.completedProjects?.toString()}
            change="6%"
            changeType="up"
          />

          <StatCard
            title="Running Projects"
            value={stats.ongoingProjects?.toString()}
            change="2%"
            changeType="up"
          />

          <StatCard
            title="Total Clients"
            value={stats.totalClients?.toString()}
            subtitle="On Discuss"
          />
        </div>

        {/* Charts */}
        <div className="flex flex-col xl:flex-row py-2 pr-2 gap-3">

          {/* LEFT SIDE */}

          <div className="w-full xl:w-[75%] flex flex-col gap-3">

            {/* TOP SECTION */}

            <div
              className="flex flex-col lg:flex-row gap-3 h-auto xl:h-[46vh]">

              {/* REVENUE CHART */}

              <div className="w-full min-h-90">

                <RevenueChart
                  data={charts.revenue}
                  totalRevenue={stats.totalRevenue}
                />

              </div>

              {/* RIGHT CARD */}

              {/* <div
                className="bg-white w-full lg:w-[36%] rounded-2xl min-h-[320px] flex items-center justify-center border border-[#ECECEC]">
                <p className="font-bold text-2xl">
                  hello
                </p>
              </div> */}

            </div>

            {/* BOTTOM SECTION */}

            <div
              className="flex flex-col lg:flex-row gap-3 h-auto xl:h-[55vh]">

              {/* PROJECT CARD */}

              <div
                className="bg-white w-full lg:w-[59%] rounded-2xl overflow-hidden border border-[#ECECEC]">
                <ProjectCollaborationCard
                  projects={projectsData?.projects || []}
                />
              </div>

              {/* DISTRIBUTION */}

              <div
                className="bg-white w-full lg:w-[41%] rounded-2xl overflow-hidden border border-[#ECECEC]">
                <ProjectDistribution
                  data={charts.projectDistribution}
                />
              </div>

            </div>

          </div>

          {/* RIGHT SIDE */}

          <div
            className="w-full xl:w-[25%] min-h-[400px] xl:h-screen rounded-2xl overflow-hidden">

            <TicketIssuesCard
              projects={projectTicketsData?.data || []}
            />

          </div>

        </div>
      </div>
    </DashboardShell>
  );
}