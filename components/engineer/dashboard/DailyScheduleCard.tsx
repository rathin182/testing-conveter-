"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  CircleDashed,
} from "lucide-react";

interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
}

interface Project {
  kanbanTasks?: KanbanTask[];
}

interface DailyScheduleCardProps {
  projectsData: {
    projects: Project[];
  };
}

export default function DailyScheduleCard({
  projectsData,
}: DailyScheduleCardProps) {

  // Get all tasks and sort by closest due date
  const tasks =
    projectsData?.projects
      ?.flatMap(
        (project: Project) =>
          project.kanbanTasks || []
      )

      // Closest date first
      ?.sort(
        (a: KanbanTask, b: KanbanTask) =>
          new Date(a.dueDate).getTime() -
          new Date(b.dueDate).getTime()
      )

      // Max items
      ?.slice(0, 3) || [];

  const getPriorityColor = (
    priority: string
  ) => {
    switch (priority) {
      case "HIGH":
        return "bg-[#FFE7E7] text-[#EF4444]";

      case "MEDIUM":
        return "bg-[#FFF4DD] text-[#F59E0B]";

      default:
        return "bg-[#EEF7D4] text-[#7BA10A]";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <CheckCircle2
            size={22}
            className="text-[#22C55E]"
          />
        );

      case "IN_PROGRESS":
        return (
          <Clock3
            size={22}
            className="text-[#F59E0B]"
          />
        );

      default:
        return (
          <CircleDashed
            size={22}
            className="text-[#6366F1]"
          />
        );
    }
  };

  const getStatusBg = (
    status: string
  ) => {
    switch (status) {
      case "COMPLETED":
        return "bg-[#EAFBF0]";

      case "IN_PROGRESS":
        return "bg-[#FFF4DD]";

      default:
        return "bg-[#EEF2FF]";
    }
  };

  return (
    <div className="rounded-[32px] bg-white h-92 p-6">

      {/* Header */}
      <div className="mb-7 flex items-center justify-between">

        <h3 className="text-[34px] font-semibold tracking-[-1px] text-[#111111]">
          Daily Schedule
        </h3>

        <div className="flex h-11 min-w-11 items-center justify-center rounded-full bg-[#F5F5F5] px-4 text-[15px] font-semibold text-[#666666]">
          {tasks.length}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">

        {tasks.length > 0 ? (
          tasks.map((task: KanbanTask) => (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-[28px] bg-[#FAFAFA] p-4 transition-all duration-200 hover:bg-[#F5F5F5]"
            >

              {/* Left */}
              <div className="flex min-w-0 w-full items-center gap-4">

                {/* Icon */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[22px] ${getStatusBg(
                    task.status
                  )}`}
                >
                  {getStatusIcon(task.status)}
                </div>

                {/* Content */}
                <div className="min-w-0 flex items-center gap-4 justify-between w-full">

                  <div>
                    <h4 className="truncate text-[18px] font-semibold text-[#18181B]">
                    {task.title}
                  </h4>
                  </div>

                  <div className=" flex items-center  gap-3">

                    {/* Priority */}
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>

                    {/* Date */}
                    <p className="text-[15px] text-[#71717A]">
                      {new Date(
                        task.dueDate
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Arrow */}
              {/* <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3F3F3] transition-all hover:bg-[#EBEBEB]">
                <ArrowRight
                  size={18}
                  className="text-[#111111]"
                />
              </button> */}
            </div>
          ))
        ) : (
          <div className="flex h-[300px] flex-col items-center justify-center rounded-[28px] bg-[#FAFAFA]">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
              <Clock3
                size={28}
                className="text-[#999999]"
              />
            </div>

            <h4 className="mt-5 text-[20px] font-semibold text-[#222222]">
              No Tasks Available
            </h4>

            <p className="mt-1 text-[14px] text-[#8A8A8A]">
              No kanban tasks found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}