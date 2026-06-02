"use client";
import Link from "next/link";

const TABS = [
  "Overview","Kanban", "Credentials",
  "Milestones", "Assets", "Report Issue", "Report Issue To Management", "Chat", "Payout"
];

export default function ProjectTabs({ activeTab, setActiveTab }: any) {
  return (
    <div className="flex items-center gap-4 border-b border-[var(--border)] bg-white">
      <Link href="/dashboard/project" className="p-2 hover:bg-[var(--primary-light)] rounded-lg transition-colors shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4B4B4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </Link>

      <div className="flex gap-1 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-4 text-sm  whitespace-nowrap transition-all duration-150
                ${isActive
                  ? "text-[var(--primary)] font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
            >
              {tab}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--primary)] rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
