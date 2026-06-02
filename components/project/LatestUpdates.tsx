"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle, Hourglass, Timer, LucideLoader } from "lucide-react";

export default function LatestUpdates({ projectId }: { projectId: string }) {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetchLatestUpdates();
    }
  }, [projectId]);

  const fetchLatestUpdates = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const res = await fetch(`/api/kanban?projectId=${projectId}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!res.ok) {
        console.error('Failed to fetch tasks');
      }
      
      const data = await res.json();

      if (data.tasks && Array.isArray(data.tasks)) {
        const recentTasks = (data.tasks as any[])
          .filter(task => task.updatedAt)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 10);

        setUpdates(recentTasks);
      } else {
        setUpdates([]);
      }
    } catch (err) {
      console.error("Error fetching updates:", err);
      setUpdates([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusMeta = (status?: string) => {
    const s = (status || "").trim().toLowerCase();

    if (s === "completed")
      return { color: "text-green-600", icon: <CheckCircle size={18} /> };

    if (s === "working")
      return { color: "text-blue-600", icon: <Timer size={18} /> };

    if (s === "pending" || s === "in-progress")
      return { color: "text-yellow-600", icon: <Hourglass size={18} /> };

    return { color: "text-gray-600", icon: <Clock size={18} /> };
  };
 
  if (loading) {
    return (
      <div className="w-full h-[50vh] flex justify-center items-center">
        <LucideLoader className='animate-spin text-blue-300' size={40} />
         <p className="p-4 animate-pulse text-gray-500">Loading updates...</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-5 rounded-xl text-black! dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 dark:text-white text-black!">Latest Updates</h3>

      {updates.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
      ) : (
        <ul className="space-y-4">
          {updates.map((task: any) => {
            const m = getStatusMeta(task.status);

            return (
              <li key={task.id} className="flex items-start gap-3">
                <div className={`${m.color}`}>{m.icon}</div>

                <div>
                  <p className="text-gray-900 text-black! dark:text-white font-medium">
                    {task.title}
                  </p>

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {task.assignee}
                    {task.status === "completed" && "Completed"}
                    {task.status === "working" && "Working"}
                    {task.status === "pending" && "Pending"}
                  </p>

                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Clock size={12} />{" "}
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
