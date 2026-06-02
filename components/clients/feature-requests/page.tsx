"use client";
import React, { useState } from "react";
import { PlusCircle } from "lucide-react";

export default function FeatureRequestPage() {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [features, setFeatures] = useState<any[]>([]);

    const handleSubmit = (e: any) => {
        e.preventDefault();

        if (!title.trim() || !desc.trim()) return;

        const newFeature = {
            id: features.length + 1,
            title: title,
            description: desc,
            date: new Date().toISOString().split("T")[0],
            status:"pending"
        };

        setFeatures([newFeature, ...features]);
        setTitle("");
        setDesc("");
    };

    return (
        <div className="space-y-8">
            {/* Heading */}
            <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    Feature Requests
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Suggest improvements or new ideas you want in your project.
                </p>
            </div>

            {/* Add Feature Form */}
            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800"
            >
                <div className="grid gap-4">
                    {/* Title */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Feature Title
                        </label>
                        <input
                            type="text"
                            placeholder="Enter feature title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full mt-1 p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description
                        </label>
                        <textarea
                            placeholder="Explain the feature..."
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            rows={4}
                            className="w-full mt-1 p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition-all"
                    >
                        <PlusCircle strokeWidth={1.5} />
                        Submit Feature Request
                    </button>
                </div>
            </form>

            {/* Feature Requests List */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Your Requested Features
                </h2>

                {features.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">No requests yet.</p>
                ) : (
                    <div className="grid gap-4">
                        {features.map((f) => (
                            <div
                                key={f.id}
                                className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all"
                            >
                                {/* Title */}
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        {f.title}
                                    </h3>

                                    {/* 👉 Status Badge */}
                                    <StatusBadge status={f.status} />
                                </div>

                                {/* Description */}
                                {f.description && (
                                    <p className="mt-2 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                        {f.description}
                                    </p>
                                )}

                                {/* Date */}
                                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                                    Requested on {f.date}
                                </p>
                            </div>
                        ))}
                    </div>

                )}
            </div>
        </div>
    );
}

const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
        pending:
            "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
        approved:
            "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
        rejected:
            "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    };

    return (
        <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${colors[status]}`}
        >
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};
