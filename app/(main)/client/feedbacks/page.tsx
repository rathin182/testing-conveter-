"use client";

import { use, useEffect, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

export default function FeedbacksPage() {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [newFeedback, setNewFeedback] = useState("");
    const [feedbackType, setFeedbackType] = useState("");
    const [user, setUser] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProject, setSelectedProject] = useState("");

    const [loading, setLoading] = useState(false);

    const feedbackTypeConfig: Record<
        string,
        { label: string; className: string }
    > = {
        project: {
            label: "Project",
            className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        },
        general: {
            label: "General",
            className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        },
        admin: {
            label: "Admin",
            className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
        },
        developer: {
            label: "Developer",
            className:
                "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
        },
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('/api/feedbacks/clientfeedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    type: feedbackType,
                    message: newFeedback,
                    byName: user?.name,
                    userId: user?.id,
                    project: selectedProject,
                })
            });
            if (response.ok) {
                toast.success('Feedback submitted successfully!');
                setFeedbackType('');
                setNewFeedback('');
                await fetchAllFeedbacks();
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to submit feedback');
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast.error('Error submitting feedback');
        } finally {
            setLoading(false);
        }
    };
    const fetchAllFeedbacks = async () => {
        try {
            const response = await fetch(`/api/feedbacks/clientfeedback?userId=${user?.id}`);

            if (response.ok) {
                const data = await response.json();
                setFeedbacks(data.feedbacks || []);
            }
        } catch (error) {
            console.error('Failed to fetch feedbacks:', error);
        }
    };

    const fetchUser = async () => {
        const res = localStorage.getItem("user");
        // const res = await fetch("/api/user");
        const data = res ? JSON.parse(res) : null;

        if (data) {
            setUser(data);
        }
    };

    const fetchProject = async () => {
        const res = await fetch(`/api/feedbacks/clientprojectfetch?userId=${user?.id}`);
        const data = await res.json();
        setProjects(data.projects || []);
    };


    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (user) {
            fetchAllFeedbacks();
            fetchProject();
        }
    }, [user]);

    return (
        <div className="space-y-8">
            <Toaster position="top-right" />
            {/* Title */}
            <div>
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
                    Feedbacks
                </h1>
                <p className="text-gray-600 dark:text-gray-400 ">
                    View and submit feedback related to your project.
                </p>
            </div>

            {/* Submit Feedback */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" /> Submit New Feedback
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Feedback Type */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1.5">
                            Feedback Type
                        </label>

                        <div className="relative">
                            <select
                                value={feedbackType}
                                onChange={(e) => setFeedbackType(e.target.value)}
                                className="
                                    w-full appearance-none rounded-xl px-4 py-2.5
                                    bg-white dark:bg-gray-900
                                    border border-gray-300 dark:border-gray-700
                                    text-gray-900 dark:text-gray-100
                                    transition-all duration-200
                                    shadow-sm
      "
                            >
                                <option value="select">select</option>
                                <option value="project">Project Feedback</option>
                                <option value="general">General Feedback</option>
                                {/* <option value="admin">Admin Feedback</option>
                                <option value="developer">Developer Feedback</option> */}
                            </select>

                            {/* Custom dropdown arrow */}
                            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                <svg
                                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </span>
                        </div>
                    </div>

                    {/* Project dropdown */}

                    {feedbackType === "project" && (
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-700 dark:text-gray-300 mb-1.5">
                                Project
                            </label>

                            <div className="relative">
                                <select
                                    value={selectedProject}
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                    className="
                                        w-full appearance-none rounded-xl px-4 py-2.5
                                      bg-white dark:bg-gray-900
                                        border border-gray-300 dark:border-gray-700
                                      text-gray-900 dark:text-gray-100
                                        transition-all duration-200
                                        shadow-sm
                                        "
                                >
                                    <option value="">Select Project</option>

                                    {projects.map((proj) => (
                                        <option key={proj.id} value={proj.project.name}>
                                            {proj.project.name}
                                        </option>
                                    ))}
                                </select>

                                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                    <svg
                                        className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Feedback Message */}
                    <div>
                        <label className="text-sm text-gray-700 dark:text-gray-300">
                            Message
                        </label>
                        <textarea
                            value={newFeedback}
                            onChange={(e) => setNewFeedback(e.target.value)}
                            placeholder="Write your feedback..."
                            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white p-3 h-28 resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-xl transition-all"
                    >
                        <Send className="w-4 h-4" />
                        {loading ? 'Subbmitting...' : 'Submit Feedback'}
                    </button>
                </form>
            </div>

            {/* Feedback List */}
            <div className="space-y-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Shared Feedbacks
                </h1>
                {feedbacks.map((fb) => (
                    <div
                        key={fb.id}
                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-2">
                            {/* Badge */}
                            {/* <span
                                className={`text-xs px-3 py-1 rounded-full font-medium ${fb.type === "project"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                    : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                    }`}
                            >
                                {fb.type === "project" ? "Project Feedback" : "General Feedback"}
                            </span> */}
                            <span
                                className={`text-xs px-3 py-1 rounded-full font-medium ${feedbackTypeConfig[fb.type]?.className ??
                                    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                    }`}
                            >
                                {feedbackTypeConfig[fb.type]?.label ?? fb.type}
                            </span>

                            <p className="text-sm text-gray-500 dark:text-gray-400">{fb.date}</p>
                        </div>

                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                            {fb.message}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
