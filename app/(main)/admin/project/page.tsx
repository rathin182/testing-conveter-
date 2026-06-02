"use client";

import DashboardShell from "@/components/layout/DashboardShell";
import { Search, Filter, Users, Calendar, Clock, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Project {
  id: string;
  title: string;
  description: string;
  budget?: number;
  earnings?: number;
  status: string;
  progress: number;
  instruments: string[];
  startDate?: string;
  endDate?: string;
  createdAt: string;
  advancePaid?: boolean;
  isFinalPaymentMade?: boolean;
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-600" },
  AWAITING_ADVANCE: { label: "Awaiting Advance", color: "bg-yellow-100 text-yellow-700" },
  SEARCHING: { label: "Searching Engineer", color: "bg-blue-100 text-blue-700" },
  IN_PROGRESS: { label: "In Progress", color: "bg-green-100 text-green-700" },
  IN_REVIEW: { label: "In Review", color: "bg-purple-100 text-purple-700" },
  AWAITING_FINAL_PAYMENT: { label: "Awaiting Final Payment", color: "bg-orange-100 text-orange-700" },
  COMPLETED: { label: "Completed", color: "bg-emerald-100 text-emerald-700" },
  CANCELED: { label: "Canceled", color: "bg-red-100 text-red-600" },
};

function StatusBadge({ status }: { status: string }) {
  if (status === "AWAITING_ADVANCE") return null;
  const meta = STATUS_META[status] ?? { label: status, color: "bg-gray-100 text-gray-600" };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.color}`}>
      {meta.label}
    </span>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const amount = project.budget;
  const amountLabel = "Budget";

  return (
    <Link href={`/admin/project/${project.id}`}>
      <div className="bg-white border border-[var(--border)] rounded-xl p-5 hover:shadow-md hover:border-[var(--primary)] transition-all cursor-pointer group">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-bold text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
            {project.title}
          </h3>
          <StatusBadge status={project.status} />
        </div>

        <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-4 leading-relaxed">
          {project.description}
        </p>

        {project.instruments?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.instruments.slice(0, 3).map((inst) => (
              <span key={inst} className="text-[10px] px-2 py-0.5 bg-[var(--primary-light)] text-[var(--primary)] border border-[#ffd9a8] rounded-full">
                {inst}
              </span>
            ))}
            {project.instruments.length > 3 && (
              <span className="text-[10px] text-[var(--text-muted)]">+{project.instruments.length - 3}</span>
            )}
          </div>
        )}

        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-[var(--text-muted)] mb-1">
            <span>Progress</span>
            <span className="font-semibold text-[var(--text-primary)]">{project.progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[var(--bg)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${project.progress}%`, background: "var(--primary)" }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
            <Calendar size={11} />
            {new Date(project.createdAt).toLocaleDateString()}
          </div>
          {amount !== undefined && (
            <span className="text-xs font-bold text-[var(--text-primary)]">
              {amountLabel}: ₹{amount.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });


  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search: debouncedSearch,
        status: statusFilter,
        page: page.toString(),
        limit: "15"
      }).toString();

      const res = await fetch(`/api/admin/project?${query}`);
      const data = await res.json();

      if (data.success) {
        setProjects(data.projects);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.total);
        setStats(data.globalStats);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [debouncedSearch, statusFilter, page]);

  return (
    <DashboardShell>
      <div className="space-y-6 pb-10">
        {/* Header */}
        

        {/* Global Stats */}
        {/* <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total", value: stats.total, icon: <Users size={16} />, color: "text-[var(--text-primary)]" },
            { label: "Active", value: stats.active, icon: <Clock size={16} />, color: "text-green-600" },
            { label: "Completed", value: stats.completed, icon: <CheckCircle size={16} />, color: "text-blue-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-[var(--border)] rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className={`${s.color}`}>{s.icon}</div>
              <div>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{s.label}</p>
              </div>
            </div>
          ))}
        </div> */}

        {/* Filters */}
        <div className="flex md:flex-row items-center justify-between gap-3 p-3 ">
          <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              All Projects
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Overview of all client projects
            </p>
          </div>
        </div>

          <div className="flex gap-3 items-center">

            {/* Search Bar */}
            <div className="relative w-full md:w-64 shrink-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[var(--border)] rounded-lg text-sm bg-gray-50 text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative w-full md:w-auto shrink-0">
              <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-auto pl-8 pr-8 py-2 border border-[var(--border)] rounded-lg text-sm bg-gray-50 text-[var(--text-primary)] outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-[var(--primary)]"
              >
                <option value="ALL">All Status</option>
                {Object.entries(STATUS_META).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            {/* Results text */}
            <span className="text-xs text-[var(--text-muted)] px-2 font-medium w-full md:w-auto text-center md:text-left mt-1 md:mt-0">
              {totalItems} results found
            </span>
          </div>

        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-[var(--primary)]" size={36} />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-xl border border-[var(--border)]">
            <XCircle size={40} className="text-[var(--border)] mb-3" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">No projects found</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
                <span className="text-sm text-[var(--text-muted)]">
                  Page <span className="font-semibold text-[var(--text-primary)]">{page}</span> of {totalPages}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 py-1.5 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text-secondary)] bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text-secondary)] bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}