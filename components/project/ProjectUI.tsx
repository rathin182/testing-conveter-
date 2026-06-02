import Link from "next/link";
import { Calendar } from "lucide-react";

export interface Project {
  id: string;
  title: string;
  description: string;
  budget?: number;
  earnings?: number;
  status: string;
  progress: number;
  instruments: string[];
  startDate?: string;
  endDate?: string;
  createdAt: string;
  advancePaid?: boolean;
  isFinalPaymentMade?: boolean;
}

export interface User {
  name: string;
  email: string;
}

export const STATUS_META: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-600" },
  AWAITING_ADVANCE: { label: "Awaiting Advance", color: "bg-yellow-100 text-yellow-700" },
  SEARCHING: { label: "Searching Engineer", color: "bg-blue-100 text-blue-700" },
  IN_PROGRESS: { label: "In Progress", color: "bg-green-100 text-green-700" },
  IN_REVIEW: { label: "In Review", color: "bg-purple-100 text-purple-700" },
  AWAITING_FINAL_PAYMENT: { label: "Awaiting Final Payment", color: "bg-orange-100 text-orange-700" },
  COMPLETED: { label: "Completed", color: "bg-emerald-100 text-emerald-700" },
  CANCELED: { label: "Canceled", color: "bg-red-100 text-red-600" },
};

export function StatusBadge({ status }: { status: string }) {
  if (status === "AWAITING_ADVANCE") return null;
  const meta = STATUS_META[status] ?? { label: status, color: "bg-gray-100 text-gray-600" };
  return (
    <span className={`text-[10px] font-semibold  px-2 py-0.5 rounded-full ${meta.color}`}>
      {meta.label}
    </span>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  const amount = project.budget;

  return (
    <Link href={`/client/project/${project.id}`}>
      <div className="bg-white border border-[var(--border)] rounded-xl p-5 hover:shadow-md hover:border-[var(--primary)] transition-all cursor-pointer group h-full flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-sm font-bold  text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
              {project.title}
            </h3>
            <StatusBadge status={project.status} />
          </div>

          <p className="text-xs  text-[var(--text-muted)] line-clamp-2 mb-4 leading-relaxed">
            {project.description}
          </p>

          {project.instruments?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {project.instruments.slice(0, 3).map((inst) => (
                <span key={inst} className="text-[10px]  px-2 py-0.5 bg-[var(--primary-light)] text-[var(--primary)] border border-[#ffd9a8] rounded-full">
                  {inst}
                </span>
              ))}
              {project.instruments.length > 3 && (
                <span className="text-[10px]  text-[var(--text-muted)]">+{project.instruments.length - 3}</span>
              )}
            </div>
          )}

          <div className="mb-4">
            <div className="flex justify-between text-[10px]  text-[var(--text-muted)] mb-1">
              <span>Progress</span>
              <span className="font-semibold text-[var(--text-primary)]">{project.progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-[var(--bg)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${project.progress}%`, background: "var(--primary)" }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-1 text-[10px]  text-[var(--text-muted)]">
            <Calendar size={11} />
            {new Date(project.createdAt).toLocaleDateString()}
          </div>
          {amount !== undefined && (
            <span className="text-xs font-bold  text-[var(--text-primary)]">
              Budget: ₹{amount.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}