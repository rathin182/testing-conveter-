"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

export default function ProjectProgress({data = [],}: {data: any[];}) {

    // =====================================
    // PERIOD
    // =====================================

    const [period, setPeriod] =useState<"month" | "year">("month");

    // =====================================
    // SAFE DATA
    // =====================================

    const safeData = Array.isArray(data)
        ? data
        : [];

    // =====================================
    // GRAPH DATA
    // =====================================

    const graphData = useMemo(() => {

        // =====================================
        // MONTH GRAPH
        // =====================================

        if (period === "month") {

            const months = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];

            return months.map((month, index) => {

                    // count projects
                    // created in month

                    const totalProjects =safeData.filter((project: any) => {
                                if (!project?.createdAt) {
                                    return false;
                                }

                                const date = new Date(project.createdAt);

                                return (date.getMonth() === index );
                            }).length;

                    const monthProjects = safeData.filter((project: any) => {
                                if (!project?.createdAt) {
                                    return false;
                                }

                                const date = new Date(project.createdAt);

                                return (date.getMonth() === index);
                            });

                    return {
                        label: month,
                        value: totalProjects,
                        projects: monthProjects,
                    };
                }
            );
        }

        // =====================================
        // YEAR GRAPH
        // =====================================

        const yearlyMap: Record<string,number> = {};

        safeData.forEach(
            (project: any) => {

                if (!project?.createdAt) {
                    return;
                }

                const year = new Date(
                    project.createdAt
                ).getFullYear();

                if (!yearlyMap[year]) {
                    yearlyMap[year] = 0;
                }

                yearlyMap[year] += 1;
            }
        );

        const yearlyProjectsMap: Record<string,any[]> = {};

        safeData.forEach((project: any) => {
            if (!project?.createdAt) {
                return;
            }

            const year = new Date(project.createdAt).getFullYear();

            if (!yearlyProjectsMap[year]) {
                yearlyProjectsMap[year] = [];
            }

            yearlyProjectsMap[year].push(project);
        });

        return Object.entries(yearlyProjectsMap).map(([year, projects]) => ({
            label: year,
            value: projects.length,
            projects,
        }));

    }, [safeData, period]);

    // =====================================
    // MAX VALUE
    // =====================================

    const maxValue = Math.max(
        ...graphData.map(
            (item) => item.value
        ),
        1
    );

    return (
        <div
            className="w-full h-90 rounded-[32px] border border-[#ECECEC] bg-white p-4 sm:p-5 overflow-hidden">

            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            <div className=" flex items-start justify-between gap-4">

                <div>
                    <h2 className=" text-[20px] font-semibold tracking-[-0.03em] text-[#171725]">
                        Project Activity
                    </h2>

                    <div className=" flex items-center gap-3 mt-3">

                        <div className=" w-9 h-9 rounded-xl bg-[#F5F7FB] flex items-center justify-center">
                            ↗
                        </div>

                        <div className=" flex items-center gap-2 flex-wrap">

                            <span className=" text-[#6BCB3D] font-semibold text-[20px]">
                                {safeData.length}
                            </span>

                            <span className=" text-[#8D8D8D] text-sm sm:text-base">
                                Total Projects
                            </span>

                        </div>

                    </div>

                </div>

                {/* ================================= */}
                {/* FILTER */}
                {/* ================================= */}

                <button
                    onClick={() =>
                        setPeriod((prev) =>
                            prev === "month"
                                ? "year"
                                : "month"
                        )
                    }
                    className="h-9 px-4 rounded-full border border-[#EAEAEA] flex items-center gap-2 text-sm font-medium text-[#666] shrink-0">

                    {period === "month"
                        ? "Monthly"
                        : "Yearly"}

                    <ChevronDown size={18} />

                </button>

            </div>

            {/* ================================= */}
            {/* GRAPH */}
            {/* ================================= */}

            <div
                className="relative mt-8 h-[210px] w-full">

                {/* ================================= */}
                {/* GRID */}
                {/* ================================= */}

                <div
                    className=" absolute inset-0 flex flex-col justify-between pb-6">

                    {[5, 4, 3, 2, 1].map(
                        (value) => (
                            <div
                                key={value}
                                className=" relative border-t border-[#ECECEC]">

                                <span
                                    className=" absolute -left-1 -top-3 text-[#9A9A9A] text-sm font-medium">
                                    {value}
                                </span>

                            </div>
                        )
                    )}

                </div>

                {/* ================================= */}
                {/* BARS */}
                {/* ================================= */}

                <div className=" relative z-10 h-full flex items-end justify-between gap-4 px-8 pb-6">

                    {graphData.map((item, index) => {

                        // =====================================
                        // BAR HEIGHT
                        // =====================================

                        const height = (item.value / maxValue) * 100;

                        // =====================================
                        // HIGHEST BAR
                        // =====================================

                        const highestValue = Math.max(...graphData.map((item) => item.value));

                        const isActive = item.value === highestValue && item.value > 0;

                        return (
                            <div
                                key={index}
                                className=" relative flex flex-col items-center justify-end h-full flex-1 group">

                                {/* TOOLTIP */}

                                {item.value > 0 && (
                                    <div
                                        className=" absolute bottom-[30%] left-1/2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 bg-[#1F2940] rounded-2xl w-[240px] max-w-[240px] p-4 text-white shadow-2xl z-[999] pointer-events-none">

                                        {/* HEADER */}

                                        <div className=" flex items-center justify-between gap-3 mb-3">

                                            <h4 className=" text-sm font-semibold">
                                                {item.value} Projects
                                            </h4>

                                            <span className=" text-[11px] text-[#BFC8D7]">
                                                {item.label}
                                            </span>

                                        </div>

                                        {/* PROJECTS */}

                                        <div className=" flex flex-col gap-2 max-h-[180px] overflow-hidden"
                                        >

                                            {item.projects?.map(
                                                (
                                                    project: any,
                                                    index: number
                                                ) => (

                                                    <div
                                                        key={index}
                                                        className=" bg-white/5 rounded-xl px-3 py-2 ">

                                                        <p className=" text-[12px] font-medium text-white truncate ">
                                                            {project.title}
                                                        </p>

                                                        <span className=" text-[10px] text-[#BFC8D7] mt-1 inline-block ">
                                                            {project.status
                                                                ?.replaceAll("_", " ")}
                                                        </span>

                                                    </div>
                                                )
                                            )}

                                        </div>

                                        {/* POINTER */}

                                        <div className=" absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 bg-[#1F2940] rotate-45 " />

                                    </div>
                                )}

                                {/* BAR */}

                                <div className=" w-[10px] sm:w-[14px] rounded-full transition-all duration-500"
                                    style={{
                                        height: `${height}%`,
                                        background: isActive
                                            ? "#FFAE58"
                                            : "#171725",
                                        minHeight:
                                            item.value > 0
                                                ? "14px"
                                                : "0px",
                                    }}
                                />

                                {/* LABEL */}

                                <span className=" absolute -bottom-6 text-sm font-medium text-[#8A8A8A]">
                                    {item.label}
                                </span>

                            </div>
                        );
                    }
                    )}

                </div>

            </div>

        </div>
    );
}