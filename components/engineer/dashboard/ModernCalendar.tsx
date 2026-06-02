"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

const days = ["S", "M", "T", "W", "T", "F", "S"];

interface Project {
  id: string;
  title: string;
  endDate: string;
  status: string;
  progress?: number;
  currentPhase?: string;
  priority?: string;
}

interface ModernCalendarProps {
  projects: Project[];
}

export default function ModernCalendar({
  projects = [],
}: ModernCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredProject, setHoveredProject] =
    useState<Project | null>(null);

  const month = currentDate.toLocaleString("default", {
    month: "long",
  });

  const year = currentDate.getFullYear();

  const getDaysInMonth = (date: Date) => {
    return new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      1
    ).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      )
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      )
    );
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const dates = [];

  for (let i = 0; i < firstDay; i++) {
    dates.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    dates.push(i);
  }

  // =========================================
  // Highlight Logic
  // =========================================

  const highlightedProjects = useMemo(() => {
    const now = new Date();

    // ONLY non-completed projects
    const currentMonthProjects = Array.isArray(projects)
      ? projects.filter((project) => {
          const end = new Date(project.endDate);

          return (
            project.status !== "COMPLETED" &&
            end.getMonth() === currentDate.getMonth() &&
            end.getFullYear() === currentDate.getFullYear()
          );
        })
      : [];

    if (!currentMonthProjects.length) return [];

    // Overdue unfinished projects
    const overdueProjects = currentMonthProjects.filter(
      (project) => {
        const end = new Date(project.endDate);

        return end < now;
      }
    );

    // Show all overdue projects
    if (overdueProjects.length > 0) {
      return overdueProjects;
    }

    // Upcoming projects
    const upcomingProjects = currentMonthProjects.filter(
      (project) => {
        const end = new Date(project.endDate);

        return end >= now;
      }
    );

    if (!upcomingProjects.length) return [];

    // Closest upcoming deadline
    const sortedProjects = [...upcomingProjects].sort(
      (a, b) => {
        return (
          new Date(a.endDate).getTime() -
          new Date(b.endDate).getTime()
        );
      }
    );

    return [sortedProjects[0]];
  }, [projects, currentDate]);

  return (
    <div className="w-[450px] h-105 rounded-[28px] bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5F5F7] transition hover:bg-[#ECECEF]"
        >
          <ChevronLeft className="h-4 w-4 text-[#1F1F1F]" />
        </button>

        <h2 className="text-[18px] font-semibold text-[#111111]">
          {month}, {year}
        </h2>

        <button
          onClick={nextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5F5F7] transition hover:bg-[#ECECEF]"
        >
          <ChevronRight className="h-4 w-4 text-[#1F1F1F]" />
        </button>
      </div>

      {/* Week Days */}
      <div className="mb-5 grid grid-cols-7 rounded-2xl bg-[#F5F5F7] p-3">
        {days.map((day, index) => (
          <div
            key={`${day}-${index}`}
            className="flex h-7 items-center justify-center text-[12px] font-medium text-[#7A7A7A]"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-7 gap-y-3">
        {dates.map((date, index) => {
          const matchedProject =
            highlightedProjects.find(
              (project) =>
                new Date(project.endDate).getDate() === date
            );

          const isHighlighted = !!matchedProject;

          return (
            <div
              key={index}
              className="relative flex items-center justify-center"
            >
              {date ? (
                <div
                  onMouseEnter={() => {
                    if (matchedProject) {
                      setHoveredProject(matchedProject);
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredProject(null);
                  }}
                  className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[13px] font-medium transition
                    ${
                      isHighlighted
                        ? "bg-[#FFAE58] text-[#111111]"
                        : "text-[#4A4A4A] hover:bg-[#F5F5F7]"
                    }
                  `}
                >
                  {date}
                </div>
              ) : (
                <div className="h-8 w-8" />
              )}

              {/* Tooltip */}
              {hoveredProject?.id === matchedProject?.id &&
                matchedProject && (
                  <div className="absolute bottom-12 left-1/2 z-50 w-[260px] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#1F1F2E] p-4 shadow-2xl">
                    
                    {/* Top */}
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-white">
                          {matchedProject.title}
                        </h3>

                        <p className="mt-1 text-[11px] text-[#9CA3AF]">
                          Deadline Project
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold
                        ${
                          matchedProject.status === "IN_PROGRESS"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-red-500/20 text-red-300"
                        }
                      `}
                      >
                        {matchedProject.status}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                        <span className="text-[11px] text-[#9CA3AF]">
                          Deadline
                        </span>

                        <span className="text-[11px] font-medium text-white">
                          {new Date(
                            matchedProject.endDate
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                        <span className="text-[11px] text-[#9CA3AF]">
                          Progress
                        </span>

                        <span className="text-[11px] font-medium text-white">
                          {matchedProject.progress ?? 0}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                        <span className="text-[11px] text-[#9CA3AF]">
                          Phase
                        </span>

                        <span className="text-[11px] font-medium text-white">
                          {matchedProject.currentPhase || "N/A"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                        <span className="text-[11px] text-[#9CA3AF]">
                          Priority
                        </span>

                        <span
                          className={`text-[11px] font-semibold
                          ${
                            matchedProject.priority === "HIGH"
                              ? "text-red-400"
                              : matchedProject.priority === "MEDIUM"
                              ? "text-yellow-400"
                              : "text-green-400"
                          }
                        `}
                        >
                          {matchedProject.priority || "LOW"}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 rotate-45 border-r border-b border-white/10 bg-[#1F1F2E]" />
                  </div>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
}