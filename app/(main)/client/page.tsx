'use client';

import { useState, useEffect, Suspense } from 'react';
import { Loader, AlertCircle, Filter, Search, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ClientOverview from '@/components/clients/analytics/ClientOverview';
import DesignOverview from '@/components/clients/analytics/DesignOverview';
import LatestUpdates from '@/components/clients/analytics/LatestUpdates';
import RiskBlockage from '@/components/clients/analytics/RiskBlockage';
import Milestones from '@/components/clients/analytics/Milestones';
import BudgetAndDocs from '@/components/clients/analytics/BudgetAndDocs';
import DesignPreviewSection from '@/components/clients/analytics/DesignPreviewSection';

interface Project {
  id: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  basicDetails: string;
  progress: number;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const PRIORITY_COLOR: Record<string, string> = {
  HIGH:   'bg-red-500/20 text-red-500 border-red-200 dark:border-red-800',
  MEDIUM: 'bg-yellow-500/20 text-yellow-500 border-yellow-200 dark:border-yellow-800',
  LOW:    'bg-green-500/20 text-green-500 border-green-200 dark:border-green-800',
};

const ClientAnalyticsDashboard = () => {
  const { user } = useAuth() as { user: User };

  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [projectAnalytics, setProjectAnalytics] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [showProjects, setShowProjects] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    
    // Call the single master endpoint
    const url = projectId && !showProjects 
      ? `/api/client/analytics?projectId=${projectId}` 
      : `/api/client/analytics?search=${debouncedSearch}`;

    fetch(url)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          if (projectId && !showProjects) {
            
            setProjectAnalytics(res.data);
          } else {
            setProjectsList(res.projects || []);
            const urlId = new URLSearchParams(window.location.search).get('projectId');
            if (urlId && res.projects?.some((p: any) => p.id === urlId)) {
                setProjectId(urlId);
                setShowProjects(false);
            }
          }
        } else {
            setError(res.message || "Failed to load");
        }
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to fetch');
        setShowProjects(true);
      }) 
      .finally(() => setLoading(false));
  }, [debouncedSearch, projectId, showProjects, user?.id]);

  const filteredProjects = projectsList.filter(p => {
    const matchSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPriority = priorityFilter === 'ALL' || p.priority === priorityFilter;
    return matchSearch && matchPriority;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader className="animate-spin text-[var(--primary)] mx-auto mb-4" size={40} />
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Try Again
        </button>
      </div>
    </div>
  );

  // Projects List
  if (!projectId || showProjects) return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Projects</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Select a project to view analytics</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text" placeholder="Search projects..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="relative">
            <Filter size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <select
              value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white appearance-none cursor-pointer"
            >
              <option value="ALL">All Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Projects</h3>
          <p className="text-gray-600 dark:text-gray-400">No projects match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <div
              key={project.id}
              onClick={() => { setProjectId(project.id); setShowProjects(false); window.history.pushState({}, '', `?projectId=${project.id}`); }}
              className="group cursor-pointer relative bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 group-hover:border-blue-300 dark:group-hover:border-blue-600"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 flex-1">
                  {project.title}
                </h3>
                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border whitespace-nowrap ${PRIORITY_COLOR[project.priority] ?? 'bg-gray-100/20 text-gray-500 border-gray-200'}`}>
                  {project.priority}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">{project.description || 'No summary available'}</p>
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
                <Calendar size={16} />
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span className="font-semibold">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Detailed Project Analytics
  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{projectAnalytics?.overview?.name || 'Project Analytics'}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Analytics dashboard for your project</p>
        </div>
        <button onClick={() => { setShowProjects(true); window.history.pushState({}, '', window.location.pathname); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
          Switch Project
        </button>
      </div>

      <ClientOverview data={projectAnalytics?.overview} />
      <DesignOverview  />
{/* data={projectAnalytics?.design} */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LatestUpdates  />
          {/* updates={projectAnalytics?.updates} */}
        </div>
        <div className="lg:col-span-1 space-y-3">
          <RiskBlockage tickets={projectAnalytics?.tickets} />
          <Milestones milestones={projectAnalytics?.milestones} />
        </div>
      </div>

      <BudgetAndDocs data={projectAnalytics?.budget} />
      <DesignPreviewSection data={projectAnalytics?.preview} />
    </div>
  );
};

const ClientPage = () => (
  <Suspense fallback={
    <div className="min-h-screen flex items-center justify-center">
      <Loader className="animate-spin text-blue-500" size={40} />
    </div>
  }>
    <ClientAnalyticsDashboard />
  </Suspense>
);

export default ClientPage;