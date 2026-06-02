"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, User, Clock, LucideTrash, LucideLoader } from "lucide-react";
// import { htmlToText } from "../common/editor/htmlToText";
import toast from "react-hot-toast";

export default function WorkDoneTab({ projectId }: any) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState("")
  useEffect(() => {
    fetchCompletedTasks();
    checkUserRole();
  }, [projectId]);

  const fetchCompletedTasks = async () => {
    try {
      const res = await fetch(`/api/project/work-done?projectId=${projectId}`);
      const data = await res.json();
      if (data) {
        setTasks(data.response);
      }
    } catch (err) {
      console.error("Error fetching work done:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkUserRole = async () => {
    try {
      const response = localStorage.getItem("user");
      // const response = await fetch('/api/user');
      // const data = await response.json();
      const data = response ? JSON.parse(response) : null;
      // if (data.user && data.user.role === 'ADMIN') {
      //   setIsAdmin(true);
      // }
      if (data && data.role.name === 'ADMIN') {
        setIsAdmin(true);
      }
      // setUserId(data.user.id)
      setUserId(data.id)
    } catch (error) {
      console.error('Failed to check user role:', error);
    }
  };

  async function handleDelete(id: string) {
    try {
      const req = await fetch(`/api/project/work-done?id=${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      })
      if (req.status === 200) {
        toast.success("Task Deleted.")
        fetchCompletedTasks();
      }
    }
    catch (err) {
      toast.error("Something went wrong!")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LucideLoader className='animate-spin' style={{ color: 'var(--primary)' }} size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold " style={{ color: 'var(--text-primary)' }}>Work Done Tracking</h2>
      <p className="text-sm  mb-4" style={{ color: 'var(--text-muted)' }}>View all tasks completed by team members.</p>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-600" size={24} />
            <div>
              <p className="text-2xl font-bold  text-green-700">{tasks.length}</p>
              <p className="text-sm  text-green-600">Completed Tasks</p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4" style={{ background: 'var(--primary-light)', borderColor: '#ffd9a8' }}>
          <div className="flex items-center gap-3">
            <User size={24} style={{ color: 'var(--primary)' }} />
            <div>
              <p className="text-2xl font-bold " style={{ color: 'var(--text-primary)' }}>
                {/* {new Set(tasks.map(t => t.assignee)).size} */}
                {tasks.filter((items) => items.completedBy.id === userId).length}
              </p>
              <p className="text-sm " style={{ color: 'var(--primary)' }}>My Contributions</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-[var(--border)] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Clock size={24} style={{ color: 'var(--text-secondary)' }} />
            <div>
              <p className="text-2xl font-bold " style={{ color: 'var(--text-primary)' }}>
                {tasks.filter(t => {
                  const completedDate = new Date(t.updatedAt);
                  const today = new Date();
                  return completedDate.toDateString() === today.toDateString();
                }).length}
              </p>
              <p className="text-sm " style={{ color: 'var(--text-secondary)' }}>Completed Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Inventory */}
      <div className="bg-white rounded-lg border border-[var(--border)]">
        <div className="p-6 border-b border-[var(--border)]">
          <h3 className="text-lg font-semibold " style={{ color: 'var(--text-primary)' }}>Complete Inventory of Finished Tasks</h3>
          <p className="text-sm  mt-1" style={{ color: 'var(--text-muted)' }}>All tasks completed with assignee information</p>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 mb-4" style={{ color: 'var(--border)' }} />
            <h3 className="text-lg font-semibold  mb-2" style={{ color: 'var(--text-primary)' }}>No completed tasks yet</h3>
            <p className="text-sm " style={{ color: 'var(--text-muted)' }}>Completed tasks will appear here with assignee details</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {tasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-[var(--bg)] transition-colors relative">
                {
                  isAdmin && (
                    <div onClick={() => handleDelete(task.id)} className="absolute w-6 h-6 right-4 bottom-4 text-red-400">
                      <LucideTrash size={16} />
                    </div>
                  )
                }
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="text-green-500 mt-1" size={20} />
                      <div className="flex-1">

                        <h4 className="text-lg font-semibold " style={{ color: 'var(--text-primary)' }}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                            {/* {htmlToText(task.description)} */}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-sm  rounded-lg w-fit leading-none mb-2" style={{ color: 'var(--primary)' }}>Completed By</h3>
                      <div className="flex gap-1 justify-start items-center">
                        <div className="w-6 h-6 overflow-hidden rounded-full flex justify-center items-center border" style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderColor: '#ffd9a8' }}>
                          {
                            task.completedBy.image ? (
                              <img
                                src={task.completedBy.image}
                                alt="Avatar"
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <p>{task.completedBy.name ? task.completedBy.name?.charAt(0) : "A"}</p>
                            )
                          }
                        </div>
                        <div className="">
                          <h3 className="font-medium text-base leading-none">{task.completedBy.name}</h3>
                          <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>{task.completedBy.department}</p>
                        </div>
                      </div>

                    </div>

                    {task.tags && task.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {task.tags.map((tag: string, tagIndex: number) => (
                          <span key={tagIndex} className="px-2 py-1 bg-[var(--bg)] text-xs rounded border border-[var(--border)] " style={{ color: 'var(--text-secondary)' }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-right ml-4">
                    {task.priority && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${task.priority === 'high' ? 'bg-red-400/20 text-red-400' :
                          task.priority === 'medium' ? 'bg-yellow-400/20 text-yellow-400' :
                            'bg-green-400/20 text-green-400'
                        }`}>
                        {task.priority.toUpperCase()}
                      </span>
                    )}
                    <div className="mt-2 text-sm " style={{ color: 'var(--text-muted)' }}>
                      <Clock size={14} className="inline mr-1" />
                      Due Date | Completed on
                    </div>
                    <div className="text-sm  mt-0.5" style={{ color: 'var(--text-primary)' }}>
                      {new Date(task.dueDate).toDateString()} | <span
                        className={`${new Date(task.updatedAt).toLocaleDateString() < new Date(task.dueDate).toLocaleDateString() ? "text-red-500" : "text-green-600"}`}
                      >{new Date(task.updatedAt).toDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
