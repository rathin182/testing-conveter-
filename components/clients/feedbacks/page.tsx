"use client";

import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";


export default function FeedbacksPage() {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [newFeedback, setNewFeedback] = useState<string>("");
    const [feedbackType, setFeedbackType] = useState<string>("project");

    const handleSubmit = (e: any) => {
        e.preventDefault();
        if (!newFeedback.trim()) return;

        const newEntry = {
            id: feedbacks.length + 1,
            type: feedbackType,
            message: newFeedback,
            date: new Date().toISOString().split("T")[0],
        };

        setFeedbacks([newEntry, ...feedbacks]);
        setNewFeedback("");
    };

    return (
        <div className="space-y-8">
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
                                <option value="project">Project Feedback</option>
                                <option value="normal">General Feedback</option>
                                <option value="admin">Admin Feedback</option>
                                <option value="developer">Developer Feedback</option>
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
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all"
                    >
                        <Send className="w-4 h-4" />
                        Submit Feedback
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
                            <span
                                className={`text-xs px-3 py-1 rounded-full font-medium ${fb.type === "project"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                    : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                    }`}
                            >
                                {fb.type === "project" ? "Project Feedback" : "General Feedback"}
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
