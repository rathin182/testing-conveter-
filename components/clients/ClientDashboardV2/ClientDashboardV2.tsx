"use client";

import {
  FileText,
  Calendar,
  User,
  FolderKanban,
  BarChart,
  Clock,
  ClipboardList,
  Plus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

/* -------------------------
   ProgressGauge (local)
--------------------------*/
const ProgressGauge = ({ progress = 0 }: { progress?: number }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-32 h-32 -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={radius}
          strokeWidth="8"
          className="text-gray-200 dark:text-gray-700"
          stroke="currentColor"
          fill="transparent"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          strokeWidth="8"
          className="text-blue-600 transition-all duration-500"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold">{progress}%</span>
      </div>
    </div>
  );
};

/* ------------------------------------------
   ClientDashboardV2
   - Accepts `user` returned by your backend:
     { id, name, ..., projectMembers: [{ project: { ... }}, ...] }
------------------------------------------- */
export default function ClientDashboardV2({ user }: { user: any }) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [newUpdate, setNewUpdate] = useState("");

  // Build projects array from user.projectMembers safely (memoize)
  const projects = useMemo(() => {
    if (!user?.projectMembers) return [];

    return user.projectMembers.map((pm: any) => {
      const p = pm.project || {};
      const info = p.projectInfo || null;

      return {
        id: p.id,
        name: p.name || "Untitled",
        summary: p.summary || "",
        progress: typeof p.progress === "number" ? p.progress : 0,
        // dashboard-specific pieces (safe defaults)
        dashboardData: {
          projectProgress: typeof p.progress === "number" ? p.progress : 0,
          latestUpdates: Array.isArray(p.latestUpdates) ? p.latestUpdates : [],
          workDone: Array.isArray(p.workDone) ? p.workDone : [],
          documents: Array.isArray(p.documents) ? p.documents : [],
          projectInfo: {
            projectName: info?.projectName ?? p.name ?? "Untitled",
            clientName: info?.clientName ?? "Not provided",
            budget: info?.budget ?? "N/A",
            type: info?.projectType ?? "N/A",
            startDate: info?.startDate ? new Date(info.startDate).toDateString() : "N/A",
            deadline: info?.deadline ? new Date(info.deadline).toDateString() : "N/A",
          },
        },
      };
    });
  }, [user]);

  // Selected project state
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  // initialize selectedProject when projects array is available/changes
  useEffect(() => {
    if (projects.length > 0) setSelectedProject(projects[0]);
    else setSelectedProject(null);
  }, [projects]);

  // fetch role (optional) — keeps same logic you had
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data.user?.role) {
          setUserRole(data.user.role.name);
        }
      })
      .catch(() => {
        setUserRole(null);
      });
  }, []);

  // Add update (uses selectedProject.id)
  const handleAddUpdate = async () => {
    if (!newUpdate.trim() || !selectedProject) return;
    try {
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();

      const res = await fetch("/api/latest-updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newUpdate,
          projectId: selectedProject.id,
          createdBy: userData.user?.name || "Admin",
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setSelectedProject((prev: any) => {
          if (!prev) return prev;
          const prevDashboard = prev.dashboardData || {};
          return {
            ...prev,
            dashboardData: {
              ...prevDashboard,
              latestUpdates: [(result.update || {}), ...(prevDashboard.latestUpdates || [])].slice(0, 3),
            },
          };
        });
        setNewUpdate("");
        setShowAddUpdate(false);
      } else {
        console.error("Add update failed", await res.text());
      }
    } catch (err) {
      console.error("Failed to add update:", err);
    }
  };

  if (!selectedProject) return <div className="p-6">No Projects Found</div>;

  const dashboard = selectedProject.dashboardData || {
    projectProgress: 0,
    latestUpdates: [],
    workDone: [],
    documents: [],
    projectInfo: {},
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard Overview
        </h1>

        {projects.length > 1 && (
          <select
            value={selectedProject.id}
            onChange={(e) => {
              const proj = projects.find((p: any) => p.id === e.target.value);
              if (proj) setSelectedProject(proj);
            }}
            className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white"
          >
            {projects.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <DashboardCard
          title="Project Progress"
          value={`${dashboard.projectProgress}%`}
          icon={<BarChart className="w-6 h-6" />}
          color="from-blue-500 to-blue-700"
        />

        <DashboardCard
          title="Client Name"
          value={dashboard.projectInfo.clientName}
          icon={<User className="w-6 h-6" />}
          color="from-indigo-500 to-indigo-700"
        />

        <DashboardCard
          title="Project Type"
          value={dashboard.projectInfo.type}
          icon={<FolderKanban className="w-6 h-6" />}
          color="from-emerald-500 to-emerald-700"
        />

        <DashboardCard
          title="Budget"
          value={dashboard.projectInfo.budget}
          icon={<FileText className="w-6 h-6" />}
          color="from-rose-500 to-rose-700"
        />
      </div>

      {/* Progress Section */}
      <section className="bg-white dark:bg-gray-900 dark:border shadow rounded-xl p-6">
        <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-4">
          Project Progress
        </h2>

        <div className="flex items-center gap-6">
          <ProgressGauge progress={dashboard.projectProgress} />

          <p className="text-gray-700 dark:text-gray-300">
            Your project is making steady progress! Keep checking for updates.
          </p>
        </div>
      </section>

      {/* Latest Updates + Work Done */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Latest Updates */}
        <CardBox title="">
         <div className="flex justify-between items-center mb-4">
  {/* Left title */}
  <h1 className="text-lg font-semibold">Latest Updates</h1>

  {/* Right button or input */}
  {userRole === "ADMIN" && (
    <div className="flex items-center gap-3">
      {!showAddUpdate ? (
        <button
          onClick={() => setShowAddUpdate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newUpdate}
            onChange={(e) => setNewUpdate(e.target.value)}
            placeholder="Enter update title..."
            className="p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
          />
          <button
            onClick={handleAddUpdate}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Save
          </button>
          <button
            onClick={() => { setShowAddUpdate(false); setNewUpdate(""); }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )}
</div>

          <div>
            <ul className="space-y-4">
            {dashboard.latestUpdates.slice(0, 3).map((update: any) => (
              <li key={update.id} className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                <p className="font-medium text-gray-800 dark:text-gray-100">{update.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{update.date}</p>
              </li>
            ))}
          </ul>
          </div>
        </CardBox>

        {/* Work Done */}
        <CardBox title="Work Completed">
          <ul className="space-y-4">
            {dashboard.workDone.map((work: any) => (
              <li key={work.id} className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                <p className="font-medium text-gray-800 dark:text-gray-100">{work.task}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{work.completedOn}</p>
              </li>
            ))}
          </ul>
        </CardBox>
      </div>

      {/* Project Information */}
      <CardBox title="Project Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem label="Project Name" value={selectedProject.name || dashboard.projectInfo.projectName} icon={<FolderKanban />} />
          <InfoItem label="Budget" value={dashboard.projectInfo.budget} icon={<BarChart />} />
          <InfoItem label="Client Name" value={dashboard.projectInfo.clientName} icon={<User />} />
          <InfoItem label="Type" value={dashboard.projectInfo.type} icon={<FileText />} />
          <InfoItem label="Start Date" value={dashboard.projectInfo.startDate} icon={<Calendar />} />
          <InfoItem label="Deadline" value={dashboard.projectInfo.deadline} icon={<Clock />} />
        </div>
      </CardBox>
    </div>
  );
}

/* -------------------------
   Reusable small components
--------------------------*/
const DashboardCard = ({ title, value, icon, color }: any) => (
  <div className={`p-5 rounded-xl shadow bg-gradient-to-br ${color} text-white`}>
    <div className="flex justify-between items-center mb-1">
      <p className="text-sm opacity-80">{title}</p>
      {icon}
    </div>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const CardBox = ({ title, children }: any) => (
  <div className="bg-white dark:bg-gray-900 shadow rounded-xl p-6">
    <h2 className="font-semibold text-lg mb-4">{title}</h2>
    {children}
  </div>
);

const InfoItem = ({ label, value, icon }: any) => (
  <div className="flex gap-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
    <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  </div>
);
