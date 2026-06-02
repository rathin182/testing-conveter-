"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Users, Clock, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Project, User, STATUS_META, ProjectCard } from "@/components/project/ProjectUI"; 
import { CreateProjectModal } from "@/components/project/CreateProjectModal"; 

export default function ClientProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const { user } = useAuth() as { user: User };

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
    if (!user) return;
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search: debouncedSearch,
        status: statusFilter,
        page: page.toString(),
        limit: "15"
      }).toString();

      const res = await fetch(`/api/client/projects?${query}`);
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
  }, [debouncedSearch, statusFilter, page, user]);

  return (
    <>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold  text-[var(--text-primary)]">
              My Projects
            </h1>
            <p className="text-xs  text-[var(--text-muted)] mt-0.5">
              Manage your projects and track progress
            </p>
          </div>
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 text-white rounded-lg flex items-center gap-2  text-sm font-semibold hover:bg-[#e89b45] transition-colors" style={{ background: "var(--primary)" }}>
            <Plus size={15} /> New Project
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total", value: stats.total, icon: <Users size={16} />, color: "text-[var(--text-primary)]" },
            { label: "Active", value: stats.active, icon: <Clock size={16} />, color: "text-green-600" },
            { label: "Completed", value: stats.completed, icon: <CheckCircle size={16} />, color: "text-blue-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-[var(--border)] rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className={`${s.color}`}>{s.icon}</div>
              <div>
                <p className={`text-xl font-bold  ${s.color}`}>{s.value}</p>
                <p className="text-[10px]  text-[var(--text-muted)]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Responsive Search & Filters */}
        <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-[var(--border)] shadow-sm">
          <div className="relative w-full md:w-64 shrink-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[var(--border)] rounded-lg text-sm  bg-gray-50 text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
          <div className="relative w-full md:w-auto shrink-0">
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-auto pl-8 pr-8 py-2 border border-[var(--border)] rounded-lg text-sm  bg-gray-50 text-[var(--text-primary)] outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-[var(--primary)]"
            >
              <option value="ALL">All Status</option>
              {Object.entries(STATUS_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <span className="text-xs  text-[var(--text-muted)] px-2 font-medium w-full md:w-auto text-center md:text-left mt-1 md:mt-0">
            {totalItems} results found
          </span>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-[var(--primary)]" size={36} />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-[var(--border)] rounded-xl">
            <XCircle size={40} className="text-[var(--border)] mb-3" />
            <p className="text-sm  font-semibold text-[var(--text-primary)]">No projects found</p>
            <p className="text-xs  text-[var(--text-muted)] mt-1">
              {search === "" && statusFilter === "ALL" ? "Create your first project to get started." : "Try adjusting your search or filter."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
                <span className="text-sm text-[var(--text-muted)] ">
                  Page <span className="font-semibold text-[var(--text-primary)]">{page}</span> of {totalPages}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 py-1.5 border border-[var(--border)] rounded-lg text-sm  font-medium text-[var(--text-secondary)] bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 border border-[var(--border)] rounded-lg text-sm  font-medium text-[var(--text-secondary)] bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreated={fetchProjects} user={user} />}
    </>
  );
}